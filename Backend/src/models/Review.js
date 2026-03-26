const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  vendorId:  { type: mongoose.Schema.Types.ObjectId, ref: 'VendorProfile', required: true },
  buyerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  rating:    { type: Number, required: true, min: 1, max: 5 },
  comment:   { type: String, maxlength: 500 },
}, { timestamps: true })

// One review per order
reviewSchema.index({ orderId: 1, buyerId: 1 }, { unique: true })

// Update vendor average rating after save
reviewSchema.post('save', async function () {
  const VendorProfile = require('./VendorProfile')
  const Review = this.constructor
  const stats = await Review.aggregate([
    { $match: { vendorId: this.vendorId } },
    { $group: { _id: '$vendorId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ])
  if (stats.length > 0) {
    await VendorProfile.findByIdAndUpdate(this.vendorId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].count,
    })
  }
})

module.exports = mongoose.model('Review', reviewSchema)
