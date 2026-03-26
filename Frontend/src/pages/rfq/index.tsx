import Head from 'next/head'
import Link from 'next/link'
import { useQuery } from 'react-query'
import Layout from '@/components/layout/Layout'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { FiPlus, FiMapPin, FiDollarSign } from 'react-icons/fi'

export default function RFQPage() {
  const { user } = useAuthStore()
  const { data, isLoading } = useQuery('rfqs', () =>
    api.get('/rfq?status=open').then((r) => r.data.requests)
  )

  return (
    <>
      <Head><title>Fabric Requests — The African Store</title></Head>
      <Layout>
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex justify-between items-end mb-10">
            <div>
              <div className="section-eyebrow">Request for Quote</div>
              <h1 className="font-serif text-4xl font-light text-cream">
                Open Fabric <em className="text-gold italic">Requests</em>
              </h1>
            </div>
            {user && (
              <Link href="/rfq/new" className="btn-primary flex items-center gap-2">
                <FiPlus size={14} />
                Post Request
              </Link>
            )}
          </div>

          {!user && (
            <div className="bg-green-royal/30 border border-green-royal/50 rounded-sm p-4 mb-8 flex justify-between items-center">
              <p className="text-sm text-cream/70">Sign in to post fabric requests or submit offers as a vendor</p>
              <Link href="/auth/login" className="btn-secondary !py-2 !px-5 text-xs">Sign In</Link>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-4">
              {Array(5).fill(null).map((_, i) => (
                <div key={i} className="card h-28 animate-pulse" />
              ))}
            </div>
          ) : data?.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-serif text-2xl text-cream/40 mb-2">No open requests</p>
              <p className="text-sm text-[#A89060]">Be the first to post a fabric request</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data?.map((req: any) => (
                <Link key={req._id} href={`/rfq/${req._id}`}>
                  <div className="card p-6 hover:border-gold/30 transition-all cursor-pointer">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="badge badge-open">● Open</span>
                          <span className="text-[10px] tracking-widest uppercase text-[#A89060]">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-cream mb-2 line-clamp-2">{req.description}</p>
                        <div className="flex items-center gap-4 text-xs text-[#A89060]">
                          <span className="flex items-center gap-1">
                            <FiMapPin size={10} /> {req.state}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiDollarSign size={10} />
                            ₦{req.budgetRange.min.toLocaleString()} – ₦{req.budgetRange.max.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-serif text-2xl text-gold">{req.vendorOffers?.length || 0}</div>
                        <div className="text-[10px] tracking-wide text-[#A89060] uppercase">Offers</div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Layout>
    </>
  )
}
