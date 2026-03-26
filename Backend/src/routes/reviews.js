const express = require('express')
const router = express.Router()
const Review = require('../models/Review')
const Order = require('../models/Order')
const VendorProfile = require('../models/VendorProfile')
const { protect, authorize } = require('../middleware/auth')

// POST /api/reviews  — buyer posts a review after delivery
router.post('/', protect, authorize('buyer'), async (req, res) => {
  try {
    const { vendorId, orderId, productId, rating, comment } = req.body

    // Verify order belongs to buyer and is delivered
    const order = await Order.findOne({ _id: orderId, buyerId: req.user._id, deliveryStatus: 'delivered' })
    if (!order) {
      return res.status(400).json({ message: 'You can only review orders that have been delivered' })
    }

    const existing = await Review.findOne({ orderId, buyerId: req.user._id })
    if (existing) return res.status(400).json({ message: 'You have already reviewed this order' })

    const review = await Review.create({ vendorId, buyerId: req.user._id, orderId, productId, rating, comment })
    res.status(201).json({ review })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// GET /api/reviews/vendor/:vendorId  — get reviews for a vendor
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const reviews = await Review.find({ vendorId: req.params.vendorId })
      .populate('buyerId', 'name')
      .populate('productId', 'name')
      .sort({ createdAt: -1 })
      .limit(50)
    res.json({ reviews })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
