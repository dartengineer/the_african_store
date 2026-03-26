/**
 * Script to create the first admin user directly in MongoDB
 * Run: node scripts/create-admin.js
 */

require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../src/models/User')

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Connected to MongoDB')

    // Admin credentials (update these)
    const adminData = {
      name: 'Adeyemi Favour Oluwapelumi',
      email: 'adeyemipelumi201@gmail.com',
      password: 'Adeyemi$$$2001?', // Change this!
      role: 'admin',
      state: 'Lagos',
      phone: '+2347037110440',
      verified: true,
    }

    // Check if admin already exists
    const existing = await User.findOne({ email: adminData.email })
    if (existing) {
      console.log('⚠️  Admin with this email already exists')
      process.exit(0)
    }

    // Create admin (password will be hashed automatically by User schema)
    const admin = await User.create(adminData)
    console.log('✅ Admin user created successfully!')
    console.log('📧 Email:', admin.email)
    console.log('🔐 Password: SecurePassword123! (Change this on first login)')
    console.log('👤 ID:', admin._id)

    process.exit(0)
  } catch (err) {
    console.error('❌ Error creating admin:', err.message)
    process.exit(1)
  }
}

createAdmin()
