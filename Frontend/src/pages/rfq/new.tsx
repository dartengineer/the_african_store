import Head from 'next/head'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import Layout from '@/components/layout/Layout'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { useEffect } from 'react'

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara'
]

interface FormData {
  description: string
  budgetMin: number
  budgetMax: number
  state: string
}

export default function NewRFQPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>()

  useEffect(() => {
    if (!user) router.push('/auth/login?redirect=/rfq/new')
  }, [user])

  const onSubmit = async (data: FormData) => {
    try {
      const { data: res } = await api.post('/rfq', {
        description: data.description,
        budgetRange: { min: Number(data.budgetMin), max: Number(data.budgetMax) },
        state: data.state,
      })
      toast.success('Fabric request posted! Vendors will respond shortly.')
      router.push(`/rfq/${res.request._id}`)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to post request')
    }
  }

  return (
    <>
      <Head><title>Post Fabric Request — The African Store</title></Head>
      <Layout>
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="section-eyebrow">Request for Quote</div>
          <h1 className="font-serif text-4xl font-light text-cream mb-2">
            Post a Fabric <em className="text-gold italic">Request</em>
          </h1>
          <p className="text-sm text-[#A89060] mb-10">Describe what you need, set your budget, and let vendors compete for your order.</p>

          <div className="card p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="label">Describe the Fabric You Need</label>
                <textarea
                  rows={5}
                  className="input-field resize-none"
                  placeholder="E.g. I'm looking for 6 yards of deep blue Aso-Oke with gold trim pattern. Need it for a wedding in 3 weeks. Quality must be premium..."
                  {...register('description', {
                    required: 'Please describe what you need',
                    minLength: { value: 30, message: 'Please be more descriptive (min 30 characters)' }
                  })}
                />
                {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Min Budget (₦)</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="5000"
                    {...register('budgetMin', { required: 'Required', min: { value: 100, message: 'Min ₦100' } })}
                  />
                  {errors.budgetMin && <p className="text-xs text-red-400 mt-1">{errors.budgetMin.message}</p>}
                </div>
                <div>
                  <label className="label">Max Budget (₦)</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="20000"
                    {...register('budgetMax', { required: 'Required' })}
                  />
                  {errors.budgetMax && <p className="text-xs text-red-400 mt-1">{errors.budgetMax.message}</p>}
                </div>
              </div>

              <div>
                <label className="label">Your State (for vendor matching)</label>
                <select className="input-field" {...register('state', { required: 'Please select your state' })}>
                  <option value="">Select state</option>
                  {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.state && <p className="text-xs text-red-400 mt-1">{errors.state.message}</p>}
              </div>

              <div className="bg-brown-warm/30 border border-gold/10 rounded-sm p-4 text-xs text-[#A89060] leading-relaxed">
                💡 <strong className="text-cream/70">Tip:</strong> The more detail you give, the better vendor offers you'll receive. Include fabric type, color, quantity in yards, purpose (e.g. wedding, aso-ebi), and your timeline.
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? 'Posting...' : 'Post Fabric Request'}
              </button>
            </form>
          </div>
        </div>
      </Layout>
    </>
  )
}
