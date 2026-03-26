import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

interface FormData {
  email: string
  password: string
}

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuthStore()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password)
      const redirect = (router.query.redirect as string) || '/'
      router.push(redirect)
      toast.success('Welcome back!')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <>
      <Head><title>Sign In — The African Store</title></Head>
      <div className="min-h-screen bg-brown-deep flex items-center justify-center px-4">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at 30% 50%, rgba(43,93,66,0.2) 0%, transparent 60%)'
        }} />

        <div className="w-full max-w-md relative z-10">
          {/* Logo */}
          <Link href="/" className="block text-center font-serif text-2xl tracking-widest uppercase text-gold mb-10">
            T<span className="text-cream font-light">he </span>
            A<span className="text-cream font-light">frican </span>
            S<span className="text-cream font-light">tore</span>
          </Link>

          <div className="card p-8">
            <h1 className="font-serif text-2xl text-cream mb-1">Welcome back</h1>
            <p className="text-xs text-[#A89060] mb-8">Sign in to continue shopping</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                  {...register('email', { required: 'Email is required' })}
                />
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  {...register('password', { required: 'Password is required' })}
                />
                {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full">
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-xs text-[#A89060] mt-6">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-gold hover:text-gold-light">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
