import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/layout/Layout'
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi'

export default function Company() {
  return (
    <>
      <Head>
        <title>Company — The African Store</title>
        <meta name="description" content="Contact and information about The African Store - your trusted platform for African fabrics." />
      </Head>
      <Layout>
        <div className="min-h-screen">
          {/* Header */}
          <section className="bg-gradient-to-r from-brown-deep/50 to-transparent py-16 px-6 mb-12 border-b border-gold/10">
            <div className="max-w-4xl mx-auto">
              <div className="section-eyebrow">About TAS</div>
              <h1 className="font-serif text-5xl text-cream mb-4">
                The <em className="text-gold italic">African Store</em>
              </h1>
              <p className="text-lg text-[#A89060]">
                Building Africa's premier fabric marketplace, one transaction at a time.
              </p>
            </div>
          </section>

          <div className="max-w-4xl mx-auto px-6 pb-16">
            {/* Company Info */}
            <div className="grid md:grid-cols-2 gap-12 mb-16">
              <div>
                <h2 className="font-serif text-2xl text-cream mb-6">Who We Are</h2>
                <p className="text-[#A89060] leading-relaxed mb-4">
                  The African Store is a digital marketplace dedicated to connecting buyers with verified fabric vendors across Nigeria and beyond. Founded on the principles of transparency, quality, and community empowerment, we've built a platform that celebrates African textile heritage while enabling seamless, secure commerce.
                </p>
                <p className="text-[#A89060] leading-relaxed mb-4">
                  Our technology stack combines modern web standards with deep understanding of African market dynamics, creating an intuitive platform that works for everyone — from individual buyers to established vendors.
                </p>
              </div>

              <div className="card p-8">
                <h3 className="font-serif text-xl text-cream mb-6">Quick Facts</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-gold font-medium">Platform Type</p>
                    <p className="text-[#A89060]">E-Commerce Marketplace</p>
                  </div>
                  <div>
                    <p className="text-gold font-medium">Primary Market</p>
                    <p className="text-[#A89060]">Nigeria (Nationwide Delivery)</p>
                  </div>
                  <div>
                    <p className="text-gold font-medium">Product Category</p>
                    <p className="text-[#A89060]">African Fabrics (Ankara, Lace, Senator, Aso-Oke, Kente, Adire)</p>
                  </div>
                  <div>
                    <p className="text-gold font-medium">Payment Method</p>
                    <p className="text-[#A89060]">Secure Paystack Integration</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Features */}
            <section className="mb-16">
              <h2 className="font-serif text-3xl text-cream mb-8">What We Offer</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: 'For Buyers',
                    items: [
                      'Browse thousands of fabric listings',
                      'Secure payment processing',
                      'Post custom fabric requests',
                      'Vendor ratings and reviews',
                      'Order tracking',
                      'Nationwide delivery',
                    ]
                  },
                  {
                    title: 'For Vendors',
                    items: [
                      'Verified shop profiles',
                      'Product listing management',
                      'Order dashboard',
                      'Customer analytics',
                      'Direct request responses',
                      'Built-in payment collection',
                    ]
                  },
                  {
                    title: 'For Admins',
                    items: [
                      'Vendor approval system',
                      'Platform compliance monitoring',
                      'Order management',
                      'User management',
                      'Approval workflows',
                      'Platform analytics',
                    ]
                  },
                  {
                    title: 'For Everyone',
                    items: [
                      'Secure authentication',
                      'Intuitive interface',
                      'Mobile-responsive design',
                      'Professional support',
                      'Transparent pricing',
                      'Community-driven growth',
                    ]
                  },
                ].map((section, i) => (
                  <div key={i} className="card p-6">
                    <h3 className="font-serif text-lg text-cream mb-4">{section.title}</h3>
                    <ul className="space-y-2">
                      {section.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-[#A89060]">
                          <span className="text-gold mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Contact & Support */}
            <section className="mb-16">
              <h2 className="font-serif text-3xl text-cream mb-8">Get In Touch</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="card p-6 text-center">
                  <FiMail className="text-gold mx-auto mb-4" size={24} />
                  <h3 className="font-serif text-lg text-cream mb-2">Email</h3>
                  <a href="mailto:support@theafricanstore.com" className="text-gold hover:text-cream text-sm">
                    support@theafricanstore.com
                  </a>
                </div>
                <div className="card p-6 text-center">
                  <FiPhone className="text-gold mx-auto mb-4" size={24} />
                  <h3 className="font-serif text-lg text-cream mb-2">Phone</h3>
                  <a href="tel:+2348000000000" className="text-gold hover:text-cream text-sm">
                    +234 800 000 0000
                  </a>
                </div>
                <div className="card p-6 text-center">
                  <FiMapPin className="text-gold mx-auto mb-4" size={24} />
                  <h3 className="font-serif text-lg text-cream mb-2">Location</h3>
                  <p className="text-[#A89060] text-sm">
                    Lagos, Nigeria<br />
                    Serving Nigeria-wide
                  </p>
                </div>
              </div>
            </section>

            {/* Navigation */}
            <section className="grid md:grid-cols-3 gap-6">
              <div className="card p-6">
                <h3 className="font-serif text-lg text-cream mb-4">Learn More</h3>
                <ul className="space-y-2">
                  <li><Link href="/about" className="text-gold hover:text-cream text-sm">About Us</Link></li>
                  <li><Link href="/company" className="text-gold hover:text-cream text-sm">Company Info</Link></li>
                </ul>
              </div>
              <div className="card p-6">
                <h3 className="font-serif text-lg text-cream mb-4">Get Started</h3>
                <ul className="space-y-2">
                  <li><Link href="/shop" className="text-gold hover:text-cream text-sm">Browse Fabrics</Link></li>
                  <li><Link href="/auth/register" className="text-gold hover:text-cream text-sm">Create Account</Link></li>
                </ul>
              </div>
              <div className="card p-6">
                <h3 className="font-serif text-lg text-cream mb-4">For Vendors</h3>
                <ul className="space-y-2">
                  <li><Link href="/auth/register?role=vendor" className="text-gold hover:text-cream text-sm">Become a Vendor</Link></li>
                  <li><Link href="/vendor/dashboard" className="text-gold hover:text-cream text-sm">Vendor Portal</Link></li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </Layout>
    </>
  )
}
