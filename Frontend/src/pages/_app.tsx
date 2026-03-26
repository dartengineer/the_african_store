import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuthStore } from '@/store/authStore'
import '@/styles/globals.css'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
})

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const fetchMe = useAuthStore((s) => s.fetchMe)

  useEffect(() => {
    // Skip fetchMe on auth pages to prevent redirect loop
    if (!router.pathname.startsWith('/auth/')) {
      fetchMe()
    }
  }, [router.pathname, fetchMe])

  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#3D2712',
            color: '#F5EDD8',
            border: '1px solid rgba(201,168,76,0.3)',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#C9A84C', secondary: '#2A1A0E' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#2A1A0E' } },
        }}
      />
    </QueryClientProvider>
  )
}
