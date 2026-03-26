const express = require('express')
const router = express.Router()
const Product = require('../models/Product')
const VendorProfile = require('../models/VendorProfile')
const { protect, authorize } = require('../middleware/auth')

// GET /api/products  — public listing with filters
router.get('/', async (req, res) => {
  try {
    const { search, category, state, featured, sort, page = 1, limit = 12 } = req.query
    const query = { isActive: true }

    if (search) query.$text = { $search: search }
    if (category && category !== 'All') query.category = category
    if (state && state !== 'All States') query.state = state
    if (featured === 'true') query.featured = true

    const sortMap = {
      newest:     { createdAt: -1 },
      'price-asc': { price: 1 },
      'price-desc':{ price: -1 },
      rating:     { 'vendorId.rating': -1 },
    }
    const sortBy = sortMap[sort] || { createdAt: -1 }

    const skip = (Number(page) - 1) * Number(limit)
    const total = await Product.countDocuments(query)

    const products = await Product.find(query)
      .populate('vendorId', 'storeName rating state isApproved')
      .sort(sortBy)
      .skip(skip)
      .limit(Number(limit))
      // Only show products from approved vendors
      .then((prods) => prods.filter((p) => p.vendorId?.isApproved))

    res.json({
      products,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/products/:id  — single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('vendorId', 'storeName rating state isApproved storeDescription')
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.json({ product })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/products  — vendor creates product
router.post('/', protect, authorize('vendor'), async (req, res) => {
  try {
    const vendorProfile = await VendorProfile.findOne({ userId: req.user._id })
    if (!vendorProfile) return res.status(404).json({ message: 'Vendor profile not found' })
    if (!vendorProfile.isApproved) {
      return res.status(403).json({ message: 'Your vendor account is pending approval' })
    }

    const product = await Product.create({
      ...req.body,
      vendorId: vendorProfile._id,
      state: vendorProfile.state,
    })
    res.status(201).json({ product })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// PATCH /api/products/:id  — vendor updates own product
router.patch('/:id', protect, authorize('vendor'), async (req, res) => {
  try {
    const vendorProfile = await VendorProfile.findOne({ userId: req.user._id })
    const product = await Product.findOne({ _id: req.params.id, vendorId: vendorProfile._id })
    if (!product) return res.status(404).json({ message: 'Product not found or not yours' })

    const allowed = ['name', 'category', 'price', 'bulkPrice', 'description', 'images', 'quantityAvailable', 'featured']
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) product[field] = req.body[field]
    })
    await product.save()
    res.json({ product })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// DELETE /api/products/:id  — vendor soft-deletes product
router.delete('/:id', protect, authorize('vendor'), async (req, res) => {
  try {
    const vendorProfile = await VendorProfile.findOne({ userId: req.user._id })
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, vendorId: vendorProfile._id },
      { isActive: false },
      { new: true }
    )
    if (!product) return res.status(404).json({ message: 'Product not found or not yours' })
    res.json({ message: 'Product removed' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
