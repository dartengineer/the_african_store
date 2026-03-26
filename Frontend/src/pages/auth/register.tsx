import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara'
]

interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: 'buyer' | 'vendor'
  state: string
  phone: string
}

export default function RegisterPage() {
  const router = useRouter()
  const { register: registerUser, isLoading } = useAuthStore()
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: { role: (router.query.role as 'buyer' | 'vendor') || 'buyer' }
  })

  const role = watch('role')
  const password = watch('password')

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        state: data.state,
        phone: data.phone,
      })
      if (data.role === 'vendor') {
        router.push('/vendor/onboarding')
      } else {
        router.push('/')
      }
      toast.success('Account created!')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <>
      <Head><title>Create Account — The African Store</title></Head>
      <div className="min-h-screen bg-brown-deep flex items-center justify-center px-4 py-12">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at 70% 40%, rgba(201,168,76,0.08) 0%, transparent 60%)'
        }} />
        <div className="w-full max-w-md relative z-10">
          <Link href="/" className="block text-center font-serif text-2xl tracking-widest uppercase text-gold mb-10">
            T<span className="text-cream font-light">he </span>
            A<span className="text-cream font-light">frican </span>
            S<span className="text-cream font-light">tore</span>
          </Link>

          <div className="card p-8">
            <h1 className="font-serif text-2xl text-cream mb-1">Create Account</h1>
            <p className="text-xs text-[#A89060] mb-8">Join thousands of buyers and vendors</p>

            {/* Role toggle */}
            <div className="flex mb-6 border border-gold/20 rounded-sm overflow-hidden">
              {(['buyer', 'vendor'] as const).map((r) => (
                <label key={r} className={`flex-1 text-center py-2.5 text-xs tracking-widest uppercase cursor-pointer transition-all ${
                  role === r ? 'bg-gold text-brown-deep font-medium' : 'text-cream/60 hover:text-cream'
                }`}>
                  <input type="radio" value={r} {...register('role')} className="hidden" />
                  {r === 'buyer' ? '🛍 Buyer' : '🏪 Vendor'}
                </label>
              ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input className="input-field" placeholder="Adaeze Okonkwo" {...register('name', { required: 'Name required' })} />
                {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="label">Email Address</label>
                <input type="email" className="input-field" placeholder="you@example.com" {...register('email', { required: 'Email required' })} />
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="label">Phone Number</label>
                <input className="input-field" placeholder="08012345678" {...register('phone', { required: 'Phone required' })} />
                {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="label">State</label>
                <select className="input-field" {...register('state', { required: 'State required' })}>
                  <option value="">Select your state</option>
                  {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.state && <p className="text-xs text-red-400 mt-1">{errors.state.message}</p>}
              </div>

              <div>
                <label className="label">Password</label>
                <input type="password" className="input-field" placeholder="Min. 8 characters" {...register('password', { required: 'Password required', minLength: { value: 8, message: 'Min 8 characters' } })} />
                {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="label">Confirm Password</label>
                <input type="password" className="input-field" placeholder="Repeat password" {...register('confirmPassword', {
                  required: 'Please confirm password',
                  validate: (v) => v === password || 'Passwords do not match'
                })} />
                {errors.confirmPassword && <p className="text-xs text-red-400 mt-1">{errors.confirmPassword.message}</p>}
              </div>

              {role === 'vendor' && (
                <div className="bg-green-royal/30 border border-green-royal/50 rounded-sm p-3 text-xs text-cream/60 leading-relaxed">
                  ℹ️ Vendor accounts require admin approval before you can list products. You'll be notified by email.
                </div>
              )}

              <button type="submit" disabled={isLoading} className="btn-primary w-full !mt-6">
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-xs text-[#A89060] mt-6">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-gold hover:text-gold-light">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
