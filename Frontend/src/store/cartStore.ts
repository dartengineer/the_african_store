import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productId: string
  name: string
  price: number
  bulkPrice?: number
  quantity: number
  image: string
  vendorId: string
  vendorName: string
}

interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  clearCart: () => void
  total: () => number // Calculates with bulk pricing applied
  subtotalWithBulk: () => number
  count: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const existing = get().items.find((i) => i.productId === item.productId)
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          })
        } else {
          set({ items: [...get().items, item] })
        }
      },

      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.productId !== productId) }),

      updateQty: (productId, qty) => {
        if (qty < 1) return get().removeItem(productId)
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity: qty } : i
          ),
        })
      },

      clearCart: () => set({ items: [] }),

      subtotalWithBulk: () => {
        return get().items.reduce((sum, i) => {
          // Bulk discount: if quantity > 6 yards, use bulkPrice
          const itemPrice = i.quantity > 6 && i.bulkPrice ? i.bulkPrice : i.price
          return sum + itemPrice * i.quantity
        }, 0)
      },

      total: () => {
        return get().items.reduce((sum, i) => {
          // Bulk discount: if quantity > 6 yards, use bulkPrice
          const itemPrice = i.quantity > 6 && i.bulkPrice ? i.bulkPrice : i.price
          return sum + itemPrice * i.quantity
        }, 0)
      },

      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'tas-cart' }
  )
)
