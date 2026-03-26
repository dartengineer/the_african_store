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

module.exports = router


