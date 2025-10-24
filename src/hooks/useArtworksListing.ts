import type {
  ArtworksFilterOptions,
  ArtworksFilterState,
  ArtworksSortOption,
} from '@/types/filters'

import { useMemo } from 'react'

import { useInfiniteQuery } from '@tanstack/react-query'

import { dedupeArtworks } from '@/lib/artworks/utils'
import {
  createAllArtworksInfiniteQueryOptions,
  fetchFilterOptions,
} from '@/queries/artworks'

export const ITEMS_PER_PAGE = 32

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
        pageSize: ITEMS_PER_PAGE,
        filters,
        sortOption,
      }),
    [filters, sortOption],
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

  const fallbackOptions = useMemo<ArtworksFilterOptions>(
    () => ({ styles: [], categories: [], themes: [], artists: [] }),
    [],
  )

  const hasActiveFilters = Object.values(filters).some(
    (values) => values.length > 0,
  )

  const showLoadMoreButton =
    hasNextPage &&
    (!hasActiveFilters || dedupedArtworks.length >= ITEMS_PER_PAGE)

  return {
    fallbackOptions,
    artworks: dedupedArtworks,
    status,
    showLoadMoreButton,
    fetchNextPage,
    isFetchingNextPage,
  }
}

export async function loadFilterOptions() {
  return fetchFilterOptions()
}
