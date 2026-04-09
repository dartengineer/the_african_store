import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import Layout from '@/components/layout/Layout'
import { FiChevronDown, FiSearch, FiMessageSquare, FiPhone, FiMail, FiArrowRight } from 'react-icons/fi'

interface FAQItem {
  question: string
  answer: string
  category: 'buyers' | 'vendors' | 'payments' | 'orders' | 'account'
}

const faqItems: FAQItem[] = [
  // Buyers
  {
    category: 'buyers',
    question: 'How do I create an account?',
    answer: 'Click "Get Started" on the homepage and select "Buyer" as your role. Fill in your details (name, email, password, state, phone) and you\'ll be registered. Your account is instant!'
  },
  {
    category: 'buyers',
    question: 'How do I search for fabrics?',
    answer: 'Visit the Shop page and use the filters to search by category (Ankara, Lace, Senator, etc.), price range, fabric type, or vendor. You can also use the search bar for specific names.'
  },
  {
    category: 'buyers',
    question: 'Can I return products?',
    answer: 'Returns are handled on a case-by-case basis. Contact our support team with photos and details within 7 days of delivery. We aim to resolve issues fairly for both buyers and vendors.'
  },
  {
    category: 'buyers',
    question: 'How long does delivery take?',
    answer: 'Most orders are shipped within 2-3 business days. Delivery time depends on location: same state (3-5 days), different state (5-7 days). You\'ll receive a tracking number.'
  },
  {
    category: 'buyers',
    question: 'How do I track my order?',
    answer: 'Go to "My Orders" in your account and click on any order. You\'ll see the status (processing, shipped, delivered) and tracking number once it\'s shipped.'
  },
  // Vendors
  {
    category: 'vendors',
    question: 'How do I become a vendor?',
    answer: 'Sign up with the "Vendor" role and complete your profile with store name, description, state, and bank details. Your profile goes to admin for approval (usually 24-48 hours).'
  },
  {
    category: 'vendors',
    question: 'What are the commission fees?',
    answer: 'The African Store charges a 7% commission on all sales. Additionally, there\'s a 5% platform fee on each order. Vendors keep the remaining amount after fees.'
  },
  {
    category: 'vendors',
    question: 'How do I add products?',
    answer: 'From your Vendor Dashboard, click "Add Product" and fill in details: name, category, price, bulk price, description, images, and quantity. Products must be approved before going live.'
  },
  {
    category: 'vendors',
    question: 'Can I edit my product prices?',
    answer: 'Yes! Go to your products list and click "Edit" on any product. You can change price, quantity, description, and other details anytime.'
  },
  {
    category: 'vendors',
    question: 'How do I handle orders?',
    answer: 'All orders appear in your vendor dashboard. Once shipped, mark it as "Shipped" and provide tracking info. Buyers confirm delivery, then payment is released to you.'
  },
  // Payments
  {
    category: 'payments',
    question: 'What payment methods do you accept?',
    answer: 'We use Paystack for all payments. Accepted methods include: debit cards, credit cards, and bank transfers. All transactions are secure and encrypted.'
  },
  {
    category: 'payments',
    question: 'Is it safe to pay with my credit card?',
    answer: 'Absolutely! We use Paystack, a PCI-compliant payment processor. Your card details are never stored on our servers. All transactions are 256-bit encrypted.'
  },
  {
    category: 'payments',
    question: 'When do vendors get paid?',
    answer: 'After a buyer confirms delivery (usually 3-5 days after receipt), the order amount (minus fees) is transferred to the vendor\'s registered bank account within 24-48 hours.'
  },
  {
    category: 'payments',
    question: 'What if payment fails?',
    answer: 'If your payment fails, you\'ll see an error message. Check your card details, ensure sufficient funds, and try again. Contact support if the issue persists.'
  },
  // Orders
  {
    category: 'orders',
    question: 'Can I cancel an order?',
    answer: 'You can cancel orders while they\'re in "processing" status. Once shipped, cancellation isn\'t possible. Contact support for special cases.'
  },
  {
    category: 'orders',
    question: 'Where do I find my order history?',
    answer: 'Click "My Orders" in your account menu. All your past orders are listed with details, status, and tracking information.'
  },
  {
    category: 'orders',
    question: 'What does delivery status mean?',
    answer: 'Processing = order being prepared, Shipped = in transit with tracking, Delivered = with buyer. Confirm delivery to release payment to vendor.'
  },
  // Account
  {
    category: 'account',
    question: 'How do I reset my password?',
    answer: 'On the login page, click "Forgot Password" and enter your email. You\'ll receive a reset link. Create a new password and log in.'
  },
  {
    category: 'account',
    question: 'Can I change my account role?',
    answer: 'Account roles (buyer/vendor) cannot be changed once created. You\'ll need to create a new account if you want to switch roles.'
  },
  {
    category: 'account',
    question: 'How do I update my profile information?',
    answer: 'Go to "Profile" in your account menu. Update your name, phone number, state, and other details. Changes are saved immediately.'
  },
  {
    category: 'account',
    question: 'How do I delete my account?',
    answer: 'Contact support with your request. Account deletion is permanent and will cancel any ongoing transactions. We\'ll guide you through the process.'
  },
]

const categories = [
  { id: 'all', label: 'All Questions' },
  { id: 'buyers', label: 'For Buyers' },
  { id: 'vendors', label: 'For Vendors' },
  { id: 'payments', label: 'Payments' },
  { id: 'orders', label: 'Orders' },
  { id: 'account', label: 'Account' },
]

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFAQs = faqItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <>
      <Head>
        <title>Help & Support — The African Store</title>
        <meta name="description" content="Get help with your The African Store account, orders, payments, and more." />
      </Head>
      <Layout>
        <div className="min-h-screen">
          {/* Hero */}
          <section className="bg-gradient-to-r from-brown-deep/50 to-transparent py-16 px-6 mb-12 border-b border-gold/10">
            <div className="max-w-4xl mx-auto">
              <div className="section-eyebrow">Support</div>
              <h1 className="font-serif text-5xl text-cream mb-4">
                How Can We <em className="text-gold italic">Help?</em>
              </h1>
              <p className="text-lg text-[#A89060]">
                Find answers to common questions or reach our support team
              </p>
            </div>
          </section>

          <div className="max-w-4xl mx-auto px-6 pb-16">
            {/* Search */}
            <div className="mb-12">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A89060]" size={20} />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-brown-warm/50 border border-gold/20 rounded-sm pl-12 pr-4 py-4 text-cream placeholder-cream/30 focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-12">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-6 py-2 rounded-sm text-sm tracking-wide transition-all ${
                    activeCategory === cat.id
                      ? 'bg-gold text-brown-deep font-medium'
                      : 'bg-brown-warm/50 border border-gold/20 text-cream hover:border-gold'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* FAQ Items */}
            <div className="space-y-3 mb-16">
              {filteredFAQs.length > 0 ? (
                filteredFAQs.map((faq, idx) => {
                  const itemId = `faq-${idx}`
                  const isExpanded = expandedId === itemId
                  return (
                    <div
                      key={itemId}
                      className="card overflow-hidden hover:border-gold/40 transition-all"
                    >
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : itemId)}
                        className="w-full p-6 flex items-start justify-between gap-4 hover:bg-brown-warm/30 transition-colors"
                      >
                        <span className="text-left text-cream font-medium">{faq.question}</span>
                        <FiChevronDown
                          className={`flex-shrink-0 text-gold transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                          size={20}
                        />
                      </button>
                      {isExpanded && (
                        <div className="px-6 pb-6 border-t border-gold/10 pt-4">
                          <p className="text-[#A89060] leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  )
                })
              ) : (
                <div className="card p-12 text-center">
                  <p className="text-cream/50">No results found for "{searchQuery}"</p>
                </div>
              )}
            </div>

            {/* Support Options */}
            <section className="mb-16 border-t border-gold/10 pt-16">
              <h2 className="font-serif text-3xl text-cream mb-8">Still Need Help?</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: FiMessageSquare,
                    title: 'Email Support',
                    desc: 'Send us a detailed message',
                    contact: 'support@theafricanstore.com',
                    link: '/contact'
                  },
                  {
                    icon: FiPhone,
                    title: 'Phone Support',
                    desc: 'Call us during business hours',
                    contact: '+234 (0) 801 234 5678',
                    link: '/contact'
                  },
                  {
                    icon: FiMail,
                    title: 'Contact Form',
                    desc: 'Submit your question directly',
                    contact: 'Fill out our contact form',
                    link: '/contact'
                  },
                ].map((option, idx) => {
                  const Icon = option.icon
                  return (
                    <Link key={idx} href={option.link}>
                      <div className="card p-8 hover:border-gold/40 transition-all cursor-pointer h-full flex flex-col">
                        <Icon className="text-gold mb-4" size={32} />
                        <h3 className="font-serif text-lg text-cream mb-2">{option.title}</h3>
                        <p className="text-sm text-[#A89060] mb-4 flex-grow">{option.desc}</p>
                        <p className="text-sm text-gold font-medium flex items-center gap-2">
                          {option.contact}
                          <FiArrowRight size={14} />
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>

            {/* Business Hours */}
            <div className="card p-8 bg-gold/10 border border-gold/20">
              <h3 className="font-serif text-xl text-cream mb-4">Business Hours</h3>
              <div className="grid md:grid-cols-2 gap-8 text-sm">
                <div>
                  <p className="text-gold font-medium mb-3">Support Team</p>
                  <div className="space-y-2 text-[#A89060]">
                    <p>Monday - Friday: 9 AM - 6 PM WAT</p>
                    <p>Saturday: 10 AM - 4 PM WAT</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
                <div>
                  <p className="text-gold font-medium mb-3">Response Time</p>
                  <div className="space-y-2 text-[#A89060]">
                    <p>Email: 24 hours</p>
                    <p>Phone: Peak hours (24-48 hours)</p>
                    <p>Chat: During business hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <section className="mt-16 pt-16 border-t border-gold/10">
              <h2 className="font-serif text-2xl text-cream mb-6">Quick Links</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { label: 'Browse Fabrics', href: '/shop' },
                  { label: 'Request Custom Fabric', href: '/rfq' },
                  { label: 'Become a Vendor', href: '/auth/register?role=vendor' },
                  { label: 'Contact Us', href: '/contact' },
                  { label: 'About Us', href: '/about' },
                  { label: 'Company Information', href: '/company' },
                ].map((link, idx) => (
                  <Link key={idx} href={link.href}>
                    <div className="flex items-center gap-3 p-4 card hover:border-gold/40 transition-all cursor-pointer group">
                      <span className="text-cream group-hover:text-gold transition-colors">{link.label}</span>
                      <FiArrowRight className="text-gold ml-auto group-hover:translate-x-1 transition-transform" size={16} />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </Layout>
    </>
  )
}
