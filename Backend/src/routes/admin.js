const express = require('express')
const router = express.Router()
const User = require('../models/User')
const VendorProfile = require('../models/VendorProfile')
const Product = require('../models/Product')
const Order = require('../models/Order')
const { protect, authorize } = require('../middleware/auth')

// All admin routes require admin role
router.use(protect, authorize('admin'))

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalVendors, pendingVendors, totalProducts, totalOrders, revenueData] =
      await Promise.all([
        User.countDocuments(),
        VendorProfile.countDocuments({ isApproved: true }),
        VendorProfile.countDocuments({ isApproved: false }),
        Product.countDocuments({ isActive: true }),
        Order.countDocuments({ paymentStatus: 'paid' }),
        Order.aggregate([
          { $match: { paymentStatus: 'paid' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
      ])

    const totalRevenue = revenueData[0]?.total || 0

    res.json({
      totalUsers,
      totalVendors,
      pendingVendors,
      totalProducts,
      totalOrders,
      totalRevenue: Math.round(totalRevenue * 0.07), // platform 7% commission
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/admin/vendors/pending
router.get('/vendors/pending', async (req, res) => {
  try {
    const vendors = await VendorProfile.find({ isApproved: false })
      .populate('userId', 'name email phone state createdAt')
      .sort({ createdAt: 1 })
    res.json({ vendors })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/admin/vendors/:id/approve
router.patch('/vendors/:id/approve', async (req, res) => {
  try {
    const vendor = await VendorProfile.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).populate('userId', 'name email')

    if (!vendor) return res.status(404).json({ message: 'Vendor not found' })
    // TODO: send approval email notification here
    res.json({ vendor, message: `${vendor.storeName} approved` })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/admin/vendors/:id/reject
router.patch('/vendors/:id/reject', async (req, res) => {
  try {
    const vendor = await VendorProfile.findByIdAndUpdate(
      req.params.id,
      { isApproved: false },
      { new: true }
    )
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' })
    res.json({ vendor, message: 'Vendor rejected' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { role, page = 1, limit = 30 } = req.query
    const query = role ? { role } : {}
    const skip = (Number(page) - 1) * Number(limit)
    const total = await User.countDocuments(query)
    const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit))
    res.json({ users, total, totalPages: Math.ceil(total / Number(limit)) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/admin/products/:id/feature
router.patch('/products/:id/feature', async (req, res) => {
  try {
    const { featured } = req.body
    const product = await Product.findByIdAndUpdate(req.params.id, { featured }, { new: true })
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json({ product })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/admin/orders  — all orders
router.get('/orders', async (req, res) => {
  try {
    const { status, page = 1, limit = 30 } = req.query
    const query = {}
    if (status) query.deliveryStatus = status
    const skip = (Number(page) - 1) * Number(limit)
    const total = await Order.countDocuments(query)
    const orders = await Order.find(query)
      .populate('buyerId', 'name email phone')
      .populate('items.productId', 'name price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
    res.json({ orders, total, totalPages: Math.ceil(total / Number(limit)) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
