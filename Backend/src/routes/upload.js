const express = require('express')
const router = express.Router()
const { upload } = require('../config/cloudinary')
const { protect, authorize } = require('../middleware/auth')

// POST /api/upload  — upload up to 5 product images (vendor only)
router.post(
  '/',
  protect,
  authorize('vendor'),
  upload.array('images', 5),
  (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' })
      }
      const urls = req.files.map((f) => f.path) // Cloudinary URL
      res.status(201).json({ urls, count: urls.length })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }
)

module.exports = router
