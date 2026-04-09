import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import Layout from '@/components/layout/Layout'

type UserRole = 'buyer' | 'vendor' | 'admin'

interface ProtectedRouteProps {
  allowedRoles: UserRole[]
  redirectTo?: string
}

/**
 * Higher-order component to protect routes based on user role
 */
export function withProtectedRoute(
  Component: React.ComponentType<any>,
  { allowedRoles, redirectTo = '/' }: ProtectedRouteProps
) {
  return function ProtectedComponent(props: any): JSX.Element | null {
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

    // 🔹 Show loading ONLY while initializing
    if (!isInitialized) {
      return (
        <Layout>
          <div className="min-h-screen flex items-center justify-center">
            <p className="text-cream/50">Loading...</p>
          </div>
        </Layout>
      )
    }

    // 🔹 While redirecting, render nothing
    if (!user || !allowedRoles.includes(user.role)) {
      return null
    }

    // 🔹 Authorized
    return <Component {...props} />
  }
}

/**
 * Hook to check if user has access to specific roles
 */
export function useRoleAccess(allowedRoles: UserRole[]): boolean {
  const { user } = useAuthStore()
  return user ? allowedRoles.includes(user.role) : false
}

/**
 * Hook to redirect user to their role-specific home page
 */
export function useRoleBasedRedirect(): void {
  const router = useRouter()
  const { user, isInitialized } = useAuthStore()

  useEffect(() => {
    if (!isInitialized) return

    if (router.pathname !== '/') return

    if (user) {
      switch (user.role) {
        case 'buyer':
          router.replace('/buyer/home')
          break
        case 'vendor':
          router.replace('/vendor/dashboard')
          break
        case 'admin':
          router.replace('/admin')
          break
      }
    }
  }, [user, isInitialized, router])
}