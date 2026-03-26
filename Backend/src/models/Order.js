const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')

const orderSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity:  { type: Number, required: true },
    price:     { type: Number, required: true },
  }],
  totalAmount:      { type: Number, required: true },
  paymentStatus:    { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  paymentReference: { type: String, default: () => `TAS-${uuidv4().slice(0, 8).toUpperCase()}` },
  deliveryStatus:   { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  deliveryAddress: {
    street:  String,
    city:    String,
    state:   String,
    country: { type: String, default: 'Nigeria' },
  },
  logisticsCompany:   String,
  trackingNumber:     String,
  deliveryConfirmedAt: Date,
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)
