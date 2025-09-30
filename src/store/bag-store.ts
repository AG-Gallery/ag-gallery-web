import type { CurrencyCode } from '@/queries/graphql/generated/types'
import type { Product } from '@/types/products'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { createSelectors } from '@/lib/create-store-selectors'

export type BagItem = {
  id: string
  handle: string
  title: string
  artist: string | null | undefined
  price: string
  currencyCode: CurrencyCode
  imageUrl: string
  imageAlt: string | null
  addedAt: number
}

type BagStore = {
  items: BagItem[]

  // Actions
  addItem: (item: BagItem) => boolean
  removeItem: (id: string) => void
  clearBag: () => void
  isItemInBag: (id: string) => boolean

  // Computed values
  getTotalPrice: () => number // in cents to avoid float issues
  getTotalPriceFormatted: () => string
  getItemCount: () => number
}

const useBagStoreBase = create<BagStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item: BagItem) => {
        const { items } = get()

        if (items.some((existingItem) => existingItem.id === item.id)) {
          return false
        }

        set({
          items: [...items, { ...item, addedAt: Date.now() }],
        })
        return true
      },

      removeItem: (id: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },

      clearBag: () => {
        set({ items: [] })
      },

      isItemInBag: (id: string) => {
        return get().items.some((item) => item.id === id)
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const priceInCents = Math.round(parseFloat(item.price) * 100)
          return total + priceInCents
        }, 0)
      },

      getTotalPriceFormatted: () => {
        const { items } = get()
        if (items.length === 0) return '$0.00'

        const totalCents = get().getTotalPrice()
        const currencyCode = items[0].currencyCode

        const totalDollars = totalCents / 100
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currencyCode,
        }).format(totalDollars)
      },

      getItemCount: () => {
        return get().items.length
      },
    }),
    {
      name: 'bag-storage',
      version: 1,
      skipHydration: true,
    },
  ),
)

export const useBagStore = createSelectors(useBagStoreBase)

export const convertProductToBagItem = (product: Product): BagItem => ({
  id: product.id,
  handle: product.handle,
  title: product.title,
  artist: product.artist,
  price: product.price,
  currencyCode: product.currencyCode,
  imageUrl: product.images[0]?.url || '',
  imageAlt: product.images[0]?.altText || null,
  addedAt: Date.now(),
})
