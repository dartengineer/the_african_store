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
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  fetchMe: () => Promise<void>
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
    (set) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/login', { email, password })
          Cookies.set('tas_token', data.token, { expires: 1/48 })
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
          Cookies.set('tas_token', data.token, { expires: 1/48 })
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
          const { data } = await api.get('/auth/me')
          set({ user: data.user })
        } catch {
          Cookies.remove('tas_token')
          set({ user: null, token: null })
        }
      },
    }),
    { name: 'tas-auth', partialize: (s) => ({ token: s.token }) }
  )
)
