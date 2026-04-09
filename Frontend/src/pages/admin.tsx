import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Layout from '@/components/layout/Layout'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { FiCheck, FiX, FiLoader, FiMail, FiPhone, FiMapPin, FiArrowRight } from 'react-icons/fi'

interface Vendor {
  _id: string
  storeName: string
  storeDescription?: string
  state: string
  phone: string
  isApproved: boolean
  bankDetails?: {
    bankName?: string
    accountNumber?: string
    accountName?: string
  }
  createdAt: string
  userId: {
    name: string
    email: string
    phone: string
    state: string
    createdAt: string
  }
}

interface Stats {
  totalUsers: number
  totalVendors: number
  pendingVendors: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
}

export default function AdminPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [tab, setTab] = useState<'pending' | 'stats'>('stats')
  const [stats, setStats] = useState<Stats | null>(null)
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState<string | null>(null)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/')
      return
    }
    fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [statsRes, vendorsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/vendors/pending'),
      ])
      setStats(statsRes.data)
      setVendors(vendorsRes.data.vendors)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveVendor = async (vendorId: string) => {
    setApproving(vendorId)
    try {
      await api.patch(`/admin/vendors/${vendorId}/approve`)
      toast.success('Vendor approved! ✅')
      setVendors(vendors.filter((v) => v._id !== vendorId))
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to approve vendor')
    } finally {
      setApproving(null)
    }
  }

  const handleRejectVendor = async (vendorId: string) => {
    setApproving(vendorId)
    try {
      await api.patch(`/admin/vendors/${vendorId}/reject`)
      toast.success('Vendor rejected')
      setVendors(vendors.filter((v) => v._id !== vendorId))
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reject vendor')
    } finally {
      setApproving(null)
    }
  }

  if (!user || user.role !== 'admin') return null

  return (
    <>
      <Head>
        <title>Admin Panel — The African Store</title>
      </Head>
      <Layout>
        <div className="px-6 py-12 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="section-eyebrow">Administration</div>
            <h1 className="font-serif text-4xl font-light text-cream">
              Platform <em className="text-gold italic">Dashboard</em>
            </h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-gold/20">
            <button
              onClick={() => setTab('stats')}
              className={`px-6 py-3 text-xs tracking-widest uppercase transition-all border-b-2 ${
                tab === 'stats'
                  ? 'border-gold text-gold'
                  : 'border-transparent text-cream/60 hover:text-cream'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setTab('pending')}
              className={`px-6 py-3 text-xs tracking-widest uppercase transition-all border-b-2 relative ${
                tab === 'pending'
                  ? 'border-gold text-gold'
                  : 'border-transparent text-cream/60 hover:text-cream'
              }`}
            >
              Pending Vendors
              {vendors.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-gold text-brown-deep text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {vendors.length}
                </span>
              )}
            </button>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center py-20">
              <FiLoader className="animate-spin text-gold" size={32} />
            </div>
          )}

          {/* STATS TAB */}
          {tab === 'stats' && stats && !loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: '👥' },
                { label: 'Approved Vendors', value: stats.totalVendors, icon: '🏪' },
                { label: 'Pending Approvals', value: stats.pendingVendors, icon: '⏱️' },
                { label: 'Listed Products', value: stats.totalProducts, icon: '🧵' },
                { label: 'Paid Orders', value: stats.totalOrders, icon: '📦' },
                {
                  label: 'Platform Revenue',
                  value: `₦${stats.totalRevenue.toLocaleString()}`,
                  icon: '💰',
                },
              ].map((stat, idx) => (
                <div key={idx} className="card p-6 text-center hover:border-gold/50">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-sm text-[#A89060] mb-2">{stat.label}</div>
                  <div className="font-serif text-3xl text-gold font-light">{stat.value}</div>
                </div>
              ))}

              {/* Management Pages */}
              <div className="col-span-full mt-8 pt-8 border-t border-gold/20">
                <h3 className="text-sm text-[#A89060] uppercase tracking-wide font-medium mb-4">Management</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Link href="/admin/orders">
                    <div className="card p-6 hover:border-gold/40 transition-all cursor-pointer group">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-cream font-medium group-hover:text-gold transition-colors">Manage Orders</p>
                          <p className="text-xs text-[#A89060] mt-1">Update delivery status</p>
                        </div>
                        <FiArrowRight className="text-gold group-hover:translate-x-1 transition-transform" size={20} />
                      </div>
                    </div>
                  </Link>
                  <Link href="/admin/vendors">
                    <div className="card p-6 hover:border-gold/40 transition-all cursor-pointer group">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-cream font-medium group-hover:text-gold transition-colors">Manage Vendors</p>
                          <p className="text-xs text-[#A89060] mt-1">Suspend or delete vendors</p>
                        </div>
                        <FiArrowRight className="text-gold group-hover:translate-x-1 transition-transform" size={20} />
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* PENDING VENDORS TAB */}
          {tab === 'pending' && !loading && (
            <div className="space-y-4">
              {vendors.length === 0 ? (
                <div className="card p-12 text-center">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="text-cream/60">No pending vendor approvals!</p>
                </div>
              ) : (
                vendors.map((vendor) => (
                  <div key={vendor._id} className="card p-6 border-gold/30">
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Left: Vendor Info */}
                      <div>
                        <h3 className="font-serif text-lg text-cream mb-4">{vendor.storeName}</h3>
                        <div className="space-y-2 text-xs text-[#A89060]">
                          <div className="flex items-center gap-2">
                            <span className="text-cream font-medium">{vendor.userId.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FiMail size={12} />
                            <span>{vendor.userId.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FiPhone size={12} />
                            <span>{vendor.userId.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FiMapPin size={12} />
                            <span>{vendor.userId.state}</span>
                          </div>
                          <div className="text-[10px] text-cream/40 mt-3">
                            Applied: {new Date(vendor.userId.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {/* Middle: Store & Bank Details */}
                      <div>
                        <h4 className="text-xs tracking-widest uppercase text-gold mb-3">
                          Store Details
                        </h4>
                        <p className="text-xs text-cream/70 leading-relaxed mb-4">
                          {vendor.storeDescription || '(No description provided)'}
                        </p>
                        {vendor.bankDetails && (
                          <div>
                            <h4 className="text-xs tracking-widest uppercase text-gold mb-2">
                              Bank Details
                            </h4>
                            <div className="space-y-1 text-xs text-cream/60">
                              <div>
                                <span className="text-cream/40">Bank: </span>
                                {vendor.bankDetails.bankName || 'N/A'}
                              </div>
                              <div>
                                <span className="text-cream/40">Account: </span>
                                {vendor.bankDetails.accountNumber
                                  ? `****${vendor.bankDetails.accountNumber.slice(-4)}`
                                  : 'N/A'}
                              </div>
                              <div>
                                <span className="text-cream/40">Name: </span>
                                {vendor.bankDetails.accountName || 'N/A'}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-col gap-3 justify-center">
                        <button
                          onClick={() => handleApproveVendor(vendor._id)}
                          disabled={approving === vendor._id}
                          className="btn-primary flex items-center justify-center gap-2 !bg-green-600 hover:!bg-green-700"
                        >
                          {approving === vendor._id ? (
                            <>
                              <FiLoader className="animate-spin" size={14} /> Approving...
                            </>
                          ) : (
                            <>
                              <FiCheck size={14} /> Approve
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleRejectVendor(vendor._id)}
                          disabled={approving === vendor._id}
                          className="btn-secondary flex items-center justify-center gap-2 !text-red-400 border-red-400/30 hover:border-red-400"
                        >
                          {approving === vendor._id ? (
                            <>
                              <FiLoader className="animate-spin" size={14} /> Rejecting...
                            </>
                          ) : (
                            <>
                              <FiX size={14} /> Reject
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </Layout>
    </>
  )
}
