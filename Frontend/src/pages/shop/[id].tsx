import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useQuery } from 'react-query'
import Layout from '@/components/layout/Layout'
import api from '@/lib/api'
import { useCartStore } from '@/store/cartStore'
import { FiStar, FiShoppingBag, FiMapPin, FiPackage } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function ProductDetail() {
  const router = useRouter()
  const { id } = router.query
  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState(0)
  const addItem = useCartStore((s) => s.addItem)

  const { data, isLoading } = useQuery(
    ['product', id],
    () => api.get(`/products/${id}`).then((r) => r.data.product),
    { enabled: !!id }
  )

  const handleAddToCart = () => {
    if (!data) return
    addItem({
      productId: data._id,
      name: data.name,
      price: data.price,
      quantity: qty,
      image: data.images[0] || '',
      vendorId: data.vendorId._id,
      vendorName: data.vendorId.storeName,
    })
    toast.success(`Added ${qty} × ${data.name} to cart`)
  }

  if (isLoading) return (
    <Layout><div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12">
      <div className="aspect-square bg-brown-mid animate-pulse rounded-sm" />
      <div className="space-y-4">
        {[140, 80, 100, 60].map((w, i) => (
          <div key={i} className="h-6 bg-brown-mid animate-pulse rounded-sm" style={{ width: `${w}px` }} />
        ))}
      </div>
    </div></Layout>
  )

  if (!data) return <Layout><div className="text-center py-40 text-cream/40">Product not found.</div></Layout>

  return (
    <>
      <Head><title>{data.name} — The African Store</title></Head>
      <Layout>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Images */}
            <div>
              <div className="relative aspect-square rounded-sm overflow-hidden bg-brown-mid mb-3">
                {data.images[activeImg] && (
                  <Image src={data.images[activeImg]} alt={data.name} fill className="object-cover" />
                )}
              </div>
              {data.images.length > 1 && (
                <div className="flex gap-2">
                  {data.images.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`relative w-16 h-16 rounded-sm overflow-hidden border-2 transition-all ${
                        activeImg === i ? 'border-gold' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image src={img} alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <span className="text-xs tracking-widest uppercase text-gold">{data.category}</span>
              <h1 className="font-serif text-3xl text-cream mt-1 mb-3">{data.name}</h1>

              {/* Vendor */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gold/10">
                <div>
                  <p className="text-sm text-cream font-medium">{data.vendorId.storeName}</p>
                  <div className="flex items-center gap-4 text-xs text-[#A89060]">
                    <span className="flex items-center gap-1">
                      <FiMapPin size={11} /> {data.state}
                    </span>
                    {data.vendorId.rating > 0 && (
                      <span className="flex items-center gap-1">
                        <FiStar size={11} className="fill-gold text-gold" />
                        {data.vendorId.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="font-serif text-3xl text-gold">₦{data.price.toLocaleString()}</span>
                {data.bulkPrice && (
                  <div className="text-xs text-[#A89060] mt-1">
                    Bulk price: <span className="text-cream">₦{data.bulkPrice.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Stock */}
              <div className="flex items-center gap-2 mb-6">
                <FiPackage size={14} className="text-[#A89060]" />
                <span className={`text-xs ${data.quantityAvailable > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {data.quantityAvailable > 0 ? `${data.quantityAvailable} yards available` : 'Out of stock'}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-[#A89060] leading-relaxed mb-8 font-light">{data.description}</p>

              {/* Qty + Cart */}
              {data.quantityAvailable > 0 && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gold/20 rounded-sm">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="w-10 h-10 text-cream hover:text-gold transition-colors"
                    >−</button>
                    <span className="w-10 text-center text-sm text-cream">{qty}</span>
                    <button
                      onClick={() => setQty(Math.min(data.quantityAvailable, qty + 1))}
                      className="w-10 h-10 text-cream hover:text-gold transition-colors"
                    >+</button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <FiShoppingBag size={14} />
                    Add to Cart
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}
