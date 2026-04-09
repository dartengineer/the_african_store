import Head from 'next/head'
import Link from 'next/link'
import { useQuery } from 'react-query'
import Layout from '@/components/layout/Layout'
import { withProtectedRoute } from '@/lib/protectedRoute'
import api from '@/lib/api'
import { FiArrowRight, FiPackage, FiTruck, FiCheck, FiClock } from 'react-icons/fi'
import toast from 'react-hot-toast'

function VendorOrders() {
  const { data: vendorOrders, isLoading, error } = useQuery('vendor-orders', () =>
    api.get('/orders/vendor/my').then((r) => r.data.orders),
    { staleTime: 60000 }
  )

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { icon: any; color: string; label: string } } = {
      processing: { icon: FiClock, color: 'text-blue-400', label: 'Processing' },
      shipped: { icon: FiTruck, color: 'text-yellow-400', label: 'Shipped' },
      delivered: { icon: FiCheck, color: 'text-green-400', label: 'Delivered' },
    }
    const config = statusConfig[status] || statusConfig.processing
    const Icon = config.icon
    return (
      <div className={`flex items-center gap-1 ${config.color}`}>
        <Icon size={14} />
        <span className="text-xs">{config.label}</span>
      </div>
    )
  }

  const getTotalRevenue = () => {
    if (!vendorOrders) return 0
    return vendorOrders.reduce((sum, order) => {
      const vendorItems = order.items || []
      const vendorTotal = vendorItems.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0)
      return sum + vendorTotal
    }, 0)
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen pt-32 px-6">
          <div className="max-w-6xl mx-auto">
            <p className="text-red-400">Failed to load orders</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <>
      <Head>
        <title>My Orders — Vendor Dashboard</title>
      </Head>
      <Layout>
        <div className="min-h-screen pt-32 pb-12">
          <div className="max-w-6xl mx-auto px-6">
            {/* Header */}
            <div className="mb-12">
              <div className="section-eyebrow">📦 Orders</div>
              <h1 className="font-serif text-4xl text-cream mb-2">Recent Orders</h1>
              <p className="text-[#A89060]">All orders containing your products</p>
            </div>

            {/* Stats */}
            {vendorOrders && vendorOrders.length > 0 && (
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="card p-6">
                  <div className="text-sm text-[#A89060] mb-2">Total Orders</div>
                  <div className="font-serif text-3xl text-gold">{vendorOrders.length}</div>
                </div>
                <div className="card p-6">
                  <div className="text-sm text-[#A89060] mb-2">Total Items Sold</div>
                  <div className="font-serif text-3xl text-gold">
                    {vendorOrders.reduce((sum, order) => sum + (order.items?.length || 0), 0)}
                  </div>
                </div>
                <div className="card p-6">
                  <div className="text-sm text-[#A89060] mb-2">Revenue (Your Items)</div>
                  <div className="font-serif text-3xl text-gold">₦{getTotalRevenue().toLocaleString()}</div>
                </div>
              </div>
            )}

            {/* Orders List */}
            {isLoading ? (
              <div className="card p-12 text-center">
                <p className="text-cream/50">Loading orders...</p>
              </div>
            ) : vendorOrders && vendorOrders.length > 0 ? (
              <div className="space-y-4">
                {vendorOrders.map((order) => (
                  <Link key={order._id} href={`/orders/${order._id}`}>
                    <div className="card p-6 hover:border-gold/40 transition-all cursor-pointer">
                      <div className="grid md:grid-cols-5 gap-4 items-center">
                        {/* Order ID & Date */}
                        <div>
                          <p className="text-xs text-[#A89060] uppercase tracking-wide">Order ID</p>
                          <p className="font-mono text-sm text-cream">{order._id.slice(-8).toUpperCase()}</p>
                          <p className="text-xs text-[#A89060] mt-1">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        {/* Buyer Info */}
                        <div>
                          <p className="text-xs text-[#A89060] uppercase tracking-wide">Buyer</p>
                          <p className="text-cream">{order.buyerId?.name}</p>
                          <p className="text-xs text-[#A89060] mt-1">{order.buyerId?.state}</p>
                        </div>

                        {/* Items */}
                        <div>
                          <p className="text-xs text-[#A89060] uppercase tracking-wide">Items</p>
                          <div className="space-y-1">
                            {order.items?.slice(0, 2).map((item, idx) => (
                              <p key={idx} className="text-sm text-cream">
                                {item.productId?.name} (x{item.quantity})
                              </p>
                            ))}
                            {order.items && order.items.length > 2 && (
                              <p className="text-xs text-gold">+{order.items.length - 2} more</p>
                            )}
                          </div>
                        </div>

                        {/* Total */}
                        <div>
                          <p className="text-xs text-[#A89060] uppercase tracking-wide">Your Total</p>
                          <p className="font-serif text-lg text-gold">
                            ₦{order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}
                          </p>
                        </div>

                        {/* Status */}
                        <div className="flex items-center justify-between">
                          {getStatusBadge(order.deliveryStatus)}
                          <FiArrowRight className="text-gold" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="card p-12 text-center">
                <FiPackage className="mx-auto mb-4 text-cream/30" size={48} />
                <p className="text-cream/70 mb-4">No orders yet</p>
                <Link href="/vendor/products" className="btn-primary inline-block">
                  Add Products
                </Link>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  )
}

export default withProtectedRoute(VendorOrders, { requireRole: 'vendor' })
