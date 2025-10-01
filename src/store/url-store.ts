import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { createSelectors } from '@/lib/create-store-selectors'

type UrlStoreState = {
  query: {
    [key: string]: string[]
  }
}

type UrlStoreActions = {
  // Set a single key to one or more values (overwrites existing)
  setQuery: (k: string, v: string | string[] | undefined) => void
  setQueries: (
    entries: Record<string, string | string[] | undefined>,
  ) => void
  // Toggle a single value in the array of a key
  toggleQueryValue: (k: string, v: string) => void
  clearAllQueries: () => void
  // Sync Zustand query with the actual URLSearchParams
  syncQueryFromUrl: (params: URLSearchParams) => void
}

const useUrlStoreBase = create<UrlStoreState & UrlStoreActions>()(
  persist(
    (set) => ({
      query: {},

      setQuery: (k, v) =>
        set((state) => {
          const newQuery = { ...state.query }

          if (typeof v === 'undefined') {
            delete newQuery[k]
          } else if (Array.isArray(v)) {
            newQuery[k] = v
          } else {
            newQuery[k] = [v]
          }

          return { query: newQuery }
        }),

      setQueries: (entries) =>
        set((state) => {
          const newQuery = { ...state.query }

          Object.entries(entries).forEach(([key, value]) => {
            if (typeof value === 'undefined') {
              delete newQuery[key]
            } else if (Array.isArray(value)) {
              newQuery[key] = value
            } else {
              newQuery[key] = [value]
            }
          })

          return { query: newQuery }
        }),

      toggleQueryValue: (k, v) =>
        set((state) => {
          const current = new Set(state.query[k] ?? [])
          if (current.has(v)) {
            current.delete(v)
          } else {
            current.add(v)
          }
          return {
            query: {
              ...state.query,
              [k]: Array.from(current),
            },
          }
        }),

      clearAllQueries: () => set({ query: {} }),

      syncQueryFromUrl: (params) => {
        const query: Record<string, string[]> = {}
        params.forEach((value, key) => {
          if (!query[key]) query[key] = []
          query[key].push(value)
        })
        set({ query })
      },
    }),
    {
      name: 'url-storage',
      storage:
        typeof window !== 'undefined'
          ? createJSONStorage(() => sessionStorage)
          : undefined,
    },
  ),
)

export const useUrlStore = createSelectors(useUrlStoreBase)
