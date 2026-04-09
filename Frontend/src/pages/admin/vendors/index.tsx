import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import Layout from '@/components/layout/Layout'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiChevronDown, FiLoader, FiShield, FiAlertCircle, FiTrash2 } from 'react-icons/fi'

interface Vendor {
  _id: string
  userId: {
    _id: string
    name: string
    email: string
    phone: string
  }
  storeName: string
  storeDescription?: string
  state: string
  isApproved: boolean
  isSuspended: boolean
  suspensionReason?: string
  rating: number
  totalReviews: number
  createdAt: string
}

export default function AdminVendors() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [expandedVendorId, setExpandedVendorId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended'>('all')
  const [actioningVendorId, setActioningVendorId] = useState<string | null>(null)
  const [suspensionReason, setSuspensionReason] = useState<string>('')
  const [showSuspensionInput, setShowSuspensionInput] = useState<string | null>(null)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/')
    }
  }, [user, router])

  const { data: vendorsData, isLoading, refetch } = useQuery(
    'admin-all-vendors',
    () => api.get('/admin/vendors/all').then((r) => r.data),
    { staleTime: 60000 }
  )

  const vendors: Vendor[] = vendorsData?.vendors || []
  const filteredVendors = filterStatus === 'all'
    ? vendors
    : filterStatus === 'active'
      ? vendors.filter(v => !v.isSuspended && v.isApproved)
      : vendors.filter(v => v.isSuspended)

  const handleSuspendVendor = async (vendorId: string, reason: string) => {
    if (!reason.trim()) {
      toast.error('Please provide a suspension reason')
      return
    }
    setActioningVendorId(vendorId)
    try {
      await api.patch(`/vendor/${vendorId}/suspend`, { reason })
      toast.success('Vendor suspended successfully')
      setShowSuspensionInput(null)
      setSuspensionReason('')
      refetch()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to suspend vendor')
    } finally {
      setActioningVendorId(null)
    }
  }

  const handleUnsuspendVendor = async (vendorId: string) => {
    setActioningVendorId(vendorId)
    try {
      await api.patch(`/vendor/${vendorId}/unsuspend`)
      toast.success('Vendor unsuspended successfully')
      refetch()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to unsuspend vendor')
    } finally {
      setActioningVendorId(null)
    }
  }

  const handleDeleteVendor = async (vendorId: string) => {
    if (!confirm('Are you sure? This will permanently delete the vendor, all their products, and reviews.')) {
      return
    }
    setActioningVendorId(vendorId)
    try {
      await api.delete(`/vendor/${vendorId}`)
      toast.success('Vendor deleted successfully')
      refetch()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete vendor')
    } finally {
      setActioningVendorId(null)
    }
  }

  if (!user || user.role !== 'admin') return null

  return (
    <>
      <Head>
        <title>Manage Vendors — Admin Panel</title>
      </Head>
      <Layout>
        <div className="min-h-screen pt-32 pb-12">
          <div className="max-w-7xl mx-auto px-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Link href="/admin" className="text-gold hover:text-cream transition-colors">
                <FiArrowLeft size={24} />
              </Link>
              <div>
                <h1 className="font-serif text-3xl text-cream">Manage Vendors</h1>
                <p className="text-[#A89060] text-sm">Suspend, unsuspend, or delete vendors</p>
              </div>
            </div>

            {/* Stats */}
            {!isLoading && vendors.length > 0 && (
              <div className="grid md:grid-cols-3 gap-4 mb-12">
                <div className="card p-6">
                  <p className="text-[#A89060] text-xs uppercase tracking-wide mb-2">Total Vendors</p>
                  <p className="font-serif text-3xl text-gold">{vendors.length}</p>
                </div>
                <div className="card p-6">
                  <p className="text-[#A89060] text-xs uppercase tracking-wide mb-2">Active</p>
                  <p className="font-serif text-3xl text-green-400">{vendors.filter(v => !v.isSuspended && v.isApproved).length}</p>
                </div>
                <div className="card p-6">
                  <p className="text-[#A89060] text-xs uppercase tracking-wide mb-2">Suspended</p>
                  <p className="font-serif text-3xl text-red-400">{vendors.filter(v => v.isSuspended).length}</p>
                </div>
              </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              {(['all', 'active', 'suspended'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-6 py-2 rounded-sm text-sm tracking-wide transition-all whitespace-nowrap ${
                    filterStatus === status
                      ? 'bg-gold text-brown-deep font-medium'
                      : 'bg-brown-warm/50 border border-gold/20 text-cream hover:border-gold'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {/* Vendors List */}
            {isLoading ? (
              <div className="card p-12 text-center">
                <FiLoader className="mx-auto animate-spin text-gold mb-4" size={32} />
                <p className="text-cream/50">Loading vendors...</p>
              </div>
            ) : filteredVendors.length > 0 ? (
              <div className="space-y-3">
                {filteredVendors.map((vendor) => {
                  const isExpanded = expandedVendorId === vendor._id
                  const isSuspended = vendor.isSuspended
                  return (
                    <div key={vendor._id} className={`card overflow-hidden transition-all ${isSuspended ? 'border-red-400/30 bg-red-400/5' : 'hover:border-gold/40'}`}>
                      <button
                        onClick={() => setExpandedVendorId(isExpanded ? null : vendor._id)}
                        className="w-full p-6 flex items-center justify-between gap-4 hover:bg-brown-warm/30 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {isSuspended && (
                            <div className="flex-shrink-0">
                              <FiAlertCircle className="text-red-400" size={24} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <p className="font-serif text-lg text-cream truncate">{vendor.storeName}</p>
                              {isSuspended && (
                                <span className="text-xs bg-red-400/20 text-red-400 px-2 py-1 rounded tracking-wide font-medium">
                                  SUSPENDED
                                </span>
                              )}
                              {!vendor.isApproved && (
                                <span className="text-xs bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded tracking-wide font-medium">
                                  PENDING
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-[#A89060]">{vendor.userId?.name}</p>
                            <p className="text-xs text-cream/50">{vendor.userId?.email}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm text-gold font-medium">⭐ {(vendor.rating || 0).toFixed(1)}</p>
                          <p className="text-xs text-[#A89060]">{vendor.totalReviews || 0} reviews</p>
                        </div>
                        <FiChevronDown
                          className={`text-gold transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          size={20}
                        />
                      </button>

                      {isExpanded && (
                        <div className="border-t border-gold/10 px-6 py-6 space-y-6">
                          {/* Vendor Details */}
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h3 className="text-xs text-gold uppercase tracking-wide mb-3 font-medium">Owner Info</h3>
                              <div className="space-y-2 text-sm">
                                <p className="text-cream">{vendor.userId?.name}</p>
                                <p className="text-[#A89060]">{vendor.userId?.email}</p>
                                <p className="text-[#A89060]">📞 {vendor.userId?.phone}</p>
                              </div>
                            </div>
                            <div>
                              <h3 className="text-xs text-gold uppercase tracking-wide mb-3 font-medium">Store Details</h3>
                              <div className="space-y-2 text-sm">
                                <p className="text-cream">{vendor.storeName}</p>
                                <p className="text-[#A89060]">📍 {vendor.state}</p>
                                <p className="text-[#A89060]">Joined: {new Date(vendor.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          {vendor.storeDescription && (
                            <div>
                              <h3 className="text-xs text-gold uppercase tracking-wide mb-2 font-medium">Description</h3>
                              <p className="text-sm text-[#A89060]">{vendor.storeDescription}</p>
                            </div>
                          )}

                          {/* Suspension Reason */}
                          {isSuspended && vendor.suspensionReason && (
                            <div className="bg-red-400/10 border border-red-400/20 rounded-sm p-4">
                              <h3 className="text-xs text-red-400 uppercase tracking-wide mb-2 font-medium flex items-center gap-2">
                                <FiAlertCircle size={16} />
                                Suspension Reason
                              </h3>
                              <p className="text-sm text-[#A89060]">{vendor.suspensionReason}</p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="border-t border-gold/10 pt-4">
                            {!isSuspended ? (
                              <>
                                <button
                                  onClick={() => setShowSuspensionInput(showSuspensionInput === vendor._id ? null : vendor._id)}
                                  className="px-4 py-2 rounded-sm text-xs uppercase tracking-wide font-medium bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30 transition-all mb-3 w-full"
                                >
                                  <FiShield className="inline mr-2" size={16} />
                                  Suspend Vendor
                                </button>
                                {showSuspensionInput === vendor._id && (
                                  <div className="space-y-3 mb-3 p-4 bg-brown-warm/30 rounded-sm border border-yellow-400/20">
                                    <textarea
                                      value={suspensionReason}
                                      onChange={(e) => setSuspensionReason(e.target.value)}
                                      placeholder="Enter suspension reason..."
                                      className="w-full bg-brown-warm/50 border border-gold/20 rounded-sm px-4 py-2 text-cream placeholder-cream/30 focus:outline-none focus:border-gold text-sm resize-none"
                                      rows={2}
                                    ></textarea>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleSuspendVendor(vendor._id, suspensionReason)}
                                        disabled={actioningVendorId === vendor._id}
                                        className="flex-1 px-4 py-2 bg-red-400 text-brown-deep rounded-sm text-xs font-medium hover:bg-red-500 disabled:opacity-50 transition-all"
                                      >
                                        {actioningVendorId === vendor._id ? 'Suspending...' : 'Confirm Suspend'}
                                      </button>
                                      <button
                                        onClick={() => {
                                          setShowSuspensionInput(null)
                                          setSuspensionReason('')
                                        }}
                                        className="flex-1 px-4 py-2 bg-brown-warm/50 border border-gold/20 text-cream rounded-sm text-xs font-medium hover:border-gold transition-all"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <button
                                onClick={() => handleUnsuspendVendor(vendor._id)}
                                disabled={actioningVendorId === vendor._id}
                                className="px-4 py-2 rounded-sm text-xs uppercase tracking-wide font-medium bg-green-400/20 text-green-400 hover:bg-green-400/30 transition-all w-full disabled:opacity-50"
                              >
                                {actioningVendorId === vendor._id ? 'Unsuspending...' : 'Unsuspend Vendor'}
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteVendor(vendor._id)}
                              disabled={actioningVendorId === vendor._id}
                              className="mt-2 px-4 py-2 rounded-sm text-xs uppercase tracking-wide font-medium bg-red-400/20 text-red-400 hover:bg-red-400/30 transition-all w-full disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              <FiTrash2 size={16} />
                              Delete Vendor
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="card p-12 text-center">
                <p className="text-cream/50">No vendors found</p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  )
}
