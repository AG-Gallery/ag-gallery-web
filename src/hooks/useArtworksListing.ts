import { useEffect, useMemo, useRef } from 'react'

import { useInfiniteQuery } from '@tanstack/react-query'

import type {
  ArtworksFilterState,
  ArtworksSortOption,
} from '@/types/filters'

import {
  createAllArtworksInfiniteQueryOptions,
  fetchFilterOptions,
} from '@/queries/artworks'
import {
  createFilterOptions,
  dedupeArtworks,
  filterArtworks,
  sortArtworks,
} from '@/features/artworks/utils'

const PAGE_SIZE = 24

interface UseArtworksListingArgs {
  sortOption: ArtworksSortOption
  filters: ArtworksFilterState
}

export function useArtworksListing({ sortOption, filters }: UseArtworksListingArgs) {
  const requestTokenRef = useRef(0)

  const infiniteQueryOptions = useMemo(
    () =>
      createAllArtworksInfiniteQueryOptions({
        pageSize: PAGE_SIZE,
        filters,
      }),
    [filters],
  )

  const {
    data: artworks,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    ...infiniteQueryOptions,
    select: (data) => data.pages.flatMap((page) => page.items),
  })

  const loadedArtworks = artworks ?? []
  const dedupedArtworks = useMemo(
    () => dedupeArtworks(loadedArtworks),
    [loadedArtworks],
  )

  const fallbackOptions = useMemo(
    () => createFilterOptions(dedupedArtworks),
    [dedupedArtworks],
  )

  const filteredArtworks = useMemo(
    () => filterArtworks(dedupedArtworks, filters),
    [dedupedArtworks, filters],
  )

  const sortedArtworks = useMemo(
    () => sortArtworks(filteredArtworks, sortOption),
    [filteredArtworks, sortOption],
  )

  const hasActiveFilters = Object.values(filters).some((values) => values.length > 0)

  useEffect(() => {
    if (status !== 'success') return
    if (!hasActiveFilters) return
    if (sortedArtworks.length > 0) return
    if (!hasNextPage || isFetchingNextPage) return

    const requestToken = requestTokenRef.current + 1
    requestTokenRef.current = requestToken

    void fetchNextPage().catch((error) => {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Failed to auto-fetch additional artworks', error)
      }
    })

    return () => {
      requestTokenRef.current = requestToken
    }
  }, [
    status,
    hasActiveFilters,
    sortedArtworks.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ])

  const showLoadMoreButton =
    hasNextPage && (!hasActiveFilters || filteredArtworks.length >= PAGE_SIZE)

  return {
    fallbackOptions,
    sortedArtworks,
    status,
    showLoadMoreButton,
    fetchNextPage,
    isFetchingNextPage,
  }
}

export async function loadFilterOptions() {
  return fetchFilterOptions()
}
