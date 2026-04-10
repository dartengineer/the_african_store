import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import Layout from '@/components/layout/Layout'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiCheck, FiTruck, FiClock, FiLoader } from 'react-icons/fi'

interface OrderItem {
  productId: {
    _id: string
    name: string
    price: number
  } | null
  quantity: number
  price: number
}

interface DeliveryAddress {
  street?: string
  city?: string
  state?: string
  country?: string
}

interface Order {
  _id: string
  buyerId: {
    _id: string
    name: string
    email: string
    phone: string
    state: string
  }
  items: OrderItem[]
  subtotal: number
  platformFee: number
  deliveryFee: number
  totalAmount: number
  deliveryStatus: 'processing' | 'shipped' | 'delivered'
  paymentStatus: 'pending' | 'paid' | 'failed'
  deliveryAddress: DeliveryAddress | string
  logisticsCompany?: string
  trackingNumber?: string
  createdAt: string
}

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  processing: { bg: 'bg-blue-500/10',  text: 'text-blue-400',   icon: <FiClock size={16} /> },
  shipped:    { bg: 'bg-yellow-500/10', text: 'text-yellow-400', icon: <FiTruck size={16} /> },
  delivered:  { bg: 'bg-green-500/10',  text: 'text-green-400',  icon: <FiCheck size={16} /> },
}

const PAYMENT_COLORS: Record<string, string> = {
  paid:    'text-green-400',
  pending: 'text-yellow-400',
  failed:  'text-red-400',
}

export default function OrderDetailPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { id } = router.query
  const [isConfirming, setIsConfirming] = useState(false)

  useEffect(() => {
    if (!user) router.push('/auth/login')
  }, [user])

  const {
    data: order,
    isLoading,
    refetch,
  } = useQuery<Order>(
    ['order-detail', id],
    () => api.get(`/orders/${id}`).then((r) => r.data.order as Order),
    { enabled: !!id, staleTime: 30000 }
  )

  const handleConfirmDelivery = async () => {
    setIsConfirming(true)
    try {
      await api.patch(`/orders/${id}/confirm-delivery`)
      toast.success('Delivery confirmed! Payment released to vendor.')
      refetch()
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message || 'Failed to confirm delivery')
    } finally {
      setIsConfirming(false)
    }
  }

  const formatAddress = (addr: DeliveryAddress | string): string => {
    if (typeof addr === 'string') return addr || 'Not provided'
    if (!addr) return 'Not provided'
    const parts = [addr.street, addr.city, addr.state, addr.country].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : 'Not provided'
  }

  if (!id) return null

  return (
    <>
      <Head>
        <title>Order {order?._id?.slice(-8)?.toUpperCase() ?? '...'} — The African Store</title>
      </Head>
      <Layout>
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Back */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#A89060] hover:text-gold transition-colors mb-8"
          >
            <FiArrowLeft size={20} />
            <span>Back</span>
          </button>

          {isLoading ? (
            <div className="card p-12 text-center">
              <FiLoader className="mx-auto animate-spin text-gold mb-4" size={32} />
              <p className="text-cream/50">Loading order details...</p>
            </div>
          ) : !order ? (
            <div className="card p-12 text-center">
              <p className="text-cream/50 mb-4">Order not found</p>
              <Link href="/orders" className="btn-primary">
                View All Orders
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Order Header */}
              <div className="card p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-xs text-[#A89060] uppercase tracking-wide mb-2">Order Number</p>
                    <p className="font-mono text-2xl text-cream">{order._id.slice(-10).toUpperCase()}</p>
                    <p className="text-sm text-[#A89060] mt-2">
                      {new Date(order.createdAt).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div
                      className={`flex items-center gap-2 px-4 py-2 rounded-sm ${
                        STATUS_COLORS[order.deliveryStatus]?.bg ?? ''
                      }`}
                    >
                      {STATUS_COLORS[order.deliveryStatus]?.icon}
                      <span
                        className={`text-sm font-medium uppercase tracking-wide ${
                          STATUS_COLORS[order.deliveryStatus]?.text ?? ''
                        }`}
                      >
                        {order.deliveryStatus}
                      </span>
                    </div>
                    <div
                      className={`text-sm font-medium uppercase tracking-wide px-4 py-2 rounded-sm bg-gray-800/50 ${
                        PAYMENT_COLORS[order.paymentStatus] ?? ''
                      }`}
                    >
                      Payment: {order.paymentStatus}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Buyer Information */}
                <div className="card p-6">
                  <h3 className="text-xs text-gold uppercase tracking-wide font-medium mb-4">
                    Buyer Information
                  </h3>
                  <div className="space-y-3">
                    {(
                      [
                        { label: 'Name',     value: order.buyerId?.name },
                        { label: 'Email',    value: order.buyerId?.email },
                        { label: 'Phone',    value: order.buyerId?.phone || 'Not provided' },
                        { label: 'Location', value: `📍 ${order.buyerId?.state}` },
                      ] as { label: string; value: string }[]
                    ).map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs text-[#A89060] mb-1">{label}</p>
                        <p className="text-cream break-all">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="card p-6">
                  <h3 className="text-xs text-gold uppercase tracking-wide font-medium mb-4">
                    Delivery Address
                  </h3>
                  <div className="space-y-3">
                    <p className="text-cream">{formatAddress(order.deliveryAddress)}</p>
                    {order.logisticsCompany && (
                      <div className="pt-4 border-t border-gold/10">
                        <p className="text-xs text-[#A89060] mb-2">Logistics</p>
                        <p className="text-cream">{order.logisticsCompany}</p>
                        {order.trackingNumber && (
                          <>
                            <p className="text-xs text-[#A89060] mt-3 mb-1">Tracking Number</p>
                            <p className="text-cream font-mono text-sm">{order.trackingNumber}</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="card p-6">
                <h3 className="text-xs text-gold uppercase tracking-wide font-medium mb-4">
                  Items Ordered
                </h3>
                <div className="space-y-3">
                  {(order.items ?? []).map((item: OrderItem, idx: number) => (
                    <div
                      key={idx}
                      className="flex justify-between items-start p-4 bg-brown-warm/20 rounded-sm"
                    >
                      <div className="flex-1">
                        <p className="text-cream">{item.productId?.name ?? 'Product'}</p>
                        <p className="text-sm text-[#A89060]">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-[#A89060]">
                          ₦{(item.price ?? 0).toLocaleString()} each
                        </p>
                        <p className="text-gold font-medium">
                          ₦{((item.price ?? 0) * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="card p-6">
                <h3 className="text-xs text-gold uppercase tracking-wide font-medium mb-4">
                  Price Breakdown
                </h3>
                <div className="space-y-3 text-sm">
                  {(
                    [
                      { label: 'Subtotal',         value: order.subtotal    ?? 0 },
                      { label: 'Platform Fee (5%)', value: order.platformFee ?? 0 },
                      { label: 'Delivery Fee',      value: order.deliveryFee ?? 0 },
                    ] as { label: string; value: number }[]
                  ).map(({ label, value }) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-[#A89060]">{label}</span>
                      <span className="text-cream">₦{value.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-semibold border-t border-gold/10 pt-3 mt-3">
                    <span className="text-cream">Total Amount</span>
                    <span className="text-gold text-lg font-serif">
                      ₦{(order.totalAmount ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                {order.deliveryStatus === 'shipped' && order.paymentStatus === 'paid' && (
                  <button
                    onClick={handleConfirmDelivery}
                    disabled={isConfirming}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isConfirming ? 'Confirming...' : 'Confirm Delivery'}
                  </button>
                )}
                <Link href="/orders" className="btn-ghost flex-1 text-center">
                  View All Orders
                </Link>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  )
}
