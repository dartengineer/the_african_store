import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Cookies from 'js-cookie'
import api from '@/lib/api'

export interface User {
  _id: string
  name: string
  email: string
  role: 'buyer' | 'vendor' | 'admin'
  state: string
  phone: string
  verified: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isInitialized: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  fetchMe: () => Promise<void>
  initializeAuth: () => Promise<void>
}

interface RegisterData {
  name: string
  email: string
  password: string
  role: 'buyer' | 'vendor'
  state: string
  phone: string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isInitialized: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/login', { email, password })
          // Backend now sets HTTP-only cookie, but also store in memory for client-side access
          // Only set cookie if not already set by backend
          if (data.token && !Cookies.get('tas_token')) {
            const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
            Cookies.set('tas_token', data.token, {
              expires: 0.5,  // 12 hours
              sameSite: isProduction ? 'Lax' : 'Lax',
              secure: isProduction,
            })
          }
          set({ user: data.user, token: data.token, isLoading: false })
        } catch (err) {
          set({ isLoading: false })
          throw err
        }
      },

      register: async (formData) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/register', formData)
          // Backend now sets HTTP-only cookie, but also store in memory for client-side access
          // Only set cookie if not already set by backend
          if (data.token && !Cookies.get('tas_token')) {
            const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
            Cookies.set('tas_token', data.token, {
              expires: 0.5,  // 12 hours
              sameSite: isProduction ? 'Lax' : 'Lax',
              secure: isProduction,
            })
          }
          set({ user: data.user, token: data.token, isLoading: false })
        } catch (err) {
          set({ isLoading: false })
          throw err
        }
      },

      logout: () => {
        Cookies.remove('tas_token')
        set({ user: null, token: null })
      },

      fetchMe: async () => {
        try {
          const token = Cookies.get('tas_token')
          if (!token) {
            set({ user: null, token: null, isInitialized: true })
            return
          }
          const { data } = await api.get('/auth/me')
          set({ user: data.user, token, isInitialized: true })
        } catch (err) {
          Cookies.remove('tas_token')
          set({ user: null, token: null, isInitialized: true })
        }
      },

      initializeAuth: async () => {
        const token = Cookies.get('tas_token')
        if (token) {
          await get().fetchMe()
        } else {
          set({ isInitialized: true })
        }
      },
    }),
    { name: 'tas-auth', partialize: (s) => ({ token: s.token }) }
  )
)
