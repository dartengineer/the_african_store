import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import Layout from '@/components/layout/Layout'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiCheck, FiTruck, FiClock, FiChevronDown, FiLoader } from 'react-icons/fi'

interface Order {
  _id: string
  buyerId: {
    _id: string
    name: string
    email: string
    state: string
  }
  items: Array<{
    productId: {
      _id: string
      name: string
      price: number
    }
    quantity: number
    price: number
  }>
  subtotal: number
  platformFee: number
  deliveryFee: number
  totalAmount: number
  deliveryStatus: 'processing' | 'shipped' | 'delivered'
  paymentStatus: 'pending' | 'paid'
  createdAt: string
  deliveryAddress: {
    street?: string
    city?: string
    state?: string
    country?: string
  }
  logisticsCompany?: string
  trackingNumber?: string
}

export default function AdminOrders() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'processing' | 'shipped' | 'delivered'>('all')
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/')
    }
  }, [user, router])

  const { data: ordersData, isLoading, refetch } = useQuery(
    'admin-all-orders',
    () => api.get('/admin/orders').then((r) => r.data),
    { staleTime: 60000 }
  )

  const orders: Order[] = ordersData?.orders || []
  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(o => (o.deliveryStatus || '') === filterStatus)

  const handleUpdateStatus = async (orderId: string, newStatus: 'processing' | 'shipped' | 'delivered') => {
    setUpdatingOrderId(orderId)
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { deliveryStatus: newStatus })
      toast.success(`Order status updated to ${newStatus}`)
      refetch()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update order')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'text-blue-400'
      case 'shipped': return 'text-yellow-400'
      case 'delivered': return 'text-green-400'
      default: return 'text-cream'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing': return FiClock
      case 'shipped': return FiTruck
      case 'delivered': return FiCheck
      default: return FiClock
    }
  }

  const formatAddress = (addr: any) => {
    if (!addr || typeof addr !== 'object') return addr || 'Not provided'
    const parts = [addr.street, addr.city, addr.state, addr.country || 'Nigeria'].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : 'Not provided'
  }

  if (!user || user.role !== 'admin') return null

  return (
    <>
      <Head>
        <title>Manage Orders — Admin Panel</title>
      </Head>
      <Layout>
        <div className="min-h-screen pt-32 pb-12">
          <div className="max-w-7xl mx-auto px-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Link href="/admin" className="text-gold hover:text-cream transition-colors">
                <FiArrowLeft size={24} />
              </Link>
              <div>
                <h1 className="font-serif text-3xl text-cream">Manage Orders</h1>
                <p className="text-[#A89060] text-sm">Update delivery status and track all orders</p>
              </div>
            </div>

            {/* Stats */}
            {!isLoading && orders.length > 0 && (
              <div className="grid md:grid-cols-4 gap-4 mb-12">
                <div className="card p-6">
                  <p className="text-[#A89060] text-xs uppercase tracking-wide mb-2">Total Orders</p>
                  <p className="font-serif text-3xl text-gold">{orders.length}</p>
                </div>
                <div className="card p-6">
                  <p className="text-[#A89060] text-xs uppercase tracking-wide mb-2">Processing</p>
                  <p className="font-serif text-3xl text-blue-400">{orders.filter(o => (o.deliveryStatus || '').toLowerCase() === 'processing').length}</p>
                </div>
                <div className="card p-6">
                  <p className="text-[#A89060] text-xs uppercase tracking-wide mb-2">Shipped</p>
                  <p className="font-serif text-3xl text-yellow-400">{orders.filter(o => (o.deliveryStatus || '').toLowerCase() === 'shipped').length}</p>
                </div>
                <div className="card p-6">
                  <p className="text-[#A89060] text-xs uppercase tracking-wide mb-2">Delivered</p>
                  <p className="font-serif text-3xl text-green-400">{orders.filter(o => (o.deliveryStatus || '').toLowerCase() === 'delivered').length}</p>
                </div>
              </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              {(['all', 'processing', 'shipped', 'delivered'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-6 py-2 rounded-sm text-sm tracking-wide transition-all whitespace-nowrap ${
                    filterStatus === status
                      ? 'bg-gold text-brown-deep font-medium'
                      : 'bg-brown-warm/50 border border-gold/20 text-cream hover:border-gold'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {/* Orders List */}
            {isLoading ? (
              <div className="card p-12 text-center">
                <FiLoader className="mx-auto animate-spin text-gold mb-4" size={32} />
                <p className="text-cream/50">Loading orders...</p>
              </div>
            ) : filteredOrders.length > 0 ? (
              <div className="space-y-3">
                {filteredOrders.map((order) => {
                  const isExpanded = expandedOrderId === order._id
                  const StatusIcon = getStatusIcon(order.deliveryStatus)
                  return (
                    <div key={order._id} className="card overflow-hidden hover:border-gold/40 transition-all">
                      <button
                        onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                        className="w-full p-6 flex items-center justify-between gap-4 hover:bg-brown-warm/30 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            <StatusIcon className={`${getStatusColor(order.deliveryStatus)}`} size={24} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <p className="font-mono text-sm text-cream">{order._id.slice(-8).toUpperCase()}</p>
                              <span className={`text-xs tracking-wide uppercase font-medium ${getStatusColor(order.deliveryStatus)}`}>
                                {order.deliveryStatus}
                              </span>
                            </div>
                            <p className="text-sm text-[#A89060]">{order.buyerId?.name}</p>
                            <p className="text-xs text-cream/50">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-serif text-lg text-gold">₦{(order.totalAmount || 0).toLocaleString()}</p>
                          <p className="text-xs text-[#A89060]">{order.items?.length || 0} items</p>
                        </div>
                        <FiChevronDown
                          className={`text-gold transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          size={20}
                        />
                      </button>

                      {isExpanded && (
                        <div className="border-t border-gold/10 px-6 py-6 space-y-6">
                          {/* Order Details */}
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h3 className="text-xs text-gold uppercase tracking-wide mb-3 font-medium">Buyer Info</h3>
                              <div className="space-y-2 text-sm">
                                <p className="text-cream">{order.buyerId?.name}</p>
                                <p className="text-[#A89060]">{order.buyerId?.email}</p>
                                <p className="text-[#A89060]">📍 {order.buyerId?.state}</p>
                              </div>
                            </div>
                            <div>
                              <h3 className="text-xs text-gold uppercase tracking-wide mb-3 font-medium">Delivery Address</h3>
                              <p className="text-sm text-[#A89060]">{formatAddress(order.deliveryAddress)}</p>
                            </div>
                          </div>

                          {/* Items */}
                          <div>
                            <h3 className="text-xs text-gold uppercase tracking-wide mb-3 font-medium">Items</h3>
                            <div className="space-y-2">
                              {(order.items || []).map((item, idx) => (
                                <div key={idx} className="flex justify-between items-start p-3 bg-brown-warm/20 rounded-sm">
                                  <div>
                                    <p className="text-sm text-cream">{item.productId?.name}</p>
                                    <p className="text-xs text-[#A89060]">Qty: {item.quantity}</p>
                                  </div>
                                  <p className="text-sm text-gold font-medium">₦{((item.price || 0) * (item.quantity || 0)).toLocaleString()}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Pricing Breakdown */}
                          <div className="border-t border-gold/10 pt-4">
                            <div className="space-y-2 text-sm mb-4">
                              <div className="flex justify-between">
                                <span className="text-[#A89060]">Subtotal</span>
                                <span className="text-cream">₦{(order.subtotal || 0).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[#A89060]">Platform Fee (5%)</span>
                                <span className="text-cream">₦{(order.platformFee || 0).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[#A89060]">Delivery Fee</span>
                                <span className="text-cream">₦{(order.deliveryFee || 0).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between font-medium border-t border-gold/10 pt-2 mt-2">
                                <span className="text-cream">Total</span>
                                <span className="text-gold">₦{(order.totalAmount || 0).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Payment Status */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gold uppercase tracking-wide font-medium">Payment:</span>
                            <span className={`text-xs font-medium ${(order.paymentStatus || 'pending') === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                              {(order.paymentStatus || 'pending').toUpperCase()}
                            </span>
                          </div>

                          {/* Tracking Info */}
                          {order.logisticsCompany && (
                            <div >
                              <h3 className="text-xs text-gold uppercase tracking-wide mb-3 font-medium">Tracking</h3>
                              <div className="space-y-2 text-sm">
                                <p className="text-[#A89060]">Logistics: {order.logisticsCompany}</p>
                                {order.trackingNumber && <p className="text-cream font-mono">Tracking #: {order.trackingNumber}</p>}
                              </div>
                            </div>
                          )}

                          {/* Status Update Buttons */}
                          <div className="border-t border-gold/10 pt-4 flex flex-wrap gap-2">
                            {(['processing', 'shipped', 'delivered'] as const).map((status) => (
                              <button
                                key={status}
                                onClick={() => handleUpdateStatus(order._id, status)}
                                disabled={updatingOrderId === order._id || order.deliveryStatus === status}
                                className={`px-4 py-2 rounded-sm text-xs uppercase tracking-wide transition-all font-medium ${
                                  order.deliveryStatus === status
                                    ? 'bg-gold/20 text-gold cursor-default'
                                    : 'bg-gold text-brown-deep hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed'
                                }`}
                              >
                                {updatingOrderId === order._id ? '...' : status}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="card p-12 text-center">
                <p className="text-cream/50">No orders found</p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  )
}
