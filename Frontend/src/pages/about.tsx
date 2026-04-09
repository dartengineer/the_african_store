import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/layout/Layout'
import { FiCheck, FiTrendingUp, FiUsers, FiGlobe } from 'react-icons/fi'

export default function About() {
  return (
    <>
      <Head>
        <title>About Us — The African Store</title>
        <meta name="description" content="Learn about The African Store - modernizing African fabric trade with secure payments, verified vendors, and nationwide delivery." />
      </Head>
      <Layout>
        <div className="min-h-screen">
          {/* Hero */}
          <section className="bg-gradient-to-r from-brown-deep/50 to-transparent py-16 px-6 mb-12 border-b border-gold/10">
            <div className="max-w-4xl mx-auto">
              <div className="section-eyebrow">Our Story</div>
              <h1 className="font-serif text-5xl text-cream mb-4">
                Modernizing African <em className="text-gold italic">Fabric Trade</em>
              </h1>
              <p className="text-lg text-[#A89060]">
                Connecting fabric buyers directly with verified vendors across Nigeria, with secure payments and nationwide delivery.
              </p>
            </div>
          </section>

          <div className="max-w-4xl mx-auto px-6 pb-16">
            {/* Mission & Vision */}
            <div className="grid md:grid-cols-2 gap-12 mb-16">
              <div className="card p-8">
                <h3 className="font-serif text-2xl text-cream mb-4">Our Mission</h3>
                <p className="text-[#A89060] leading-relaxed mb-4">
                  To revolutionize the African fabric marketplace by creating a secure, transparent, and accessible platform that connects buyers with trusted vendors. We empower small businesses and individual sellers to reach a wider audience while ensuring buyers get quality products with confidence.
                </p>
              </div>
              <div className="card p-8">
                <h3 className="font-serif text-2xl text-cream mb-4">Our Vision</h3>
                <p className="text-[#A89060] leading-relaxed mb-4">
                  To become Africa's leading e-commerce platform for authentic fabrics, celebrating the richness and diversity of African textile heritage while driving economic growth and entrepreneurship across the continent.
                </p>
              </div>
            </div>

            {/* Core Values */}
            <section className="mb-16">
              <div className="section-eyebrow">What Drives Us</div>
              <h2 className="font-serif text-3xl text-cream mb-8">Our Core Values</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    icon: FiCheck,
                    title: 'Trust & Transparency',
                    desc: 'Every vendor is verified, every transaction is secure, and every promise is kept.'
                  },
                  {
                    icon: FiTrendingUp,
                    title: 'Growth & Empowerment',
                    desc: 'We support small businesses and entrepreneurs in building sustainable livelihoods.'
                  },
                  {
                    icon: FiUsers,
                    title: 'Community',
                    desc: 'We foster meaningful connections between buyers and sellers across borders.'
                  },
                  {
                    icon: FiGlobe,
                    title: 'African Pride',
                    desc: 'We celebrate authentic African fabrics and craftsmanship with dignity.'
                  },
                ].map((value, i) => {
                  const Icon = value.icon
                  return (
                    <div key={i} className="card p-6">
                      <Icon className="text-gold mb-4" size={24} />
                      <h3 className="font-serif text-lg text-cream mb-2">{value.title}</h3>
                      <p className="text-sm text-[#A89060]">{value.desc}</p>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Why Choose Us */}
            <section className="mb-16">
              <div className="section-eyebrow">Why The African Store</div>
              <h2 className="font-serif text-3xl text-cream mb-8">What Sets Us Apart</h2>
              <div className="space-y-4">
                {[
                  'Verified vendors with established shop ratings',
                  'Secure payment processing via Paystack',
                  'Direct requests for custom fabric offerings',
                  'Nationwide delivery coverage',
                  'Role-based dashboards for vendors and admins',
                  'Transparent pricing with delivery fee calculations',
                  'Bulk discount pricing for large orders',
                  'Comprehensive order tracking and management',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 card p-4">
                    <div className="text-gold mt-1">✓</div>
                    <p className="text-cream">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA */}
            <section className="bg-gold/10 border border-gold/20 rounded-sm p-8 text-center">
              <h3 className="font-serif text-2xl text-cream mb-3">Join the Movement</h3>
              <p className="text-[#A89060] mb-6">
                Whether you're a buyer looking for quality fabrics or a vendor ready to reach new customers, The African Store is your platform.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/shop" className="btn-primary">
                  Start Shopping
                </Link>
                <Link href="/auth/register?role=vendor" className="btn-secondary">
                  Become a Vendor
                </Link>
              </div>
            </section>
          </div>
        </div>
      </Layout>
    </>
  )
}
