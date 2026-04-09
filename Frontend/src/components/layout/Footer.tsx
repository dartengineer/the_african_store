import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-gold/15 bg-brown-deep">
      <div className="max-w-7xl mx-auto px-8 pt-16 pb-8">
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-12">
          <div className="max-w-xs">
            <div className="font-serif text-xl tracking-widest uppercase text-gold mb-3">
              T<span className="text-cream font-light">he </span>
              A<span className="text-cream font-light">frican </span>
              S<span className="text-cream font-light">tore</span>
            </div>
            <p className="text-xs text-[#A89060] leading-relaxed font-light">
              Modernizing African fabric trade — one transaction at a time.
            </p>
          </div>

          <div className="flex flex-wrap gap-12">
            {[
              {
                title: 'Shop',
                links: [
                  { label: 'Browse Fabrics', href: '/shop' },
                  { label: 'Ankara', href: '/shop?category=ankara' },
                  { label: 'Lace', href: '/shop?category=lace' },
                  { label: 'Senator', href: '/shop?category=senator' },
                  { label: 'New Arrivals', href: '/shop?sort=newest' },
                ],
              },
              {
                title: 'Marketplace',
                links: [
                  { label: 'Request Fabric', href: '/rfq' },
                  { label: 'Browse Vendors', href: '/vendors' },
                  { label: 'Become a Vendor', href: '/auth/register?role=vendor' },
                ],
              },
              {
                title: 'Company',
                links: [
                  { label: 'About Us', href: '/about' },
                  { label: 'Company Info', href: '/company' },
                  { label: 'Contact Us', href: '/contact' },
                ],
              },
              {
                title: 'Support',
                links: [
                  { label: 'My Orders', href: '/orders' },
                  { label: 'My Profile', href: '/profile' },
                  { label: 'Help Center', href: '/help' },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-xs tracking-widest uppercase text-gold mb-5">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-xs text-[#A89060] hover:text-cream transition-colors font-light">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-8 border-t border-gold/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#A89060]">© {new Date().getFullYear()} The African Store. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs text-[#A89060]">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
            Secured by Paystack · Escrow Protected
          </div>
        </div>
      </div>
    </footer>
  )
}
