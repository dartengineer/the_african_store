import Head from 'next/head'
import Link from 'next/link'
import { useQuery } from 'react-query'
import Layout from '@/components/layout/Layout'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { FiPackage, FiShoppingBag, FiStar, FiPlus, FiEye } from 'react-icons/fi'

export default function VendorDashboard() {
  const { user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (user && user.role !== 'vendor') router.push('/')
    if (!user) router.push('/auth/login')
  }, [user])

  const { data: stats } = useQuery('vendor-stats', () =>
    api.get('/vendor/stats').then((r) => r.data)
  )
  const { data: products } = useQuery('vendor-products', () =>
    api.get('/vendor/products').then((r) => r.data.products)
  )
  const { data: orders } = useQuery('vendor-orders', () =>
    api.get('/vendor/orders').then((r) => r.data.orders)
  )

  return (
    <>
      <Head><title>Vendor Dashboard — The African Store</title></Head>
      <Layout>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex justify-between items-end mb-10">
            <div>
              <div className="section-eyebrow">Vendor Portal</div>
              <h1 className="font-serif text-4xl font-light text-cream">
                Welcome, <em className="text-gold italic">{user?.name?.split(' ')[0]}</em>
              </h1>
            </div>
            <Link href="/vendor/products/new" className="btn-primary flex items-center gap-2">
              <FiPlus size={14} /> Add Product
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { icon: <FiPackage size={18} />, label: 'Total Products', value: stats?.totalProducts ?? '–' },
              { icon: <FiShoppingBag size={18} />, label: 'Total Orders', value: stats?.totalOrders ?? '–' },
              { icon: '₦', label: 'Revenue (Month)', value: stats?.monthRevenue ? `₦${stats.monthRevenue.toLocaleString()}` : '–' },
              { icon: <FiStar size={18} />, label: 'Average Rating', value: stats?.avgRating?.toFixed(1) ?? '–' },
            ].map((s, i) => (
              <div key={i} className="card p-5">
                <div className="text-gold mb-3">{s.icon}</div>
                <div className="font-serif text-2xl text-cream mb-1">{s.value}</div>
                <div className="text-xs text-[#A89060] tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Products */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-serif text-xl text-cream">My Products</h2>
                <Link href="/vendor/products" className="btn-ghost text-xs">View All →</Link>
              </div>
              <div className="space-y-3">
                {products?.slice(0, 5).map((p: any) => (
                  <div key={p._id} className="card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-sm bg-brown-warm flex-shrink-0 overflow-hidden">
                      {p.images?.[0] && (
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-cream truncate">{p.name}</p>
                      <p className="text-xs text-[#A89060]">₦{p.price.toLocaleString()} · {p.quantityAvailable} yds left</p>
                    </div>
                    <Link href={`/vendor/products/${p._id}/edit`} className="text-[#A89060] hover:text-gold transition-colors">
                      <FiEye size={14} />
                    </Link>
                  </div>
                ))}
                {!products?.length && (
                  <div className="text-center py-10 border border-dashed border-gold/20 rounded-sm">
                    <p className="text-sm text-[#A89060] mb-3">No products yet</p>
                    <Link href="/vendor/products/new" className="btn-primary !py-2 !px-5 text-xs">Add First Product</Link>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-serif text-xl text-cream">Recent Orders</h2>
                <Link href="/vendor/orders" className="btn-ghost text-xs">View All →</Link>
              </div>
              <div className="space-y-3">
                {orders?.slice(0, 5).map((o: any) => (
                  <div key={o._id} className="card p-4">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs text-[#A89060] font-mono">#{o._id.slice(-8).toUpperCase()}</p>
                      <span className={`badge text-xs ${
                        o.deliveryStatus === 'delivered' ? 'badge-accepted' :
                        o.deliveryStatus === 'shipped' ? 'badge-pending' : 'badge-open'
                      }`}>
                        {o.deliveryStatus}
                      </span>
                    </div>
                    <p className="text-sm text-cream">{o.buyerId?.name}</p>
                    <p className="text-xs text-gold font-serif">₦{o.totalAmount?.toLocaleString()}</p>
                  </div>
                ))}
                {!orders?.length && (
                  <div className="text-center py-10 border border-dashed border-gold/20 rounded-sm">
                    <p className="text-sm text-[#A89060]">No orders yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}
