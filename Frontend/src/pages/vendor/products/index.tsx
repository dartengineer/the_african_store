import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Layout from '@/components/layout/Layout'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { FiLoader, FiEdit, FiTrash2, FiPlus, FiImage, FiDollarSign } from 'react-icons/fi'

interface Product {
  _id: string
  name: string
  category: string
  price: number
  bulkPrice?: number
  description: string
  images: string[]
  quantityAvailable: number
  featured: boolean
  isActive: boolean
  createdAt: string
}

export default function VendorProductsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (!user || user.role !== 'vendor') {
      router.push('/')
      return
    }
    fetchProducts()
  }, [user])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/vendor/products')
      setProducts(data.products)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    setDeleting(productId)
    try {
      await api.delete(`/products/${productId}`)
      toast.success('Product deleted')
      setProducts(products.filter((p) => p._id !== productId))
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete product')
    } finally {
      setDeleting(null)
    }
  }

  if (!user || user.role !== 'vendor') return null

  return (
    <>
      <Head>
        <title>My Products — The African Store</title>
      </Head>
      <Layout>
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="flex justify-between items-end mb-10">
            <div>
              <div className="section-eyebrow">Vendor Portal</div>
              <h1 className="font-serif text-4xl font-light text-cream">
                My <em className="text-gold italic">Products</em>
              </h1>
              <p className="text-sm text-[#A89060] mt-2">
                Manage your fabric inventory and listings
              </p>
            </div>
            <Link href="/vendor/products/new" className="btn-primary flex items-center gap-2">
              <FiPlus size={14} /> Add Product
            </Link>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center py-20">
              <FiLoader className="animate-spin text-gold" size={32} />
            </div>
          )}

          {/* Products table */}
          {!loading && (
            <>
              {products.length === 0 ? (
                <div className="card p-12 text-center">
                  <div className="text-4xl mb-3">📦</div>
                  <p className="text-cream/60 mb-4">No products yet</p>
                  <Link href="/vendor/products/new" className="btn-primary">
                    Add Your First Product
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {products.map((product) => (
                    <div key={product._id} className="card p-6 flex flex-col md:flex-row items-start md:items-center gap-6 hover:border-gold/50">
                      {/* Image */}
                      <div className="w-20 h-20 rounded-sm bg-brown-warm flex-shrink-0 overflow-hidden">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gold/30">
                            <FiImage size={24} />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <h3 className="font-serif text-lg text-cream mb-1">{product.name}</h3>
                            <p className="text-xs text-[#A89060] mb-2">{product.category}</p>
                            <p className="text-xs text-cream/60 line-clamp-2">{product.description}</p>
                          </div>

                          {/* Stats */}
                          <div className="flex flex-wrap gap-4 text-xs">
                            <div className="border border-gold/20 rounded-sm px-3 py-2">
                              <div className="text-[#A89060] mb-1">Price</div>
                              <div className="font-serif text-gold">₦{product.price.toLocaleString()}</div>
                            </div>
                            <div className="border border-gold/20 rounded-sm px-3 py-2">
                              <div className="text-[#A89060] mb-1">Available</div>
                              <div className="font-serif text-cream">{product.quantityAvailable} yds</div>
                            </div>
                            <div className="border border-gold/20 rounded-sm px-3 py-2">
                              <div className="text-[#A89060] mb-1">Status</div>
                              <div className={`font-medium ${
                                product.isActive ? 'text-green-400' : 'text-[#A89060]'
                              }`}>
                                {product.isActive ? 'Active' : 'Inactive'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 w-full md:w-auto flex-shrink-0">
                        <Link
                          href={`/vendor/products/${product._id}/edit`}
                          className="btn-secondary flex-1 md:flex-none flex items-center justify-center gap-2 text-xs"
                        >
                          <FiEdit size={14} /> Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          disabled={deleting === product._id}
                          className="btn-secondary flex-1 md:flex-none flex items-center justify-center gap-2 text-xs !text-red-400 border-red-400/30 hover:border-red-400"
                        >
                          {deleting === product._id ? (
                            <>
                              <FiLoader className="animate-spin" size={14} /> Deleting
                            </>
                          ) : (
                            <>
                              <FiTrash2 size={14} /> Delete
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </Layout>
    </>
  )
}
