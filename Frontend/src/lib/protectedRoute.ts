import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import Layout from '@/components/layout/Layout'

type UserRole = 'buyer' | 'vendor' | 'admin'

interface ProtectedRouteProps {
  allowedRoles: UserRole[]
  redirectTo?: string
}

export function withProtectedRoute<P>(
  Component: React.ComponentType<P>,
  { allowedRoles, redirectTo = '/' }: ProtectedRouteProps
) {
  const ProtectedComponent = (props: P): JSX.Element | null => {
    const router = useRouter()
    const { user, isInitialized } = useAuthStore()

    useEffect(() => {
      if (!isInitialized) return

      if (!user) {
        router.replace(`/auth/login?redirect=${router.pathname}`)
        return
      }

      if (!allowedRoles.includes(user.role)) {
        router.replace(redirectTo)
        return
      }
    }, [user, isInitialized, router, allowedRoles, redirectTo])

    // 🔹 1. Still initializing
    if (!isInitialized) {
      return (
        <Layout>
          <div className="min-h-screen flex items-center justify-center">
            <p className="text-cream/50">Loading...</p>
          </div>
        </Layout>
      )
    }

    // 🔹 2. Not authorized (redirect happening)
    if (!user || !allowedRoles.includes(user.role)) {
      return null
    }

    // 🔹 3. Authorized
    return <Component {...props} />
  }

  return ProtectedComponent
}