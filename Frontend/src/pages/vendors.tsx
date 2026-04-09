import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Layout from '@/components/layout/Layout'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { FiLoader, FiMapPin, FiStar, FiSearch } from 'react-icons/fi'

const NIGERIAN_STATES = [
  'All States',
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara'
]

interface VendorProfile {
  _id: string
  storeName: string
  storeDescription?: string
  state: string
  phone: string
  rating: number
  totalReviews: number
  userId: {
    name: string
  }
}

export default function VendorsPage() {
  const router = useRouter()
  const [vendors, setVendors] = useState<VendorProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedState, setSelectedState] = useState('All States')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchVendors()
  }, [])

  const fetchVendors = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/vendor/all', {
        params: {
          state: selectedState === 'All States' ? undefined : selectedState,
          limit: 100,
        }
      })
      setVendors(data.vendors)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load vendors')
      setVendors([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVendors()
  }, [selectedState])

  // Filter by search query
  const filteredVendors = vendors.filter((v) =>
    v.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.storeDescription?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <Head>
        <title>Browse Vendors — The African Store</title>
      </Head>
      <Layout>
        <div className="px-6 py-12 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="section-eyebrow">Marketplace</div>
            <h1 className="font-serif text-4xl md:text-5xl font-light text-cream">
              Browse <em className="text-gold italic">Vendors</em>
            </h1>
            <p className="text-sm text-[#A89060] mt-4 max-w-2xl">
              Discover approved fabric vendors across Nigeria. Each store is verified and ready to serve you with quality products.
            </p>
          </div>

          {/* Filters */}
          <div className="grid md:grid-cols-2 gap-4 mb-10">
            {/* State filter */}
            <div>
              <label className="label">Filter by State</label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="input-field"
              >
                {NIGERIAN_STATES.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="label">Search Vendors</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A89060]" size={16} />
                <input
                  type="text"
                  placeholder="Store name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mb-6 text-xs text-[#A89060]">
            {loading ? (
              'Loading vendors...'
            ) : (
              <>
                Showing <span className="text-gold font-medium">{filteredVendors.length}</span> of{' '}
                <span className="text-gold font-medium">{vendors.length}</span> vendor
                {vendors.length !== 1 ? 's' : ''}
              </>
            )}
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center py-20">
              <FiLoader className="animate-spin text-gold" size={32} />
            </div>
          )}

          {/* Vendors grid */}
          {!loading && (
            <>
              {filteredVendors.length === 0 ? (
                <div className="card p-12 text-center">
                  <div className="text-4xl mb-3">🏪</div>
                  <p className="text-cream/60 mb-2">No vendors found</p>
                  <p className="text-xs text-[#A89060]">
                    Try adjusting your filters or search term
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVendors.map((vendor) => (
                    <Link key={vendor._id} href={`/shop?vendor=${vendor._id}`}>
                      <div className="card p-6 hover:border-gold/50 cursor-pointer transition-all h-full group">
                        {/* Store name */}
                        <h3 className="font-serif text-lg text-cream mb-2 group-hover:text-gold transition-colors">
                          {vendor.storeName}
                        </h3>

                        {/* Vendor owner */}
                        <p className="text-xs text-[#A89060] mb-3">
                          by {vendor.userId.name}
                        </p>

                        {/* Description */}
                        <p className="text-xs text-cream/70 leading-relaxed mb-4 line-clamp-3">
                          {vendor.storeDescription || 'Quality fabric vendor'}
                        </p>

                        {/* Location */}
                        <div className="flex items-center gap-2 text-xs text-[#A89060] mb-4">
                          <FiMapPin size={12} />
                          <span>{vendor.state}</span>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-2 text-xs">
                          {vendor.rating > 0 ? (
                            <>
                              <div className="flex items-center gap-1">
                                {Array(5).fill(0).map((_, i) => (
                                  <FiStar
                                    key={i}
                                    size={12}
                                    className={
                                      i < Math.floor(vendor.rating)
                                        ? 'fill-gold text-gold'
                                        : 'text-gold/20'
                                    }
                                  />
                                ))}
                              </div>
                              <span className="text-cream font-medium">
                                {vendor.rating.toFixed(1)}
                              </span>
                              <span className="text-[#A89060]">
                                ({vendor.totalReviews} review{vendor.totalReviews !== 1 ? 's' : ''})
                              </span>
                            </>
                          ) : (
                            <span className="text-[#A89060]">No reviews yet</span>
                          )}
                        </div>

                        {/* CTA */}
                        <div className="mt-4 pt-4 border-t border-gold/10">
                          <span className="text-xs text-gold font-medium group-hover:translate-x-1 inline-block transition-transform">
                            View products →
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Info section */}
          <div className="mt-16 grid md:grid-cols-2 gap-8">
            <div className="card p-6 bg-green-royal/10 border-green-royal/30">
              <h4 className="text-sm font-medium text-green-400 mb-2 flex items-center gap-2">
                <span>✅</span> Verified Vendors
              </h4>
              <p className="text-xs text-cream/60 leading-relaxed">
                All vendors on this page have been verified and approved by our admin team. They've provided legitimate business information and banking details.
              </p>
            </div>
            <div className="card p-6 bg-gold/10 border-gold/30">
              <h4 className="text-sm font-medium text-gold mb-2 flex items-center gap-2">
                <span>🏪</span> Start Selling
              </h4>
              <p className="text-xs text-cream/60 leading-relaxed">
                Are you a fabric vendor? Join thousands of sellers on The African Store.{' '}
                <Link href="/auth/register?role=vendor" className="text-gold hover:text-gold-light">
                  Register now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}
