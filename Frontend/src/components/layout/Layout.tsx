import Navbar from './Navbar'
import Footer from './Footer'

interface LayoutProps {
  children: React.ReactNode
  hideFooter?: boolean
}

export default function Layout({ children, hideFooter = false }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-brown-deep">
      <Navbar />
      <main className="flex-1 pt-20">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  )
}
