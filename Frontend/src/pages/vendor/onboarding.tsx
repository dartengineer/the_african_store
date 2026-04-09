import Head from 'next/head'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import Layout from '@/components/layout/Layout'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { FiCheck, FiArrowRight, FiAlertCircle } from 'react-icons/fi'

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara'
]

const NIGERIAN_BANKS = [
  'Access Bank',
  'Zenith Bank',
  'GTBank',
  'First Bank',
  'UBA',
  'Guaranty Trust Bank',
  'Stanbic IBTC',
  'FCMB',
  'Fidelity Bank',
  'Polaris Bank',
  'Wema Bank',
  'Signing Bank',
  'Sterling Bank',
  'United Bank for Africa',
  'Other'
]

interface OnboardingData {
  storeName: string
  storeDescription: string
  bankName: string
  accountNumber: string
  accountName: string
}

export default function VendorOnboarding() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<OnboardingData>({
    mode: 'onBlur',
    defaultValues: {
      storeName: '',
      storeDescription: '',
      bankName: '',
      accountNumber: '',
      accountName: '',
    }
  })

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
    } else if (user.role !== 'vendor') {
      router.push('/')
    }
  }, [user])

  const onSubmit = async (data: OnboardingData) => {
    setIsSubmitting(true)
    try {
      await api.patch('/vendor/profile', {
        storeName: data.storeName,
        storeDescription: data.storeDescription,
        bankDetails: {
          bankName: data.bankName,
          accountNumber: data.accountNumber,
          accountName: data.accountName,
        }
      })
      
      toast.success('🎉 Onboarding complete! Waiting for admin approval...')
      setTimeout(() => {
        router.push('/vendor/dashboard')
      }, 2000)
    } catch (err: any) {
      setIsSubmitting(false)
      toast.error(err.response?.data?.message || 'Failed to save profile')
    }
  }

  if (!user || user.role !== 'vendor') return null

  return (
    <>
      <Head>
        <title>Vendor Onboarding — The African Store</title>
      </Head>
      <Layout>
        <div className="max-w-2xl mx-auto px-6 py-12 min-h-screen">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="section-eyebrow">Welcome to TAS</div>
            <h1 className="font-serif text-4xl font-light text-cream mb-3">
              Complete Your <em className="text-gold italic">Store Profile</em>
            </h1>
            <p className="text-sm text-[#A89060]">
              Just a few quick details to get your store ready. Your account will need admin approval before you can start listing products.
            </p>
          </div>

          {/* Progress indicator */}
          <div className="mb-10 flex gap-1">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all ${
                  s <= step
                    ? 'bg-gold'
                    : 'bg-gold/20'
                }`}
              />
            ))}
          </div>

          {/* Form */}
          <div className="card p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* STEP 1: Store Branding */}
              {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="font-serif text-2xl text-cream mb-6 flex items-center gap-2">
                      <span className="w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center text-gold">1</span>
                      Your Store
                    </h2>
                  </div>

                  {/* Q1: Store Name */}
                  <div>
                    <label className="label">
                      What's your store name? <span className="text-gold">*</span>
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Bola's Premium Fabrics"
                      {...register('storeName', {
                        required: 'Store name is required',
                        minLength: { value: 3, message: 'At least 3 characters' },
                        maxLength: { value: 100, message: 'Max 100 characters' }
                      })}
                    />
                    {errors.storeName && (
                      <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                        <FiAlertCircle size={12} /> {errors.storeName.message}
                      </p>
                    )}
                    <p className="text-xs text-[#A89060] mt-2">
                      💡 Make it memorable and related to your products
                    </p>
                  </div>

                  {/* Q2: Store Description */}
                  <div>
                    <label className="label">
                      Tell buyers about your store <span className="text-gold">*</span>
                    </label>
                    <textarea
                      rows={4}
                      className="input-field resize-none"
                      placeholder="E.g. Specializing in authentic Aso-Oke fabrics for over 10 years. We source directly from weavers in Oyo. Fast delivery within Lagos..."
                      {...register('storeDescription', {
                        required: 'Store description is required',
                        minLength: { value: 20, message: 'At least 20 characters' },
                        maxLength: { value: 500, message: 'Max 500 characters' }
                      })}
                    />
                    {errors.storeDescription && (
                      <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                        <FiAlertCircle size={12} /> {errors.storeDescription.message}
                      </p>
                    )}
                    <p className="text-xs text-[#A89060] mt-2">
                      {watch('storeDescription')?.length || 0}/500 characters
                    </p>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="btn-primary flex items-center gap-2"
                    >
                      Next <FiArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Bank Details */}
              {step === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="font-serif text-2xl text-cream mb-2 flex items-center gap-2">
                      <span className="w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center text-gold">2</span>
                      Payment Details
                    </h2>
                    <p className="text-xs text-[#A89060]">
                      We'll transfer your earnings to this account. Your details are secured.
                    </p>
                  </div>

                  {/* Q3: Bank Name */}
                  <div>
                    <label className="label">
                      Which bank? <span className="text-gold">*</span>
                    </label>
                    <select
                      className="input-field"
                      {...register('bankName', { required: 'Please select your bank' })}
                    >
                      <option value="">Select your bank...</option>
                      {NIGERIAN_BANKS.map((bank) => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </select>
                    {errors.bankName && (
                      <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                        <FiAlertCircle size={12} /> {errors.bankName.message}
                      </p>
                    )}
                  </div>

                  {/* Q4: Account Number */}
                  <div>
                    <label className="label">
                      Account number <span className="text-gold">*</span>
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="0123456789"
                      {...register('accountNumber', {
                        required: 'Account number is required',
                        pattern: { value: /^\d{10}$/, message: 'Must be 10 digits' }
                      })}
                    />
                    {errors.accountNumber && (
                      <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                        <FiAlertCircle size={12} /> {errors.accountNumber.message}
                      </p>
                    )}
                  </div>

                  {/* Q5: Account Name */}
                  <div>
                    <label className="label">
                      Account holder name <span className="text-gold">*</span>
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="As shown on your bank account"
                      {...register('accountName', {
                        required: 'Account name is required',
                        minLength: { value: 3, message: 'At least 3 characters' }
                      })}
                    />
                    {errors.accountName && (
                      <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                        <FiAlertCircle size={12} /> {errors.accountName.message}
                      </p>
                    )}
                    <p className="text-xs text-[#A89060] mt-2">
                      💡 Must match your bank account exactly
                    </p>
                  </div>

                  {/* Security notice */}
                  <div className="bg-green-royal/30 border border-green-royal/50 rounded-sm p-4 text-xs text-cream/60 leading-relaxed">
                    🔒 <strong className="text-cream/80">Your data is secure</strong>. Bank details are encrypted and only used for payouts. We never share your information.
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="btn-secondary"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin">⏳</span> Saving...
                        </>
                      ) : (
                        <>
                          <FiCheck size={16} /> Complete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Info card */}
          <div className="mt-8 card p-4 bg-brown-warm/20 border border-gold/10">
            <p className="text-xs text-[#A89060] leading-relaxed">
              <strong className="text-gold">What happens next?</strong> Our admin team will review your store within 24 hours. You'll receive an email notification once approved. After approval, you can start adding products and bidding on fabric requests.
            </p>
          </div>
        </div>
      </Layout>
    </>
  )
}
