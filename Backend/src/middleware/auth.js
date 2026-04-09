const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Verify JWT and attach user to req
exports.protect = async (req, res, next) => {
  try {
    let token = null
    
    // Try to get token from Authorization header first
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    }
    
    // Fallback to cookie if no Authorization header
    if (!token && req.cookies && req.cookies.tas_token) {
      token = req.cookies.tas_token
    }
    
    if (!token) {
      return res.status(401).json({ message: 'Not authorised. Please sign in.' })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-password')
    if (!req.user) return res.status(401).json({ message: 'User no longer exists' })
    next()
  } catch (err) {
    console.error('Auth error:', err.message)
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

// Role-based access
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: `Access denied for role: ${req.user.role}` })
  }
  next()
}
