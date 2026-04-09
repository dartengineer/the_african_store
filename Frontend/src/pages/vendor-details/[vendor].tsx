import Head from 'next/head'
import { useRouter } from 'next/router'
import { useQuery } from 'react-query'
import Layout from '@/components/layout/Layout'
import ProductCard from '@/components/shop/ProductCard'
import api from '@/lib/api'
import { FiStar, FiMapPin, FiShoppingBag } from 'react-icons/fi'

export default function VendorDetailsPage() {
  const router = useRouter()
  const { vendor: vendorId } = router.query

  const { data: vendor, isLoading: vendorLoading } = useQuery(
    ['vendor', vendorId],
    () => api.get(`/vendor/${vendorId}`).then((r) => r.data.vendorProfile),
    { enabled: !!vendorId }
  )

  const { data: products, isLoading: productsLoading } = useQuery(
    ['vendor-products', vendorId],
    () => api.get(`/products?vendorId=${vendorId}`).then((r) => r.data.products),
    { enabled: !!vendorId }
  )

  if (vendorLoading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="space-y-4">
            {[300, 150, 200].map((h, i) => (
              <div key={i} className="card animate-pulse" style={{ height: h }} />
            ))}
          </div>
        </div>
      </Layout>
    )
  }

  if (!vendor) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-6 py-12 text-center">
          <p className="text-cream/50">Vendor not found</p>
        </div>
      </Layout>
    )
  }

  return (
    <>
      <Head>
        <title>{vendor.storeName} — The African Store</title>
        <meta name="description" content={`Shop from ${vendor.storeName} on The African Store`} />
      </Head>
      <Layout>
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Vendor Header */}
          <div className="card p-8 mb-12">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-6">
              <div className="flex-1">
                <h1 className="font-serif text-4xl text-cream mb-2">{vendor.storeName}</h1>
                <p className="text-[#A89060] mb-4">{vendor.storeDescription || 'Premium fabric vendor'}</p>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <FiStar className="text-gold fill-gold" size={18} />
                    <span className="text-cream">{(vendor.rating || 0).toFixed(1)}</span>
                    <span className="text-xs text-[#A89060]">({vendor.totalReviews || 0} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#A89060]">
                    <FiMapPin size={18} />
                    <span>{vendor.state}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-block px-4 py-2 rounded bg-gold/20 text-gold text-sm font-medium">
                  {vendor.isApproved ? '✓ Verified Vendor' : '⏳ Pending Verification'}
                </div>
              </div>
            </div>

            {/* Vendor Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gold/10">
              {[
                { label: 'Active Products', value: products?.length || 0 },
                { label: 'Rating', value: (vendor.rating || 0).toFixed(1) },
                { label: 'State', value: vendor.state },
                { label: 'Status', value: vendor.isApproved ? 'Approved' : 'Pending' },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-xs text-[#A89060] mb-1">{stat.label}</p>
                  <p className="font-serif text-lg text-cream">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Products Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <FiShoppingBag size={24} className="text-gold" />
              <div>
                <div className="section-eyebrow">Store Collections</div>
                <h2 className="font-serif text-3xl text-cream">
                  Products from <em className="text-gold italic">{vendor.storeName}</em>
                </h2>
              </div>
            </div>

            {productsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="card h-96 animate-pulse" />
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {products.map((product: any) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 card">
                <p className="text-cream/50 mb-4">No products available from this vendor</p>
              </div>
            )}
          </section>
        </div>
      </Layout>
    </>
  )
}
