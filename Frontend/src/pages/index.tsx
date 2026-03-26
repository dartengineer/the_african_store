import Head from 'next/head'
import Link from 'next/link'
import { useQuery } from 'react-query'
import Layout from '@/components/layout/Layout'
import ProductCard from '@/components/shop/ProductCard'
import api from '@/lib/api'

export default function Home() {
  const { data: featured } = useQuery('featured-products', () =>
    api.get('/products?featured=true&limit=8').then((r) => r.data.products)
  )

  return (
    <>
      <Head>
        <title>The African Store — Premium African Fabrics</title>
        <meta name="description" content="Buy and sell premium Ankara, Lace & Senator fabrics across Nigeria. Secure payments, verified vendors, nationwide delivery." />
      </Head>
      <Layout>
        {/* HERO */}
        <section className="min-h-screen grid md:grid-cols-2 items-center relative overflow-hidden px-8 md:px-16 pt-10">
          {/* Background effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0" style={{
              background: 'radial-gradient(ellipse at 70% 50%, rgba(43,93,66,0.25) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(201,168,76,0.12) 0%, transparent 50%)'
            }} />
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, #C9A84C 0, #C9A84C 1px, transparent 0, transparent 50%)',
              backgroundSize: '20px 20px'
            }} />
          </div>

          {/* Content */}
          <div className="relative z-10 py-20">
            <div className="section-eyebrow">The African Store · Premium Fabrics</div>
            <h1 className="font-serif text-5xl md:text-7xl font-light text-cream leading-tight mb-6">
              Africa's <em className="text-gold italic">Finest</em><br />
              Fabrics,<br />
              Delivered.
            </h1>
            <p className="text-sm text-[#A89060] leading-loose max-w-md mb-10 font-light">
              A modern marketplace where buyers discover premium Ankara, Lace & Senator fabrics — and vendors across Nigeria reach more customers than ever before.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/shop" className="btn-primary">Browse Collection</Link>
              <Link href="/rfq/new" className="btn-secondary">Request Custom Fabric</Link>
            </div>
            {/* Stats */}
            <div className="flex gap-10 mt-14 pt-8 border-t border-gold/20">
              {[
                { num: '500+', label: 'Verified Vendors' },
                { num: '36', label: 'States Covered' },
                { num: '100%', label: 'Secure Payments' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-serif text-3xl text-gold font-light">{s.num}</div>
                  <div className="text-[10px] tracking-widest uppercase text-[#A89060] mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Fabric swatches */}
          <div className="relative h-screen hidden md:flex items-center justify-center">
            <div className="grid grid-cols-2 gap-1.5 h-[75vh] w-[90%]">
              {[
                { label: 'Ankara', name: 'Premium Wax Print', style: { background: 'linear-gradient(160deg, #8B3A2A 0%, #C45C30 40%, #D4874B 100%)' }, span: 'row-span-2' },
                { label: 'Lace', name: 'Swiss Embroidered', style: { background: 'linear-gradient(135deg, #1B4A3A 0%, #2E7D5A 60%, #4BA87A 100%)' }, span: '' },
                { label: 'Senator', name: 'Royal Blend', style: { background: 'linear-gradient(135deg, #4A3060 0%, #7B4FA0 60%, #A066C8 100%)' }, span: '' },
                { label: 'Aso-Oke', name: 'New Collection', style: { background: 'linear-gradient(90deg, #7A4A1A 0%, #C49A2A 50%, #8B5E1A 100%)' }, span: 'col-span-2' },
              ].map((f, i) => (
                <div key={i} className={`rounded-sm overflow-hidden relative ${f.span}`} style={f.style}>
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.1) 0, rgba(255,255,255,0.1) 1px, transparent 0, transparent 12px), repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0, rgba(255,255,255,0.1) 1px, transparent 0, transparent 12px)'
                  }} />
                  <div className="absolute bottom-4 left-4">
                    <div className="text-[9px] tracking-widest uppercase text-white/60">{f.label}</div>
                    <div className="font-serif text-base text-white">{f.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED PRODUCTS */}
        <section className="px-8 md:px-16 py-24">
          <div className="section-eyebrow">Handpicked</div>
          <div className="flex justify-between items-end mb-10">
            <h2 className="font-serif text-4xl font-light text-cream">Featured <em className="text-gold italic">Fabrics</em></h2>
            <Link href="/shop" className="btn-ghost">View All →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featured?.map((p: any) => <ProductCard key={p._id} product={p} />) ??
              Array(4).fill(null).map((_, i) => (
                <div key={i} className="card aspect-[3/4] animate-pulse bg-brown-mid" />
              ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="bg-green-royal px-8 md:px-16 py-24 relative overflow-hidden">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 font-serif text-[280px] font-semibold text-gold/5 leading-none pointer-events-none select-none">
            TAS
          </div>
          <div className="section-eyebrow">The Process</div>
          <h2 className="font-serif text-4xl font-light text-cream mb-14">Simple as <em className="text-gold italic">1, 2, 3, 4</em></h2>
          <div className="grid md:grid-cols-4 gap-10 relative z-10">
            {[
              { num: '01', icon: '👤', title: 'Create Account', desc: 'Sign up as a buyer or vendor in under 2 minutes.' },
              { num: '02', icon: '🔍', title: 'Browse or Request', desc: 'Shop ready-listed fabrics or post a custom request.' },
              { num: '03', icon: '💳', title: 'Pay Securely', desc: 'Checkout with Paystack. Funds held until delivery confirmed.' },
              { num: '04', icon: '📦', title: 'Receive & Confirm', desc: 'Get your fabrics delivered. Confirm to release payment.' },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="font-serif text-6xl font-light text-gold/25 mb-3">{step.num}</div>
                <div className="text-3xl mb-4">{step.icon}</div>
                <div className="font-serif text-xl text-cream mb-2">{step.title}</div>
                <p className="text-xs text-cream/50 leading-relaxed font-light">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TRUST */}
        <section className="grid md:grid-cols-3 gap-px bg-gold/5">
          {[
            { icon: '🔒', title: 'Escrow Protection', desc: 'Your money is held safely until you confirm delivery. No more risky transfers or ghosting.' },
            { icon: '✅', title: 'Verified Vendors', desc: 'Every vendor on TAS goes through identity and quality verification before listing.' },
            { icon: '⚖️', title: 'Dispute Resolution', desc: 'Our admin mediation team handles disputes fairly. Refunds processed within 48 hours.' },
          ].map((item) => (
            <div key={item.title} className="bg-brown-mid p-12">
              <div className="text-4xl mb-6">{item.icon}</div>
              <h3 className="font-serif text-2xl text-cream mb-3">{item.title}</h3>
              <p className="text-sm text-[#A89060] leading-relaxed font-light">{item.desc}</p>
            </div>
          ))}
        </section>

        {/* CTA */}
        <section className="bg-green-royal py-28 px-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.12) 0%, transparent 70%)'
          }} />
          <h2 className="font-serif text-5xl font-light text-cream mb-4 relative z-10">
            Ready to Trade<br /><em className="text-gold italic">the Better Way?</em>
          </h2>
          <p className="text-sm text-[#A89060] mb-10 relative z-10">
            Join thousands of buyers and vendors building the future of African fabric commerce.
          </p>
          <div className="flex gap-4 justify-center flex-wrap relative z-10">
            <Link href="/shop" className="btn-primary">Shop Now</Link>
            <Link href="/auth/register?role=vendor" className="btn-secondary">Become a Vendor</Link>
          </div>
        </section>
      </Layout>
    </>
  )
}
