import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import Layout from '@/components/layout/Layout'

type UserRole = 'buyer' | 'vendor' | 'admin'

interface ProtectedRouteProps {
  requireRole: UserRole | UserRole[]
  redirectTo?: string
}

/**
 * Higher-order component to protect routes based on user role
 * Usage: export default withProtectedRoute(ComponentName, { requireRole: 'buyer' })
 */
export function withProtectedRoute(
  Component: React.ComponentType<any>,
  { requireRole, redirectTo = '/' }: ProtectedRouteProps
) {
  return function ProtectedComponent(props: any) {
    const router = useRouter()
    const { user, isInitialized } = useAuthStore()

    const allowedRoles = Array.isArray(requireRole) ? requireRole : [requireRole]

    useEffect(() => {
      if (!isInitialized) return

      if (!user) {
        router.push(`/auth/login?redirect=${router.pathname}`)
        return
      }

      if (!allowedRoles.includes(user.role)) {
        router.push(redirectTo)
        return
      }
    }, [user, isInitialized, router, allowedRoles])

    if (!isInitialized || !user || !allowedRoles.includes(user.role)) {
      return (
        <Layout>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <p className="text-cream/50">Loading...</p>
            </div>
          </div>
        </Layout>
      )
    }

    return <Component {...props} />
  }
}

/**
 * Hook to check if user has access to specific roles
 * Usage: const canAccess = useRoleAccess(['buyer', 'vendor'])
 */
export function useRoleAccess(allowedRoles: UserRole[]): boolean {
  const { user } = useAuthStore()
  return user ? allowedRoles.includes(user.role) : false
}

/**
 * Hook to redirect user to their role-specific home page
 * Usage: useRoleBasedRedirect() - automatically redirects on mount
 */
export function useRoleBasedRedirect() {
  const router = useRouter()
  const { user, isInitialized } = useAuthStore()

  useEffect(() => {
    if (!isInitialized) return

    // Only redirect on home page
    if (router.pathname !== '/') return

    if (user) {
      switch (user.role) {
        case 'buyer':
          router.push('/buyer/home')
          break
        case 'vendor':
          router.push('/vendor/dashboard')
          break
        case 'admin':
          router.push('/admin')
          break
      }
    }
  }, [user, isInitialized, router])
}
