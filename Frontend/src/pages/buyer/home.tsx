import Head from 'next/head'
import Link from 'next/link'
import { useQuery } from 'react-query'
import Layout from '@/components/layout/Layout'
import ProductCard from '@/components/shop/ProductCard'
import { useAuthStore } from '@/store/authStore'
import { withProtectedRoute } from '@/lib/protectedRoute'
import api from '@/lib/api'
import { FiArrowRight, FiShoppingBag, FiStar, FiHeart } from 'react-icons/fi'

function BuyerHome() {
  const { user } = useAuthStore()

  const { data: featured } = useQuery('featured-products-buyer', () =>
    api.get('/products?featured=true&limit=6').then((r) => r.data.products)
  )

  const { data: recent } = useQuery('recent-products-buyer', () =>
    api.get('/products?sort=newest&limit=6').then((r) => r.data.products)
  )

  const { data: vendors } = useQuery('featured-vendors', () =>
    api.get('/vendor/all?limit=4').then((r) => r.data.vendors)
  )

  return (
    <>
      <Head><title>Buyer Home — The African Store</title></Head>
      <Layout>
        <div className="min-h-screen">
          {/* Welcome Section */}
          <section className="bg-gradient-to-r from-brown-deep/50 to-transparent py-12 px-6 mb-12 border-b border-gold/10">
            <div className="max-w-6xl mx-auto">
              <h1 className="font-serif text-4xl text-cream mb-2">
                Welcome back, <em className="text-gold italic">{user?.name.split(' ')[0]}</em>!
              </h1>
              <p className="text-[#A89060] mb-6">Discover premium African fabrics from trusted vendors across Nigeria.</p>
              <div className="flex gap-4">
                <Link href="/shop" className="btn-primary flex items-center gap-2">
                  <FiShoppingBag size={16} /> Browse Fabrics
                </Link>
                <Link href="/rfq" className="btn-secondary flex items-center gap-2">
                  <FiHeart size={16} /> Post a Request
                </Link>
              </div>
            </div>
          </section>

          <div className="max-w-6xl mx-auto px-6 pb-12">
            {/* Featured Products */}
            <section className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="section-eyebrow">✨ Featured</div>
                  <h2 className="font-serif text-3xl text-cream">Top Picks</h2>
                </div>
                <Link href="/shop?featured=true" className="text-gold hover:text-cream text-sm flex items-center gap-2">
                  View all <FiArrowRight size={14} />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featured?.slice(0, 3).map((product: any) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </section>

            {/* Featured Vendors */}
            {vendors && vendors.length > 0 && (
              <section className="mb-16">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <div className="section-eyebrow">🏪 Marketplace</div>
                    <h2 className="font-serif text-3xl text-cream">Top Vendors</h2>
                  </div>
                  <Link href="/vendors" className="text-gold hover:text-cream text-sm flex items-center gap-2">
                    View all <FiArrowRight size={14} />
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {vendors.map((vendor: any) => (
                    <Link key={vendor._id} href={`/shop?vendor=${vendor._id}`}>
                      <div className="card p-6 hover:border-gold/40 transition-all cursor-pointer">
                        <div className="mb-3">
                          <h3 className="font-serif text-lg text-cream mb-1">{vendor.userId?.name}</h3>
                          <p className="text-xs text-[#A89060]">{vendor.storeName}</p>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1 text-gold">
                            <FiStar size={14} className="fill-gold" />
                            {(vendor.rating || 0).toFixed(1)}
                          </span>
                          <span className="text-xs text-cream/50">{vendor.state}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Recent Products */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="section-eyebrow">📦 Latest</div>
                  <h2 className="font-serif text-3xl text-cream">New Arrivals</h2>
                </div>
                <Link href="/shop" className="text-gold hover:text-cream text-sm flex items-center gap-2">
                  View all <FiArrowRight size={14} />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recent?.slice(0, 3).map((product: any) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </section>

            {/* Call to Action */}
            <section className="mt-16 bg-gold/10 border border-gold/20 rounded-sm p-8 text-center">
              <h3 className="font-serif text-2xl text-cream mb-3">Can't find what you're looking for?</h3>
              <p className="text-[#A89060] mb-6">Post a fabric request and let vendors reach out to you with custom offers.</p>
              <Link href="/rfq/new" className="btn-primary inline-flex items-center gap-2">
                Create a Request <FiArrowRight size={16} />
              </Link>
            </section>
          </div>
        </div>
      </Layout>
    </>
  )
}

export default withProtectedRoute(BuyerHome, { requireRole: 'buyer' })
