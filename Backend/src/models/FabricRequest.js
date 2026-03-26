const mongoose = require('mongoose')

const fabricRequestSchema = new mongoose.Schema({
  buyerId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  images:      [{ type: String }],
  budgetRange: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
  },
  state:  { type: String, required: true },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  vendorOffers: [{
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorProfile' },
    price:    { type: Number, required: true },
    message:  { type: String, required: true },
    status:   { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    createdAt:{ type: Date, default: Date.now },
  }],
}, { timestamps: true })

module.exports = mongoose.model('FabricRequest', fabricRequestSchema)
