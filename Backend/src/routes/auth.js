const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const VendorProfile = require('../models/VendorProfile')
const { protect } = require('../middleware/auth')

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30m' })

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id)
  
  // Set HTTP-only secure cookie (for production with HTTPS)
  const isProduction = process.env.NODE_ENV === 'production'
  res.cookie('tas_token', token, {
    httpOnly: true,              // Prevent XSS attacks
    secure: isProduction,        // Only send over HTTPS in production
    sameSite: isProduction ? 'Lax' : 'Lax',  // Cross-site cookie policy
    maxAge: (process.env.JWT_EXPIRE === '30m' ? 30 * 60 : 60 * 60) * 1000, // Match JWT expiry
    path: '/',
  })
  
  // Also send token in response for localStorage fallback
  res.status(statusCode).json({ token, user })
}

// POST /api/auth/register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isIn(['buyer', 'vendor']).withMessage('Role must be buyer or vendor'),
  body('state').notEmpty().withMessage('State is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

  try {
    const { name, email, password, role, state, phone } = req.body
    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ message: 'Email already registered' })

    const user = await User.create({ name, email, password, role, state, phone })

    // If vendor, create a pending profile
    if (role === 'vendor') {
      await VendorProfile.create({
        userId: user._id,
        storeName: `${name}'s Store`,
        state,
        phone,
        isApproved: false,
      })
    }

    sendToken(user, 201, res)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

  try {
    const { email, password } = req.body
    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Check if vendor is suspended
    if (user.role === 'vendor') {
      const vendorProfile = await VendorProfile.findOne({ userId: user._id })
      if (vendorProfile && vendorProfile.isSuspended) {
        return res.status(403).json({ 
          message: `Your vendor account has been suspended. Reason: ${vendorProfile.suspensionReason || 'Contact admin for more details'}` 
        })
      }
    }

    sendToken(user, 200, res)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    res.json({ user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/auth/profile
router.patch('/profile', protect, async (req, res) => {
  try {
    const { name, phone, state } = req.body
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, state },
      { new: true, runValidators: true }
    )
    res.json({ user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/auth/create-admin (Protected - requires existing admin)
router.post('/create-admin', protect, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('state').notEmpty().withMessage('State is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
], async (req, res) => {
  try {
    // Only existing admins can create new admins
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create admin accounts' })
    }

    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

    const { name, email, password, state, phone } = req.body
    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ message: 'Email already registered' })

    const admin = await User.create({
      name,
      email,
      password,
      role: 'admin',
      state,
      phone,
      verified: true, // Auto-verify admins
    })

    sendToken(admin, 201, res)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
