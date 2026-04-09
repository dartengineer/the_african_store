import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from 'react-query'
import Layout from '@/components/layout/Layout'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiLoader } from 'react-icons/fi'
import Link from 'next/link'

const FABRIC_CATEGORIES = [
  'Aso-Oke',
  'Ankara',
  'Linen',
  'Silk',
  'Cotton',
  'Wool',
  'Damask',
  'Adire',
  'Kente',
  'Other'
]

interface ProductFormData {
  name: string
  category: string
  price: number
  bulkPrice?: number
  description: string
  quantityAvailable: number
  featured: boolean
}

interface Product extends ProductFormData {
  _id: string
  vendorId: any
  images: string[]
  isActive: boolean
  createdAt: string
}

export default function EditProductPage() {
  const router = useRouter()
  const { productId } = router.query
  const { user } = useAuthStore()
  const [isReady, setIsReady] = useState(false)

  // Fetch product data using react-query
  const { data: productData, isLoading: isLoadingProduct, error: productError } = useQuery<{ product: Product }>(
    ['product', productId],
    () => api.get(`/vendor/products/${productId}`).then((r) => r.data),
    {
      enabled: !!productId && !!user,
      staleTime: Infinity,
    }
  )

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ProductFormData>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      category: '',
      price: 0,
      bulkPrice: 0,
      description: '',
      quantityAvailable: 0,
      featured: false,
    }
  })

  // Populate form when product data is loaded
  useEffect(() => {
    if (productData?.product) {
      const p = productData.product
      reset({
        name: p.name,
        category: p.category,
        price: p.price,
        bulkPrice: p.bulkPrice || 0,
        description: p.description,
        quantityAvailable: p.quantityAvailable,
        featured: p.featured || false,
      })
      setIsReady(true)
    }
  }, [productData, reset])

  useEffect(() => {
    if (!user || user.role !== 'vendor') {
      router.push('/')
      return
    }
  }, [user])

  const onSubmit = async (formData: ProductFormData) => {
    try {
      await api.patch(`/vendor/products/${productId}`, formData)
      toast.success('Product updated successfully!')
      router.push('/vendor/products')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update product')
    }
  }

  if (!user || user.role !== 'vendor') return null

  if (isLoadingProduct) {
    return (
      <>
        <Head>
          <title>Edit Product — The African Store</title>
        </Head>
        <Layout>
          <div className="max-w-2xl mx-auto px-6 py-12 flex justify-center">
            <FiLoader className="animate-spin text-gold" size={32} />
          </div>
        </Layout>
      </>
    )
  }

  if (productError || !productData?.product) {
    const errorMessage = (productError as any)?.response?.data?.message || 'Failed to load product'
    return (
      <>
        <Head>
          <title>Edit Product — The African Store</title>
        </Head>
        <Layout>
          <div className="max-w-2xl mx-auto px-6 py-12 text-center">
            <p className="text-red-400 mb-2">Failed to load product</p>
            <p className="text-red-300 text-sm mb-4">{errorMessage}</p>
            <Link href="/vendor/products" className="btn-primary">
              Back to Products
            </Link>
          </div>
        </Layout>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Edit {productData.product.name} — The African Store</title>
      </Head>
      <Layout>
        <div className="max-w-2xl mx-auto px-6 py-12">
          {/* Header with back button */}
          <div className="mb-10">
            <Link href="/vendor/products" className="flex items-center gap-2 text-gold hover:text-gold-light transition-colors mb-4">
              <FiArrowLeft size={16} /> Back to Products
            </Link>
            <div className="section-eyebrow">Vendor Portal</div>
            <h1 className="font-serif text-4xl font-light text-cream">
              Edit <em className="text-gold italic">Product</em>
            </h1>
            <p className="text-sm text-[#A89060] mt-2">{productData.product.name}</p>
          </div>

          {/* Form */}
          <div className="card p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" key={productData?.product._id}>
              {/* Product Name */}
              <div>
                <label className="label">Product Name <span className="text-gold">*</span></label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Premium Aso-Oke with Gold Thread"
                  {...register('name', { required: 'Product name is required', minLength: { value: 3, message: 'At least 3 characters' } })}
                />
                {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="label">Fabric Category <span className="text-gold">*</span></label>
                <select
                  className="input-field"
                  {...register('category', { required: 'Please select a category' })}
                >
                  <option value="">Select category...</option>
                  {FABRIC_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <p className="text-xs text-red-400 mt-1">{errors.category.message}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="label">Description <span className="text-gold">*</span></label>
                <textarea
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Describe the fabric, color, pattern, quality, etc..."
                  {...register('description', { required: 'Description is required', minLength: { value: 20, message: 'At least 20 characters' } })}
                />
                {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description.message}</p>}
              </div>

              {/* Price */}
              <div>
                <label className="label">Price per Yard (₦) <span className="text-gold">*</span></label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="5000"
                  step=".01"
                  {...register('price', { 
                    required: 'Price is required', 
                    valueAsNumber: true,
                    min: { value: 1, message: 'Must be greater than 0' } 
                  })}
                />
                {errors.price && <p className="text-xs text-red-400 mt-1">{errors.price.message}</p>}
              </div>

              {/* Bulk Price */}
              <div>
                <label className="label">Bulk Price per Yard (₦) <span className="text-[#A89060] text-[10px]">(Optional)</span></label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="4500 (for orders of 10+ yards)"
                  step=".01"
                  {...register('bulkPrice', { valueAsNumber: true })}
                />
                <p className="text-xs text-[#A89060] mt-1">💡 Offer a discount for larger bulk orders</p>
              </div>

              {/* Quantity */}
              <div>
                <label className="label">Quantity Available (yards) <span className="text-gold">*</span></label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="50"
                  {...register('quantityAvailable', { 
                    required: 'Quantity is required', 
                    valueAsNumber: true,
                    min: { value: 1, message: 'Must be at least 1' } 
                  })}
                />
                {errors.quantityAvailable && <p className="text-xs text-red-400 mt-1">{errors.quantityAvailable.message}</p>}
              </div>

              {/* Featured */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  {...register('featured')}
                  className="w-4 h-4 rounded cursor-pointer"
                />
                <label className="text-xs tracking-widest uppercase text-gold cursor-pointer">
                  Feature this product (appears in store highlights)
                </label>
              </div>

              {/* Info box */}
              <div className="bg-brown-warm/30 border border-gold/10 rounded-sm p-4 text-xs text-[#A89060] leading-relaxed">
                💡 <strong className="text-cream/70">Tip:</strong> Add clear, high-quality images when creating or editing products. Good photos increase your sales.
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <FiLoader className="animate-spin" size={16} /> Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </form>
          </div>
        </div>
      </Layout>
    </>
  )
}
