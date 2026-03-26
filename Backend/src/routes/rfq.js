const express = require('express')
const router = express.Router()
const FabricRequest = require('../models/FabricRequest')
const VendorProfile = require('../models/VendorProfile')
const { protect, authorize } = require('../middleware/auth')

// GET /api/rfq  — list requests (public)
router.get('/', async (req, res) => {
  try {
    const { status = 'open', state, page = 1, limit = 20 } = req.query
    const query = { status }
    if (state) query.state = state

    const skip = (Number(page) - 1) * Number(limit)
    const total = await FabricRequest.countDocuments(query)
    const requests = await FabricRequest.find(query)
      .populate('buyerId', 'name state')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    res.json({ requests, total, totalPages: Math.ceil(total / Number(limit)) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/rfq/:id  — single request with offers
router.get('/:id', async (req, res) => {
  try {
    const request = await FabricRequest.findById(req.params.id)
      .populate('buyerId', 'name state')
      .populate('vendorOffers.vendorId', 'storeName rating state')
    if (!request) return res.status(404).json({ message: 'Request not found' })
    res.json({ request })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/rfq  — buyer creates a request
router.post('/', protect, authorize('buyer'), async (req, res) => {
  try {
    const { description, budgetRange, state, images } = req.body
    if (!budgetRange?.min || !budgetRange?.max) {
      return res.status(400).json({ message: 'Budget range (min and max) is required' })
    }
    const request = await FabricRequest.create({
      buyerId: req.user._id,
      description,
      budgetRange,
      state,
      images: images || [],
    })
    res.status(201).json({ request })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// POST /api/rfq/:id/offer  — vendor submits an offer
router.post('/:id/offer', protect, authorize('vendor'), async (req, res) => {
  try {
    const { price, message } = req.body
    if (!price || !message) {
      return res.status(400).json({ message: 'Price and message are required' })
    }

    const vendorProfile = await VendorProfile.findOne({ userId: req.user._id })
    if (!vendorProfile?.isApproved) {
      return res.status(403).json({ message: 'Your vendor account is pending approval' })
    }

    const request = await FabricRequest.findById(req.params.id)
    if (!request) return res.status(404).json({ message: 'Request not found' })
    if (request.status === 'closed') return res.status(400).json({ message: 'This request is already closed' })

    // Prevent duplicate offers from same vendor
    const alreadyOffered = request.vendorOffers.some(
      (o) => o.vendorId.toString() === vendorProfile._id.toString()
    )
    if (alreadyOffered) return res.status(400).json({ message: 'You have already submitted an offer for this request' })

    request.vendorOffers.push({ vendorId: vendorProfile._id, price, message })
    await request.save()

    const updated = await FabricRequest.findById(request._id)
      .populate('vendorOffers.vendorId', 'storeName rating state')
    res.status(201).json({ request: updated })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// PATCH /api/rfq/:id/offer/:offerId/accept  — buyer accepts an offer
router.patch('/:id/offer/:offerId/accept', protect, authorize('buyer'), async (req, res) => {
  try {
    const request = await FabricRequest.findOne({ _id: req.params.id, buyerId: req.user._id })
    if (!request) return res.status(404).json({ message: 'Request not found or not yours' })
    if (request.status === 'closed') return res.status(400).json({ message: 'Request already closed' })

    const offer = request.vendorOffers.id(req.params.offerId)
    if (!offer) return res.status(404).json({ message: 'Offer not found' })

    offer.status = 'accepted'
    request.status = 'closed'
    await request.save()

    const updated = await FabricRequest.findById(request._id)
      .populate('buyerId', 'name state')
      .populate('vendorOffers.vendorId', 'storeName rating state')

    res.json({ request: updated, message: 'Offer accepted. Contact the vendor to proceed.' })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// DELETE /api/rfq/:id  — buyer closes/deletes own request
router.delete('/:id', protect, authorize('buyer'), async (req, res) => {
  try {
    const request = await FabricRequest.findOneAndDelete({ _id: req.params.id, buyerId: req.user._id })
    if (!request) return res.status(404).json({ message: 'Request not found or not yours' })
    res.json({ message: 'Request removed' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
