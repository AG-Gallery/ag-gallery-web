import type { SearchResult } from '@/queries/search'
import type { SearchProductsQuery } from '@/queries/graphql/generated/react-query'

import { useEffect, useState } from 'react'

import { useQuery } from '@tanstack/react-query'

import { SHOPIFY_AVAILABLE_IN_STOCK_QUERY } from '@/queries/constants'
import { performSearch, useSearchProductsQuery } from '@/queries/search'

export type UseSearchLogicReturn = {
  searchTerm: string
  setSearchTerm: (term: string) => void
  debouncedSearch: string
  sanityResults: Omit<SearchResult, 'products'> | undefined
  shopifyResults: SearchProductsQuery | undefined
  isLoading: boolean
  hasResults: boolean
}

export function useSearchLogic(): UseSearchLogicReturn {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const normalizedSearch = debouncedSearch.trim()
  const shopifyProductQuery =
    normalizedSearch.length > 0
      ? `(title:*${normalizedSearch}*) AND ${SHOPIFY_AVAILABLE_IN_STOCK_QUERY}`
      : SHOPIFY_AVAILABLE_IN_STOCK_QUERY

  // Debounce search input with 300ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Sanity search (artists, exhibitions, fairs)
  const { data: sanityResults, isLoading: sanityLoading } = useQuery({
    queryKey: ['search-sanity', debouncedSearch],
    queryFn: () => performSearch(debouncedSearch),
    enabled: normalizedSearch.length > 0,
  })

  // Shopify search (products)
  const { data: shopifyResults, isLoading: shopifyLoading } =
    useSearchProductsQuery(
      {
        query: shopifyProductQuery,
        first: 5,
      },
      {
        enabled: normalizedSearch.length > 0,
      },
    )

  const isLoading = sanityLoading || shopifyLoading
  const hasResults =
    (sanityResults?.artists.length ?? 0) > 0 ||
    (sanityResults?.exhibitions.length ?? 0) > 0 ||
    (sanityResults?.fairs.length ?? 0) > 0 ||
    (shopifyResults?.products.edges.length ?? 0) > 0

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearch,
    sanityResults,
    shopifyResults,
    isLoading,
    hasResults,
  }
}
