import type { ArtworksFilterState, ArtworksSortOption } from '@/types/filters'

import { useMemo } from 'react'

import { useInfiniteQuery } from '@tanstack/react-query'

import {
  createFilterOptions,
  dedupeArtworks,
  filterArtworks,
  sortArtworks,
} from '@/features/artworks/utils'
import {
  createAllArtworksInfiniteQueryOptions,
  fetchFilterOptions,
} from '@/queries/artworks'

const PAGE_SIZE = 24

interface UseArtworksListingArgs {
  sortOption: ArtworksSortOption
  filters: ArtworksFilterState
}

export function useArtworksListing({
  sortOption,
  filters,
}: UseArtworksListingArgs) {
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

  const hasActiveFilters = Object.values(filters).some(
    (values) => values.length > 0,
  )

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
