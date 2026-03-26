const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  vendorId:          { type: mongoose.Schema.Types.ObjectId, ref: 'VendorProfile', required: true },
  name:              { type: String, required: true, trim: true },
  category:          { type: String, enum: ['ankara', 'lace', 'senator', 'aso-oke', 'kente', 'adire', 'other'], required: true },
  price:             { type: Number, required: true, min: 0 },
  bulkPrice:         { type: Number },
  description:       { type: String, required: true },
  images:            [{ type: String }],
  quantityAvailable: { type: Number, required: true, min: 0 },
  state:             { type: String },
  featured:          { type: Boolean, default: false },
  isActive:          { type: Boolean, default: true },
  totalSold:         { type: Number, default: 0 },
}, { timestamps: true })

// Text index for search
productSchema.index({ name: 'text', description: 'text', category: 'text' })

module.exports = mongoose.model('Product', productSchema)
