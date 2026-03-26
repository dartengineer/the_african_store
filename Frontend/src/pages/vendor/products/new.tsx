import Head from 'next/head'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import Layout from '@/components/layout/Layout'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FiUpload, FiX } from 'react-icons/fi'

interface FormData {
  name: string
  category: string
  price: number
  bulkPrice?: number
  description: string
  quantityAvailable: number
  featured: boolean
}

export default function NewProductPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>()

  useEffect(() => {
    if (user && user.role !== 'vendor') router.push('/')
    if (!user) router.push('/auth/login')
  }, [user])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)
    try {
      const form = new FormData()
      Array.from(files).forEach((f) => form.append('images', f))
      const { data } = await api.post('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setImages((prev) => [...prev, ...data.urls])
      toast.success(`${data.urls.length} image(s) uploaded`)
    } catch {
      toast.error('Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    if (images.length === 0) { toast.error('Please upload at least one product image'); return }
    try {
      await api.post('/products', {
        ...data,
        price: Number(data.price),
        bulkPrice: data.bulkPrice ? Number(data.bulkPrice) : undefined,
        quantityAvailable: Number(data.quantityAvailable),
        images,
      })
      toast.success('Product listed successfully!')
      router.push('/vendor/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to list product')
    }
  }

  return (
    <>
      <Head><title>Add Product — The African Store</title></Head>
      <Layout>
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="section-eyebrow">Vendor Portal</div>
          <h1 className="font-serif text-4xl font-light text-cream mb-10">
            List a <em className="text-gold italic">Product</em>
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Image upload */}
            <div>
              <label className="label">Product Images (up to 5)</label>
              <div className="flex flex-wrap gap-3 mb-3">
                {images.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-sm overflow-hidden">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 bg-brown-deep/80 rounded-full p-0.5 text-cream hover:text-red-400"
                    >
                      <FiX size={10} />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="w-20 h-20 border border-dashed border-gold/30 rounded-sm flex flex-col items-center justify-center cursor-pointer hover:border-gold transition-colors text-[#A89060] hover:text-gold">
                    <FiUpload size={16} className="mb-1" />
                    <span className="text-[9px] tracking-wide uppercase">{uploading ? '...' : 'Upload'}</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                )}
              </div>
              <p className="text-[10px] text-[#A89060]">Upload clear, well-lit photos. Minimum 800×800px recommended.</p>
            </div>

            <div>
              <label className="label">Product Name</label>
              <input className="input-field" placeholder="Premium Blue Ankara Wax Print" {...register('name', { required: 'Required' })} />
              {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">Category</label>
              <select className="input-field" {...register('category', { required: 'Required' })}>
                <option value="">Select category</option>
                {['ankara', 'lace', 'senator', 'aso-oke', 'kente', 'adire', 'other'].map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-red-400 mt-1">{errors.category.message}</p>}
            </div>

            <div>
              <label className="label">Description</label>
              <textarea rows={4} className="input-field resize-none"
                placeholder="Describe the fabric: material, weight, pattern, wash instructions, width per yard..."
                {...register('description', { required: 'Required', minLength: { value: 20, message: 'Be more descriptive' } })} />
              {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Price per Yard (₦)</label>
                <input type="number" className="input-field" placeholder="3500"
                  {...register('price', { required: 'Required', min: { value: 1, message: 'Must be > 0' } })} />
                {errors.price && <p className="text-xs text-red-400 mt-1">{errors.price.message}</p>}
              </div>
              <div>
                <label className="label">Bulk Price (₦) — optional</label>
                <input type="number" className="input-field" placeholder="3000 (6+ yards)"
                  {...register('bulkPrice')} />
              </div>
            </div>

            <div>
              <label className="label">Quantity Available (yards)</label>
              <input type="number" className="input-field" placeholder="50"
                {...register('quantityAvailable', { required: 'Required', min: { value: 1, message: 'Must be > 0' } })} />
              {errors.quantityAvailable && <p className="text-xs text-red-400 mt-1">{errors.quantityAvailable.message}</p>}
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-gold" {...register('featured')} />
              <span className="text-xs text-[#A89060]">Request featured listing (subject to admin approval & fee)</span>
            </label>

            <button type="submit" disabled={isSubmitting || uploading} className="btn-primary w-full">
              {isSubmitting ? 'Listing product...' : 'List Product'}
            </button>
          </form>
        </div>
      </Layout>
    </>
  )
}
