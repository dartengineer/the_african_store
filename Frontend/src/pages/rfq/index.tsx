import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Layout from '@/components/layout/Layout'
import { useAuthStore } from '@/store/authStore'
import { FiPlus, FiEye, FiTrash2, FiMessageSquare } from 'react-icons/fi'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface RFQRequest {
  _id: string
  description: string
  budgetRange: { min: number; max: number }
  state: string
  status: 'OPEN' | 'CLOSED'
  buyerId: { name: string; state: string; _id: string }
  vendorId?: { storeName: string; state: string; _id: string }
  vendorOffers?: Array<any>
  createdAt: string
}

export default function RFQListPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [requests, setRequests] = useState<RFQRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [state, setState] = useState('')

  useEffect(() => {
    if (user) {
      fetchRequests()
    }
  }, [user, state])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const query = state ? `?state=${state}` : ''
      const { data } = await api.get(`/rfq${query}`)
      setRequests(data.requests)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  const deleteRequest = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!confirm('Delete this request?')) return
    try {
      await api.delete(`/rfq/${id}`)
      setRequests(requests.filter(r => r._id !== id))
      toast.success('Request deleted')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    }
  }

  const getStatusColor = (status: string) => {
    return status === 'OPEN'
      ? 'bg-green-500/20 text-green-300'
      : 'bg-blue-500/20 text-blue-300'
  }

  if (!user) {
    return (
      <>
        <Head><title>Fabric Requests — The African Store</title></Head>
        <Layout>
          <div className="max-w-5xl mx-auto px-6 py-12 text-center">
            <p className="text-cream/70 mb-4">Please log in to view fabric requests</p>
            <button
              onClick={() => router.push('/auth/login?redirect=/rfq')}
              className="btn-primary"
            >
              Sign In
            </button>
          </div>
        </Layout>
      </>
    )
  }

  return (
    <>
      <Head><title>Fabric Requests — The African Store</title></Head>
      <Layout>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="section-eyebrow">Fabric Marketplace</div>
              <h1 className="font-serif text-4xl font-light text-cream">
                Fabric <em className="text-gold italic">Requests</em>
              </h1>
            </div>
            {user.role === 'buyer' && (
              <button
                onClick={() => router.push('/rfq/new')}
                className="btn-primary flex items-center gap-2"
              >
                <FiPlus size={16} /> Create Request
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="mb-8 flex gap-4">
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="px-4 py-2 rounded bg-brown-deep/50 text-cream border border-gold/20 focus:border-gold outline-none"
            >
              <option value="">All States</option>
              <option value="Lagos">Lagos</option>
              <option value="Abuja">Abuja</option>
              <option value="Kano">Kano</option>
              <option value="Rivers">Rivers</option>
              <option value="Oyo">Oyo</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-12 text-cream/50">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-cream/50 mb-4">
                {user.role === 'buyer'
                  ? 'You have no fabric requests. Create one to get started!'
                  : 'No fabric requests available for you right now'}
              </p>
              {user.role === 'buyer' && (
                <button
                  onClick={() => router.push('/rfq/new')}
                  className="btn-primary"
                >
                  Create Your First Request
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div key={req._id} className="card p-5 hover:border-gold/40 transition-all cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div className="flex-1" onClick={() => router.push(`/rfq/${req._id}`)}>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-serif text-lg text-cream truncate max-w-md">
                          {req.description.substring(0, 60)}
                          {req.description.length > 60 ? '...' : ''}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${getStatusColor(req.status)}`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-sm text-[#A89060] mb-2">
                        Budget: ₦{req.budgetRange.min.toLocaleString()} - ₦{req.budgetRange.max.toLocaleString()}
                      </p>
                      <p className="text-xs text-cream/60">
                        {req.buyerId.name} • {req.state} • {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                      {req.status === 'CLOSED' && req.vendorId && (
                        <p className="text-xs text-gold mt-1">✓ Closed by: {req.vendorId.storeName}</p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => router.push(`/rfq/${req._id}`)}
                        className="text-gold hover:text-cream transition-colors p-2"
                        title="View"
                      >
                        <FiEye size={18} />
                      </button>
                      {user.role === 'buyer' && req.buyerId._id === user._id && user.role === 'buyer' && (
                        <button
                          onClick={(e) => deleteRequest(e, req._id)}
                          className="text-red-400 hover:text-red-300 transition-colors p-2"
                          title="Delete"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Offers count */}
                  {user.role === 'vendor' && req.status === 'OPEN' && (
                    <div className="flex items-center gap-2 text-xs text-[#A89060] mt-3">
                      <FiMessageSquare size={14} />
                      {req.vendorOffers?.length || 0} vendor offers
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Layout>
    </>
  )
}
