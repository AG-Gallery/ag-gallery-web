import type { CurrencyCode } from '@/queries/graphql/generated/types'
import type { Artwork } from '@/types/products'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { createSelectors } from '@/lib/create-store-selectors'

export type BagItem = {
  id: string
  slug: string
  title: string
  artist: string | null | undefined
  price: string
  currencyCode: CurrencyCode
  previewImageUrl: string
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

export const convertProductToBagItem = (artwork: Artwork): BagItem => ({
  id: artwork.gid,
  slug: artwork.slug,
  title: artwork.title,
  artist: artwork.artist.name,
  price: artwork.price,
  currencyCode: artwork.currencyCode,
  previewImageUrl: artwork.previewImageUrl,
  imageAlt: artwork.title,
  addedAt: Date.now(),
})
