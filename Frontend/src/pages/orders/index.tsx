import Head from 'next/head'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import Layout from '@/components/layout/Layout'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

const STATUS_COLORS: Record<string, string> = {
  pending: 'badge-pending',
  processing: 'badge-pending',
  shipped: 'badge-open',
  delivered: 'badge-accepted',
  cancelled: 'badge-closed',
}

export default function OrdersPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const qc = useQueryClient()

  useEffect(() => {
    if (!user) router.push('/auth/login')
  }, [user])

  const { data: orders, isLoading } = useQuery('my-orders', () =>
    api.get('/orders/my').then((r) => r.data.orders)
  )

  const confirmDelivery = useMutation(
    (orderId: string) => api.patch(`/orders/${orderId}/confirm-delivery`),
    {
      onSuccess: () => {
        toast.success('Delivery confirmed! Payment released to vendor.')
        qc.invalidateQueries('my-orders')
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
    }
  )

  return (
    <>
      <Head><title>My Orders — The African Store</title></Head>
      <Layout>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="section-eyebrow">Account</div>
          <h1 className="font-serif text-4xl font-light text-cream mb-10">
            My <em className="text-gold italic">Orders</em>
          </h1>

          {isLoading ? (
            <div className="space-y-4">
              {Array(4).fill(null).map((_, i) => <div key={i} className="card h-24 animate-pulse" />)}
            </div>
          ) : orders?.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-serif text-2xl text-cream/40 mb-4">No orders yet</p>
              <Link href="/shop" className="btn-primary">Start Shopping</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders?.map((order: any) => (
                <div key={order._id} className="card p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs text-[#A89060] font-mono mb-1">Order #{order._id.slice(-10).toUpperCase()}</p>
                      <p className="text-xs text-[#A89060]">{new Date(order.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`badge ${STATUS_COLORS[order.deliveryStatus] || 'badge-pending'}`}>
                        {order.deliveryStatus}
                      </span>
                      <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-accepted' : 'badge-pending'}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-2 mb-4">
                    {order.items?.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-cream/70">{item.productId?.name || 'Product'} × {item.quantity}</span>
                        <span className="text-[#A89060]">₦{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gold/10">
                    <span className="font-serif text-xl text-gold">₦{order.totalAmount?.toLocaleString()}</span>
                    {order.deliveryStatus === 'shipped' && order.paymentStatus === 'paid' && (
                      <button
                        onClick={() => confirmDelivery.mutate(order._id)}
                        disabled={confirmDelivery.isLoading}
                        className="btn-primary !py-2 !px-5 text-xs"
                      >
                        Confirm Delivery
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Layout>
    </>
  )
}
