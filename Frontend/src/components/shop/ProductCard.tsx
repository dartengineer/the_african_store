import Image from 'next/image'
import Link from 'next/link'
import { FiShoppingBag, FiStar } from 'react-icons/fi'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'

export interface Product {
  _id: string
  name: string
  category: string
  price: number
  bulkPrice?: number
  images: string[]
  vendorId: { _id: string; storeName: string; rating: number }
  state: string
  quantityAvailable: number
  featured?: boolean
}

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      bulkPrice: product.bulkPrice,
      quantity: 1,
      image: product.images[0] || '',
      vendorId: product.vendorId._id,
      vendorName: product.vendorId.storeName,
    })
    toast.success(`${product.name} added to cart`)
  }

  return (
    <Link href={`/shop/${product._id}`} className="group block">
      <div className="card overflow-hidden">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-brown-warm">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gold/30 font-serif text-4xl">
              TAS
            </div>
          )}
          {product.featured && (
            <span className="absolute top-3 left-3 badge badge-pending">Featured</span>
          )}
          {/* Add to cart overlay */}
          <button
            onClick={handleAddToCart}
            className="absolute bottom-0 left-0 right-0 py-3 bg-gold text-brown-deep text-xs tracking-widest uppercase font-medium
              translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2"
          >
            <FiShoppingBag size={14} />
            Add to Cart
          </button>
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-1">
            <p className="text-[10px] tracking-widest uppercase text-[#A89060]">{product.category}</p>
            <p className="text-[10px] tracking-wide text-[#A89060]">{product.state}</p>
          </div>
          <h3 className="font-serif text-base text-cream mb-1 line-clamp-1">{product.name}</h3>
          <p className="text-[11px] text-[#A89060] mb-3">{product.vendorId.storeName}</p>

          <div className="flex items-center justify-between">
            <div>
              <span className="font-serif text-gold text-lg">₦{product.price.toLocaleString()}</span>
              {product.bulkPrice && (
                <span className="text-xs text-[#A89060] ml-2">Bulk: ₦{product.bulkPrice.toLocaleString()}</span>
              )}
            </div>
            {product.vendorId.rating > 0 && (
              <div className="flex items-center gap-1 text-gold">
                <FiStar size={11} className="fill-gold" />
                <span className="text-xs">{product.vendorId.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
