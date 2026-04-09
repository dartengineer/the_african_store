import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Layout from '@/components/layout/Layout'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { withProtectedRoute } from '@/lib/protectedRoute'
import { FiTrash2, FiArrowRight } from 'react-icons/fi'
import api from '@/lib/api'
import toast from 'react-hot-toast'

function CartPage() {
  const router = useRouter()
  const { items, removeItem, updateQty, clearCart, total } = useCartStore()
  const { user } = useAuthStore()
  const [deliveryFee, setDeliveryFee] = useState(0)
  const [platformFee, setPlatformFee] = useState(0)

  // Calculate delivery fee based on buyer-vendor state proximity
  useEffect(() => {
    const calculateDeliveryFee = async () => {
      if (!user || items.length === 0) return
      
      try {
        // Get unique vendor IDs
        const vendorIds = [...new Set(items.map(i => i.vendorId))]
        
        // Fetch vendor profiles to get states
        let totalDeliveryFee = 0
        for (const vendorId of vendorIds) {
          const { data } = await api.get(`/vendor/${vendorId}`)
          const vendorState = data.vendorProfile?.state
          // Same state = ₦10,000, Different state = ₦20,000
          const fee = vendorState === user.state ? 10000 : 20000
          totalDeliveryFee += fee
        }
        
        setDeliveryFee(totalDeliveryFee)
        // Calculate platform fee with bulk pricing considered
        const subtotalWithBulk = calculateSubtotalWithBulk()
        setPlatformFee(Math.round(subtotalWithBulk * 0.05))
      } catch (err) {
        console.error('Failed to calculate delivery fee:', err)
        // Default to ₦10,000 if unable to fetch
        setDeliveryFee(10000)
      }
    }
    
    calculateDeliveryFee()
  }, [items, user])

  // Apply bulk discount: if quantity > 6 yards, use bulkPrice
  const calculateSubtotalWithBulk = (): number => {
    return items.reduce((sum, item) => {
      const itemTotal = item.quantity > 6 && item.bulkPrice 
        ? item.bulkPrice * item.quantity
        : item.price * item.quantity
      return sum + itemTotal
    }, 0)
  }

  const handleCheckout = async () => {
    if (!user) { router.push('/auth/login?redirect=/cart'); return }
    if (items.length === 0) return

    try {
      const subtotalWithBulk = calculateSubtotalWithBulk()
      const totalAmount = subtotalWithBulk + platformFee + deliveryFee
      
      // Create order with correct totals
      const { data } = await api.post('/orders', {
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.quantity > 6 && i.bulkPrice ? i.bulkPrice : i.price, // Use bulk price if applicable
        })),
        deliveryAddress: {
          state: user.state,
          country: 'Nigeria',
        },
      })

      // Initialize Paystack with correct total
      // @ts-ignore
      const PaystackPop: any = (await import('@paystack/inline-js')).default
      const paystack = new PaystackPop()
      paystack.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        email: user.email,
        amount: totalAmount * 100, // Paystack uses kobo
        reference: data.order.paymentReference,
        onSuccess: async (transaction: any) => {
          try {
            await api.post(`/orders/${data.order._id}/verify-payment`, {
              reference: transaction.reference,
            })
            clearCart()
            toast.success('Payment successful! Order placed.')
            router.push(`/orders/${data.order._id}`)
          } catch {
            toast.error('Payment verification failed. Contact support.')
          }
        },
        onCancel: () => toast('Payment cancelled'),
      })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Checkout failed')
    }
  }

  return (
    <>
      <Head><title>Cart — The African Store</title></Head>
      <Layout>
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="section-eyebrow">Your Selection</div>
          <h1 className="font-serif text-4xl font-light text-cream mb-10">Shopping <em className="text-gold italic">Cart</em></h1>

          {items.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-serif text-3xl text-cream/30 mb-4">Your cart is empty</p>
              <p className="text-sm text-[#A89060] mb-8">Discover our premium fabrics collection</p>
              <button onClick={() => router.push('/shop')} className="btn-primary">Browse Fabrics</button>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {/* Items */}
              <div className="md:col-span-2 space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="card flex gap-4 p-4">
                    <div className="relative w-20 h-20 rounded-sm overflow-hidden bg-brown-warm flex-shrink-0">
                      {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-cream font-medium truncate">{item.name}</p>
                      <p className="text-xs text-[#A89060] mb-3">{item.vendorName}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-gold/20 rounded-sm">
                          <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="w-7 h-7 text-cream/70 hover:text-gold text-sm">−</button>
                          <span className="w-7 text-center text-xs text-cream">{item.quantity}</span>
                          <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="w-7 h-7 text-cream/70 hover:text-gold text-sm">+</button>
                        </div>
                        <span className="font-serif text-gold">₦{(item.price * item.quantity).toLocaleString()}</span>
                        <button onClick={() => removeItem(item.productId)} className="text-cream/30 hover:text-red-400 transition-colors">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="card p-6 h-fit">
                <h3 className="font-serif text-xl text-cream mb-6">Order Summary</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm text-[#A89060]">
                    <span>Subtotal ({items.length} items)</span>
                    <div className="text-right">
                      <div className="text-cream">₦{calculateSubtotalWithBulk().toLocaleString()}</div>
                      {items.some(i => i.quantity > 6 && i.bulkPrice) && (
                        <span className="text-[10px] text-gold">✓ Bulk discount applied</span>
                      )}
                    </div>
                  </div>
                  {items.some(i => i.quantity > 6 && i.bulkPrice) && (
                    <div className="flex justify-between text-xs text-gold/70 bg-gold/10 px-2 py-1 rounded">
                      <span>📦 6+ yards gets bulk pricing</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-[#A89060]">
                    <span>Delivery Fee</span>
                    <span className="text-cream">₦{deliveryFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[#A89060]">
                    <span>Platform fee (5%)</span>
                    <span>₦{platformFee.toLocaleString()}</span>
                  </div>
                </div>
                <div className="border-t border-gold/10 pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-sm text-cream">Total</span>
                    <span className="font-serif text-xl text-gold">₦{(calculateSubtotalWithBulk() + platformFee + deliveryFee).toLocaleString()}</span>
                  </div>
                </div>
                <button onClick={handleCheckout} className="btn-primary w-full flex items-center justify-center gap-2">
                  Checkout Securely <FiArrowRight size={14} />
                </button>
                <p className="text-[10px] text-center text-[#A89060] mt-3">🔒 Secured by Paystack · Escrow Protected</p>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  )
}

export default withProtectedRoute(CartPage, { requireRole: 'buyer' })
