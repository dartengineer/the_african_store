import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useQuery } from 'react-query'
import Layout from '@/components/layout/Layout'
import ProductCard from '@/components/shop/ProductCard'
import api from '@/lib/api'
import { FiFilter, FiSearch } from 'react-icons/fi'

const CATEGORIES = ['All', 'ankara', 'lace', 'senator', 'aso-oke', 'kente', 'adire']
const STATES = ['All States', 'Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt', 'Enugu', 'Kaduna']

export default function ShopPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState((router.query.category as string) || 'All')
  const [state, setState] = useState('All States')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const params = new URLSearchParams({
    ...(search && { search }),
    ...(category !== 'All' && { category }),
    ...(state !== 'All States' && { state }),
    sort,
    page: String(page),
    limit: '12',
  })

  const { data, isLoading } = useQuery(
    ['products', search, category, state, sort, page],
    () => api.get(`/products?${params}`).then((r) => r.data),
    { keepPreviousData: true }
  )

  return (
    <>
      <Head>
        <title>Shop Fabrics — The African Store</title>
      </Head>
      <Layout>
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-10">
            <div className="section-eyebrow">Marketplace</div>
            <h1 className="font-serif text-4xl font-light text-cream">
              Browse <em className="text-gold italic">Fabrics</em>
            </h1>
          </div>

          {/* Search + filter bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A89060]" size={16} />
              <input
                type="text"
                placeholder="Search fabrics, vendors..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="input-field pl-10"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="input-field md:w-48"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center gap-2 md:w-auto"
            >
              <FiFilter size={14} />
              Filters
            </button>
          </div>

          {/* Filters panel */}
          {showFilters && (
            <div className="bg-brown-mid border border-gold/15 rounded-sm p-6 mb-8 grid md:grid-cols-2 gap-6">
              <div>
                <label className="label">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setCategory(cat); setPage(1) }}
                      className={`px-4 py-1.5 text-xs tracking-wide rounded-sm border transition-all ${
                        category === cat
                          ? 'bg-gold text-brown-deep border-gold'
                          : 'border-gold/20 text-cream/60 hover:border-gold hover:text-gold'
                      }`}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">State</label>
                <div className="flex flex-wrap gap-2">
                  {STATES.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setState(s); setPage(1) }}
                      className={`px-4 py-1.5 text-xs tracking-wide rounded-sm border transition-all ${
                        state === s
                          ? 'bg-gold text-brown-deep border-gold'
                          : 'border-gold/20 text-cream/60 hover:border-gold hover:text-gold'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array(8).fill(null).map((_, i) => (
                <div key={i} className="card aspect-[3/4] animate-pulse bg-brown-mid" />
              ))}
            </div>
          ) : data?.products?.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-serif text-2xl text-cream/40 mb-4">No fabrics found</p>
              <p className="text-sm text-[#A89060]">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data?.products?.map((p: any) => <ProductCard key={p._id} product={p} />)}
              </div>
              {/* Pagination */}
              {data?.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                  {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 text-xs rounded-sm border transition-all ${
                        page === p
                          ? 'bg-gold text-brown-deep border-gold'
                          : 'border-gold/20 text-cream/60 hover:border-gold'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </Layout>
    </>
  )
}
