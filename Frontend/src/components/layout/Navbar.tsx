import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { FiShoppingBag, FiUser, FiMenu, FiX } from 'react-icons/fi'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const count = useCartStore((s) => s.count())
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering user-specific content after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-brown-deep/98 to-transparent">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="gold">
          T<span className="text-cream font-light">he </span>
          A<span className="text-cream font-light">frican </span>
          S<span className="text-cream font-light">tore</span>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex gap-8 list-none">
          {[
            { label: 'Shop', href: '/shop' },
            { label: 'Request Fabric', href: '/rfq' },
            { label: 'Vendors', href: '/vendors' },
          ].map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`text-xs tracking-widest uppercase font-light transition-colors duration-300 ${
                  router.pathname.startsWith(item.href)
                    ? 'text-gold'
                    : 'text-cream/70 hover:text-gold'
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          {/* Cart */}
          <Link href="/cart" className="relative text-cream/70 hover:text-gold transition-colors">
            <FiShoppingBag size={18} />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-brown-deep text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                {count}
              </span>
            )}
          </Link>

          {/* User menu */}
          {mounted && user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 text-cream/70 hover:text-gold transition-colors"
              >
                <FiUser size={18} />
                <span className="hidden md:block text-xs tracking-wide">{user.name.split(' ')[0]}</span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-8 w-48 bg-brown-mid border border-gold/20 rounded-sm shadow-xl">
                  {user.role === 'vendor' && (
                    <Link
                      href="/vendor/dashboard"
                      className="block px-4 py-3 text-xs tracking-wide text-cream/80 hover:text-gold hover:bg-brown-warm transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Vendor Dashboard
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="block px-4 py-3 text-xs tracking-wide text-cream/80 hover:text-gold hover:bg-brown-warm transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    href="/orders"
                    className="block px-4 py-3 text-xs tracking-wide text-cream/80 hover:text-gold hover:bg-brown-warm transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/profile"
                    className="block px-4 py-3 text-xs tracking-wide text-cream/80 hover:text-gold hover:bg-brown-warm transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-xs tracking-wide text-red-400 hover:bg-brown-warm transition-colors border-t border-gold/10"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/auth/login" className="text-xs tracking-widest uppercase text-cream/70 hover:text-gold transition-colors">
                Sign In
              </Link>
              <Link href="/auth/register" className="btn-primary !py-2 !px-5">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-cream/70 hover:text-gold"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-brown-deep/98 border-t border-gold/10 px-6 py-6 flex flex-col gap-4">
          {[
            { label: 'Shop', href: '/shop' },
            { label: 'Request Fabric', href: '/rfq' },
            { label: 'Vendors', href: '/vendors' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm tracking-wide text-cream/70 hover:text-gold"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {!user && (
            <>
              <Link href="/auth/login" className="text-sm text-cream/70 hover:text-gold" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link href="/auth/register" className="btn-primary text-center !py-2" onClick={() => setMenuOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
