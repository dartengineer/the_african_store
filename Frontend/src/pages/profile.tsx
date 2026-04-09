import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Layout from '@/components/layout/Layout'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface VendorProfile {
  storeName: string
  storeDescription: string
  phone: string
  state: string
  rating: number
  totalReviews: number
  isApproved: boolean
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { register, handleSubmit, reset, watch } = useForm()
  const [vendorData, setVendorData] = useState<VendorProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/profile')
      return
    }
    fetchProfileData()
  }, [user])

  const fetchProfileData = async () => {
    try {
      if (user?.role === 'vendor') {
        const { data } = await api.get('/vendor/profile')
        setVendorData(data.profile)
        reset({
          name: user.name,
          email: user.email,
          phone: user.phone,
          state: user.state,
          storeName: data.profile.storeName,
          storeDescription: data.profile.storeDescription,
        })
      } else {
        reset({
          name: user?.name,
          email: user?.email,
          phone: user?.phone,
          state: user?.state,
        })
      }
    } catch (err) {
      console.error('Failed to fetch profile data', err)
    }
  }

  const onSubmit = async (data: any) => {
    setLoading(true)
    try {
      // Update user profile
      await api.patch('/auth/profile', {
        name: data.name,
        phone: data.phone,
        state: data.state,
      })

      // If vendor, also update vendor-specific data
      if (user?.role === 'vendor') {
        await api.patch('/vendor/profile', {
          storeName: data.storeName,
          storeDescription: data.storeDescription,
          phone: data.phone,
        })
      }

      toast.success('Profile updated successfully')
      setEditing(false)
      // Refresh data
      fetchProfileData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      logout()
      router.push('/')
    }
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Head><title>My Profile — The African Store</title></Head>
      <Layout>
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="mb-8">
            <div className="section-eyebrow">Account</div>
            <h1 className="font-serif text-4xl font-light text-cream">
              My <em className="text-gold italic">Profile</em>
            </h1>
          </div>

          {/* Role Badge */}
          <div className="mb-8">
            <div className="inline-block px-3 py-1 rounded bg-gold/20 text-gold text-sm font-medium capitalize">
              {user.role}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <div className="card p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif text-2xl text-cream">Basic Information</h2>
                {!editing ? (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="text-gold hover:text-cream text-sm"
                  >
                    Edit
                  </button>
                ) : null}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-[#A89060] block mb-2">Full Name</label>
                  <input
                    {...register('name')}
                    disabled={!editing}
                    className="w-full px-4 py-2 rounded bg-brown-deep/30 text-cream border border-gold/20 focus:border-gold outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-sm text-[#A89060] block mb-2">Email</label>
                  <input
                    {...register('email')}
                    disabled
                    className="w-full px-4 py-2 rounded bg-brown-deep/30 text-cream border border-gold/20 cursor-not-allowed opacity-50"
                  />
                  <p className="text-xs text-[#A89060] mt-1">Email cannot be changed</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-[#A89060] block mb-2">Phone</label>
                    <input
                      {...register('phone')}
                      disabled={!editing}
                      className="w-full px-4 py-2 rounded bg-brown-deep/30 text-cream border border-gold/20 focus:border-gold outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#A89060] block mb-2">State</label>
                    <select
                      {...register('state')}
                      disabled={!editing}
                      className="w-full px-4 py-2 rounded bg-brown-deep/30 text-cream border border-gold/20 focus:border-gold outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="Lagos">Lagos</option>
                      <option value="Abuja">Abuja</option>
                      <option value="Kano">Kano</option>
                      <option value="Rivers">Rivers</option>
                      <option value="Oyo">Oyo</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Vendor-Specific Information */}
            {user.role === 'vendor' && vendorData && (
              <div className="card p-6">
                <h2 className="font-serif text-2xl text-cream mb-6">Store Information</h2>

                {!vendorData.isApproved && (
                  <div className="bg-yellow-500/20 border border-yellow-500/50 rounded p-3 mb-6">
                    <p className="text-xs text-yellow-200">
                      🔄 Your store is pending admin approval. Please complete all information to expedite the process.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-[#A89060] block mb-2">Store Name</label>
                    <input
                      {...register('storeName')}
                      disabled={!editing}
                      className="w-full px-4 py-2 rounded bg-brown-deep/30 text-cream border border-gold/20 focus:border-gold outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-[#A89060] block mb-2">Store Description</label>
                    <textarea
                      {...register('storeDescription')}
                      disabled={!editing}
                      rows={4}
                      className="w-full px-4 py-2 rounded bg-brown-deep/30 text-cream border border-gold/20 focus:border-gold outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-[#A89060] block mb-2">Rating</label>
                      <div className="px-4 py-2 rounded bg-brown-deep/30 text-cream flex items-center gap-2">
                        <span className="text-lg">⭐</span>
                        <span>{(vendorData.rating || 0).toFixed(1)} / 5.0</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-[#A89060] block mb-2">Reviews</label>
                      <div className="px-4 py-2 rounded bg-brown-deep/30 text-cream">
                        {vendorData.totalReviews || 0} reviews
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-[#A89060] block mb-2">Status</label>
                    <div className="px-4 py-2 rounded bg-brown-deep/30 text-cream">
                      <span className={vendorData.isApproved ? 'text-green-300' : 'text-yellow-300'}>
                        {vendorData.isApproved ? '✓ Approved' : '⏳ Pending Approval'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              {editing ? (
                <>
                  <button type="submit" disabled={loading} className="btn-primary flex-1">
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false)
                      fetchProfileData()
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn-secondary w-full"
                >
                  Log Out
                </button>
              )}
            </div>
          </form>
        </div>
      </Layout>
    </>
  )
}
