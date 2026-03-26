const express = require('express')
const router = express.Router()
const axios = require('axios')
const Order = require('../models/Order')
const Product = require('../models/Product')
const { protect, authorize } = require('../middleware/auth')

// POST /api/orders  — buyer creates order
router.post('/', protect, authorize('buyer'), async (req, res) => {
  try {
    const { items, deliveryAddress } = req.body

    // Validate products and compute real prices
    let totalAmount = 0
    const validatedItems = []

    for (const item of items) {
      const product = await Product.findById(item.productId)
      if (!product || !product.isActive) {
        return res.status(400).json({ message: `Product ${item.productId} is no longer available` })
      }
      if (product.quantityAvailable < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` })
      }
      validatedItems.push({ productId: product._id, quantity: item.quantity, price: product.price })
      totalAmount += product.price * item.quantity
    }

    // Add 5% platform fee
    const finalAmount = Math.round(totalAmount * 1.05)

    const order = await Order.create({
      buyerId: req.user._id,
      items: validatedItems,
      totalAmount: finalAmount,
      deliveryAddress,
    })

    res.status(201).json({ order })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// POST /api/orders/:id/verify-payment  — verify Paystack payment
router.post('/:id/verify-payment', protect, async (req, res) => {
  try {
    const { reference } = req.body
    const order = await Order.findOne({ _id: req.params.id, buyerId: req.user._id })
    if (!order) return res.status(404).json({ message: 'Order not found' })
    if (order.paymentStatus === 'paid') return res.json({ order, message: 'Already paid' })

    // Verify with Paystack
    const { data } = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    )

    if (data.data.status !== 'success') {
      return res.status(400).json({ message: 'Payment not successful' })
    }

    // Verify amount matches (Paystack returns kobo)
    const paidAmount = data.data.amount / 100
    if (paidAmount < order.totalAmount) {
      return res.status(400).json({ message: 'Payment amount mismatch' })
    }

    // Update order
    order.paymentStatus = 'paid'
    order.deliveryStatus = 'processing'
    order.paymentReference = reference
    await order.save()

    // Decrement stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { quantityAvailable: -item.quantity, totalSold: item.quantity }
      })
    }

    res.json({ order, message: 'Payment verified. Order is being processed.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/orders/:id/confirm-delivery  — buyer confirms delivery (releases escrow)
router.patch('/:id/confirm-delivery', protect, authorize('buyer'), async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, buyerId: req.user._id })
    if (!order) return res.status(404).json({ message: 'Order not found' })
    if (order.deliveryStatus !== 'shipped') {
      return res.status(400).json({ message: 'Order has not been shipped yet' })
    }

    order.deliveryStatus = 'delivered'
    order.deliveryConfirmedAt = new Date()
    await order.save()

    // TODO: Trigger vendor payout via Paystack Transfer API here

    res.json({ order, message: 'Delivery confirmed. Payment will be released to vendor.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/orders/my  — buyer's own orders
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.user._id })
      .populate('items.productId', 'name images price')
      .sort({ createdAt: -1 })
    res.json({ orders })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/orders/:id  — single order
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyerId', 'name email phone')
      .populate('items.productId', 'name images price vendorId')
    if (!order) return res.status(404).json({ message: 'Order not found' })

    // Buyers can only see their own orders; vendors can see orders containing their products
    if (
      req.user.role === 'buyer' &&
      order.buyerId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' })
    }

    res.json({ order })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
