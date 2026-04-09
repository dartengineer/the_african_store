const express = require('express')
const router = express.Router()
const VendorProfile = require('../models/VendorProfile')
const Product = require('../models/Product')
const Order = require('../models/Order')
const Review = require('../models/Review')
const { protect, authorize } = require('../middleware/auth')

// Helper to get vendorProfile from logged-in user
const getProfile = async (userId) => VendorProfile.findOne({ userId })

// GET /api/vendor/profile  — get own vendor profile
router.get('/profile', protect, authorize('vendor'), async (req, res) => {
  try {
    const profile = await getProfile(req.user._id)
    if (!profile) return res.status(404).json({ message: 'Vendor profile not found' })
    res.json({ profile })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/vendor/profile  — update vendor profile
router.patch('/profile', protect, authorize('vendor'), async (req, res) => {
  try {
    const allowed = ['storeName', 'storeDescription', 'phone', 'bankDetails']
    const updates = {}
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f] })

    const profile = await VendorProfile.findOneAndUpdate(
      { userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    )
    res.json({ profile })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// GET /api/vendor/stats  — dashboard stats
router.get('/stats', protect, authorize('vendor'), async (req, res) => {
  try {
    const profile = await getProfile(req.user._id)
    if (!profile) return res.status(404).json({ message: 'Profile not found' })

    const [totalProducts, totalOrders, monthOrders] = await Promise.all([
      Product.countDocuments({ vendorId: profile._id, isActive: true }),
      Order.countDocuments({
        'items.productId': { $in: await Product.find({ vendorId: profile._id }).distinct('_id') },
        paymentStatus: 'paid',
      }),
      Order.find({
        'items.productId': { $in: await Product.find({ vendorId: profile._id }).distinct('_id') },
        paymentStatus: 'paid',
        createdAt: { $gte: new Date(new Date().setDate(1)) }, // first of this month
      }),
    ])

    const monthRevenue = monthOrders.reduce((sum, o) => sum + o.totalAmount, 0)

    res.json({
      totalProducts,
      totalOrders,
      monthRevenue: Math.round(monthRevenue * 0.93), // after 7% commission
      avgRating: profile.rating,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/vendor/products  — vendor's own products
router.get('/products', protect, authorize('vendor'), async (req, res) => {
  try {
    const profile = await getProfile(req.user._id)
    const products = await Product.find({ vendorId: profile._id }).sort({ createdAt: -1 })
    res.json({ products })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/vendor/products/:id  — fetch single product for editing (must be vendor's product)
router.get('/products/:id', protect, authorize('vendor'), async (req, res) => {
  try {
    console.log(`[Vendor Products GET] User: ${req.user._id}, Product ID: ${req.params.id}`)
    
    const profile = await getProfile(req.user._id)
    if (!profile) {
      console.log(`[Vendor Products GET] Vendor profile not found for user ${req.user._id}`)
      return res.status(404).json({ message: 'Vendor profile not found' })
    }
    
    console.log(`[Vendor Products GET] Vendor profile ID: ${profile._id}`)
    
    const product = await Product.findById(req.params.id)
    if (!product) {
      console.log(`[Vendor Products GET] Product not found: ${req.params.id}`)
      return res.status(404).json({ message: 'Product not found' })
    }
    
    console.log(`[Vendor Products GET] Product found. Vendor ID: ${product.vendorId}, Profile ID: ${profile._id}`)
    
    // Check that product belongs to this vendor
    if (product.vendorId.toString() !== profile._id.toString()) {
      console.log(`[Vendor Products GET] Product does not belong to vendor. Expected: ${profile._id}, Got: ${product.vendorId}`)
      return res.status(403).json({ message: 'This product does not belong to your vendor account' })
    }
    
    console.log(`[Vendor Products GET] Success! Returning product ${req.params.id}`)
    res.json({ product })
  } catch (err) {
    console.error('[Vendor Products GET] Error:', err)
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/vendor/products/:id  — vendor updates their product
router.patch('/products/:id', protect, authorize('vendor'), async (req, res) => {
  try {
    const profile = await getProfile(req.user._id)
    if (!profile) {
      return res.status(404).json({ message: 'Vendor profile not found' })
    }
    
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    
    // Check that product belongs to this vendor
    if (product.vendorId.toString() !== profile._id.toString()) {
      return res.status(403).json({ message: 'You can only update your own products' })
    }
    
    // Only allow certain fields to be updated
    const allowedUpdates = ['name', 'category', 'price', 'bulkPrice', 'description', 'quantityAvailable', 'featured']
    const updates = {}
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field]
      }
    })
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
    
    res.json({ product: updatedProduct })
  } catch (err) {
    console.error('Error updating vendor product:', err)
    res.status(400).json({ message: err.message })
  }
})

// POST /api/vendor/products  — vendor creates product
router.post('/products', protect, authorize('vendor'), async (req, res) => {
  try {
    const profile = await getProfile(req.user._id)
    if (!profile) {
      return res.status(404).json({ message: 'Vendor profile not found' })
    }
    
    if (!profile.isApproved) {
      return res.status(403).json({ message: 'Your vendor account is not approved yet' })
    }
    
    const product = await Product.create({
      ...req.body,
      vendorId: profile._id,
      state: profile.state,
      isActive: true
    })
    
    res.status(201).json({ product })
  } catch (err) {
    console.error('Error creating vendor product:', err)
    res.status(400).json({ message: err.message })
  }
})

// GET /api/vendor/orders  — orders containing vendor's products
router.get('/orders', protect, authorize('vendor'), async (req, res) => {
  try {
    const profile = await getProfile(req.user._id)
    const myProductIds = await Product.find({ vendorId: profile._id }).distinct('_id')

    const orders = await Order.find({
      'items.productId': { $in: myProductIds },
      paymentStatus: 'paid',
    })
      .populate('buyerId', 'name email phone state')
      .populate('items.productId', 'name images price')
      .sort({ createdAt: -1 })

    res.json({ orders })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/vendor/orders/:id/ship  — vendor marks order as shipped
router.patch('/orders/:id/ship', protect, authorize('vendor'), async (req, res) => {
  try {
    const { logisticsCompany, trackingNumber } = req.body
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ message: 'Order not found' })
    if (order.deliveryStatus !== 'processing') {
      return res.status(400).json({ message: 'Order is not in processing state' })
    }

    order.deliveryStatus = 'shipped'
    order.logisticsCompany = logisticsCompany
    order.trackingNumber = trackingNumber
    await order.save()

    res.json({ order, message: 'Order marked as shipped' })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// GET /api/vendor/reviews  — vendor's reviews
router.get('/reviews', protect, authorize('vendor'), async (req, res) => {
  try {
    const profile = await getProfile(req.user._id)
    const reviews = await Review.find({ vendorId: profile._id })
      .populate('buyerId', 'name')
      .populate('productId', 'name')
      .sort({ createdAt: -1 })
    res.json({ reviews, rating: profile.rating, totalReviews: profile.totalReviews })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ==================== PUBLIC ROUTES (must come BEFORE /:id catch-all) ====================

// GET /api/vendor/all  — public: list all approved vendors
router.get('/all', async (req, res) => {
  try {
    const { state, page = 1, limit = 20 } = req.query
    const query = { isApproved: true }
    if (state) query.state = state

    const skip = (Number(page) - 1) * Number(limit)
    const total = await VendorProfile.countDocuments(query)
    const vendors = await VendorProfile.find(query)
      .populate('userId', 'name')
      .sort({ rating: -1 })
      .skip(skip)
      .limit(Number(limit))

    res.json({ vendors, total, totalPages: Math.ceil(total / Number(limit)) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ==================== ADMIN-ONLY ROUTES ====================

// PATCH /api/vendor/:id/suspend  — admin: suspend a vendor
router.patch('/:id/suspend', protect, authorize('admin'), async (req, res) => {
  try {
    const { reason } = req.body
    const vendor = await VendorProfile.findById(req.params.id)
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' })

    vendor.isSuspended = true
    vendor.suspensionReason = reason || 'Suspended by admin'
    await vendor.save()

    // Optionally: Hide all their products
    await Product.updateMany(
      { vendorId: vendor._id },
      { isActive: false }
    )

    res.json({ vendor, message: 'Vendor suspended successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/vendor/:id/unsuspend  — admin: unsuspend a vendor
router.patch('/:id/unsuspend', protect, authorize('admin'), async (req, res) => {
  try {
    const vendor = await VendorProfile.findById(req.params.id)
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' })

    vendor.isSuspended = false
    vendor.suspensionReason = null
    await vendor.save()

    res.json({ vendor, message: 'Vendor unsuspended successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE /api/vendor/:id  — admin: delete a vendor
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const vendor = await VendorProfile.findByIdAndDelete(req.params.id)
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' })

    // Delete all products belonging to this vendor
    await Product.deleteMany({ vendorId: vendor._id })

    // Delete all reviews for this vendor
    await Review.deleteMany({ vendorId: vendor._id })

    res.json({ message: 'Vendor deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/vendor/:id  — public: get vendor profile by vendor ID (MUST BE LAST)
router.get('/:id', async (req, res) => {
  try {
    const vendorProfile = await VendorProfile.findById(req.params.id).populate('userId', 'name email phone')
    if (!vendorProfile) return res.status(404).json({ message: 'Vendor not found' })
    res.json({ vendorProfile })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router


