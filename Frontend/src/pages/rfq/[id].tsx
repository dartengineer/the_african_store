import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import Layout from '@/components/layout/Layout'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { FiMapPin, FiStar } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'

interface OfferForm {
  price: number
  message: string
}

export default function RFQDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [showOfferForm, setShowOfferForm] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<OfferForm>()

  const { data: req, isLoading } = useQuery(
    ['rfq', id],
    () => api.get(`/rfq/${id}`).then((r) => r.data.request),
    { enabled: !!id }
  )

  const submitOffer = useMutation(
    (offer: OfferForm) => api.post(`/rfq/${id}/offer`, offer),
    {
      onSuccess: () => {
        toast.success('Offer submitted!')
        qc.invalidateQueries(['rfq', id])
        setShowOfferForm(false)
        reset()
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to submit offer'),
    }
  )

  const acceptOffer = useMutation(
    (offerId: string) => api.patch(`/rfq/${id}/offer/${offerId}/accept`),
    {
      onSuccess: () => {
        toast.success('Offer accepted!')
        qc.invalidateQueries(['rfq', id])
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to accept offer'),
    }
  )

  if (isLoading) return <Layout><div className="max-w-3xl mx-auto px-6 py-20 space-y-4">
    {[200, 120, 160].map((h, i) => <div key={i} className="card animate-pulse" style={{ height: h }} />)}
  </div></Layout>

  if (!req) return <Layout><div className="text-center py-40 text-cream/40">Request not found.</div></Layout>

  const isOwner = user?._id === req.buyerId._id
  const isVendor = user?.role === 'vendor'
  const hasOffered = req.vendorOffers?.some((o: any) => o.vendorId._id === user?._id)

  return (
    <>
      <Head><title>Fabric Request — The African Store</title></Head>
      <Layout>
        <div className="max-w-3xl mx-auto px-6 py-12">
          {/* Request card */}
          <div className="card p-8 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className={`badge ${req.status === 'open' ? 'badge-open' : 'badge-closed'}`}>
                ● {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
              </span>
              <span className="text-xs text-[#A89060]">{new Date(req.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-cream leading-relaxed mb-6">{req.description}</p>
            <div className="flex flex-wrap gap-6 text-xs text-[#A89060]">
              <span className="flex items-center gap-1">
                <FiMapPin size={11} /> {req.state}
              </span>
              <span>Budget: <span className="text-cream">₦{req.budgetRange.min.toLocaleString()} – ₦{req.budgetRange.max.toLocaleString()}</span></span>
              <span>Posted by: <span className="text-cream">{req.buyerId.name}</span></span>
            </div>
          </div>

          {/* Vendor offer form */}
          {isVendor && req.status === 'open' && !hasOffered && (
            <div className="mb-6">
              {!showOfferForm ? (
                <button onClick={() => setShowOfferForm(true)} className="btn-primary w-full">
                  Submit Your Offer
                </button>
              ) : (
                <div className="card p-6">
                  <h3 className="font-serif text-xl text-cream mb-5">Your Offer</h3>
                  <form onSubmit={handleSubmit((d) => submitOffer.mutate(d))} className="space-y-4">
                    <div>
                      <label className="label">Your Price (₦)</label>
                      <input type="number" className="input-field" placeholder="12500"
                        {...register('price', { required: 'Price required', min: { value: 1, message: 'Must be positive' } })} />
                      {errors.price && <p className="text-xs text-red-400 mt-1">{errors.price.message}</p>}
                    </div>
                    <div>
                      <label className="label">Message to Buyer</label>
                      <textarea rows={3} className="input-field resize-none"
                        placeholder="Describe your fabric, quality, delivery timeline..."
                        {...register('message', { required: 'Message required' })} />
                      {errors.message && <p className="text-xs text-red-400 mt-1">{errors.message.message}</p>}
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" disabled={submitOffer.isLoading} className="btn-primary flex-1">
                        {submitOffer.isLoading ? 'Submitting...' : 'Submit Offer'}
                      </button>
                      <button type="button" onClick={() => setShowOfferForm(false)} className="btn-secondary">Cancel</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {hasOffered && (
            <div className="badge badge-accepted mb-6 p-3 w-full justify-center">✓ You've already submitted an offer for this request</div>
          )}

          {/* Offers list */}
          <div>
            <h3 className="font-serif text-2xl text-cream mb-5">
              Vendor Offers <span className="text-gold">({req.vendorOffers?.length || 0})</span>
            </h3>
            {req.vendorOffers?.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gold/20 rounded-sm">
                <p className="text-[#A89060] text-sm">No offers yet — vendors will respond soon</p>
              </div>
            ) : (
              <div className="space-y-4">
                {req.vendorOffers?.map((offer: any) => (
                  <div
                    key={offer._id}
                    className={`card p-5 ${offer.status === 'accepted' ? 'border-green-royal bg-green-royal/10' : ''}`}
                  >
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div>
                        <p className="text-sm text-cream font-medium">{offer.vendorId.storeName}</p>
                        <div className="flex items-center gap-3 text-xs text-[#A89060] mt-0.5">
                          <span className="flex items-center gap-1">
                            <FiStar size={10} className="text-gold fill-gold" />
                            {offer.vendorId.rating?.toFixed(1) || 'New'}
                          </span>
                          <span>{offer.vendorId.state}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-serif text-xl text-gold">₦{Number(offer.price).toLocaleString()}</div>
                        {offer.status === 'accepted' && (
                          <span className="badge badge-accepted text-xs mt-1">✓ Accepted</span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-[#A89060] leading-relaxed mb-4">{offer.message}</p>

                    {isOwner && req.status === 'open' && offer.status !== 'accepted' && (
                      <button
                        onClick={() => acceptOffer.mutate(offer._id)}
                        disabled={acceptOffer.isLoading}
                        className="btn-primary !py-2 !px-5 text-xs"
                      >
                        Accept This Offer
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  )
}
