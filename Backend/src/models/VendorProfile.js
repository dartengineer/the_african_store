const mongoose = require('mongoose')

const vendorProfileSchema = new mongoose.Schema({
  userId:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  storeName:        { type: String, required: true, trim: true },
  storeDescription: { type: String },
  state:            { type: String, required: true },
  phone:            { type: String },
  rating:           { type: Number, default: 0, min: 0, max: 5 },
  totalReviews:     { type: Number, default: 0 },
  isApproved:       { type: Boolean, default: false },
  isSuspended:      { type: Boolean, default: false },
  suspensionReason: { type: String }, // Optional reason for suspension
  commissionRate:   { type: Number, default: 7 }, // percent
  bankDetails: {
    bankName:      String,
    accountNumber: String,
    accountName:   String,
  },
}, { timestamps: true })

module.exports = mongoose.model('VendorProfile', vendorProfileSchema)
