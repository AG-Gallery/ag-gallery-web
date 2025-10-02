import type {
  ArtworksFilterOptions,
  ArtworksFilterState,
  ArtworksSortOption,
} from '@/types/filters'

import { useEffect, useMemo, useRef } from 'react'

import { useQuery } from '@tanstack/react-query'

import {
  loadFilterOptions,
  useArtworksListing,
} from '@/hooks/useArtworksListing'
import { Route } from '@/routes/_pathlessLayout/artworks'
import { useUrlStore } from '@/store/url-store'

import ArtworksFiltersSidebar from './ArtworksFiltersSidebar'
import ArtworksGrid from './ArtworksGrid'
import ArtworksGridSkeleton from './ArtworksGridSkeleton'
import { mergeFilterOptions } from './utils'

const DEFAULT_SORT: ArtworksSortOption = 'title-asc'
const FILTER_KEYS: Array<keyof ArtworksFilterState> = [
  'styles',
  'categories',
  'themes',
  'artists',
]

function isSortOption(value: string | undefined): value is ArtworksSortOption {
  return (
    value === 'title-asc' ||
    value === 'title-desc' ||
    value === 'price-asc' ||
    value === 'price-desc'
  )
}

export default function ArtworksGridContent() {
  const initialFilterOptions = Route.useLoaderData()
  const query = useUrlStore.use.query()
  const setQuery = useUrlStore.use.setQuery()
  const setQueries = useUrlStore.use.setQueries()
  const syncQueryFromUrl = useUrlStore.use.syncQueryFromUrl()
  const hasSyncedFromUrlRef = useRef(false)

  const { data: remoteFilterOptions } = useQuery({
    queryKey: ['artwork-filter-options'],
    queryFn: loadFilterOptions,
    staleTime: 7 * 60 * 1000,
    initialData: initialFilterOptions,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    function syncFromLocation() {
      const params = new URLSearchParams(window.location.search)
      syncQueryFromUrl(params)
    }

    if (!hasSyncedFromUrlRef.current) {
      hasSyncedFromUrlRef.current = true
      syncFromLocation()
    }

    window.addEventListener('popstate', syncFromLocation)
    return function cleanupPopStateListener() {
      window.removeEventListener('popstate', syncFromLocation)
    }
  }, [syncQueryFromUrl])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams()
    Object.entries(query).forEach(function appendValues([key, values]) {
      values.forEach(function appendValue(value) {
        if (value) params.append(key, value)
      })
    })

    const searchString = params.toString()
    const nextUrl = searchString
      ? `${window.location.pathname}?${searchString}`
      : window.location.pathname
    const currentUrl = `${window.location.pathname}${window.location.search}`

    if (nextUrl !== currentUrl) {
      window.history.replaceState(null, '', nextUrl)
    }
  }, [query])

  const [sortValue] = query['sort'] ?? []
  const sortOption: ArtworksSortOption = isSortOption(sortValue)
    ? sortValue
    : DEFAULT_SORT

  const filters: ArtworksFilterState = {
    styles: query['styles'] ?? [],
    categories: query['categories'] ?? [],
    themes: query['themes'] ?? [],
    artists: query['artists'] ?? [],
  }

  const {
    fallbackOptions,
    sortedArtworks,
    status,
    showLoadMoreButton,
    fetchNextPage,
    isFetchingNextPage,
  } = useArtworksListing({ sortOption, filters })

  const availableOptions = useMemo<ArtworksFilterOptions>(() => {
    return mergeFilterOptions(remoteFilterOptions, fallbackOptions)
  }, [remoteFilterOptions, fallbackOptions])

  if (status === 'pending') {
    return <ArtworksGridSkeleton />
  }

  if (status === 'error') {
    return (
      <p className="mt-4 text-center text-sm text-red-600">
        Unable to load artworks. Please try again.
      </p>
    )
  }

  function handleFiltersChange(nextFilters: ArtworksFilterState) {
    const updates: Record<string, string[] | undefined> = {}
    FILTER_KEYS.forEach(function mapFilters(key) {
      const values = nextFilters[key]
      updates[key] = values.length > 0 ? values : undefined
    })

    setQueries(updates)
  }

  function handleClearFilters() {
    const cleared: Record<string, undefined> = {}
    FILTER_KEYS.forEach(function clearFilter(key) {
      cleared[key] = undefined
    })
    setQueries(cleared)
  }

  function handleSortChange(value: ArtworksSortOption) {
    setQuery('sort', value === DEFAULT_SORT ? undefined : value)
  }

  function handleLoadMoreRequest() {
    void fetchNextPage()
  }

  return (
    <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
      <div className="lg:sticky lg:top-36 lg:w-64 lg:flex-shrink-0 lg:self-start lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto lg:pr-2">
        <ArtworksFiltersSidebar
          sortOption={sortOption}
          onSortChange={handleSortChange}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          availableOptions={availableOptions}
          onClearFilters={handleClearFilters}
        />
      </div>

      <div className="flex-1 space-y-6">
        {sortedArtworks.length > 0 ? (
          <ArtworksGrid artworks={sortedArtworks} />
        ) : (
          <div className="flex min-h-[240px] items-center justify-center rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
            No artworks match your current filters. Try adjusting or clearing
            them.
          </div>
        )}

        {showLoadMoreButton && (
          <button
            onClick={handleLoadMoreRequest}
            disabled={isFetchingNextPage}
            className="mx-auto block cursor-pointer rounded-full border border-black px-6 py-3 font-medium transition-colors duration-200 ease-in hover:bg-black hover:text-white disabled:opacity-50"
          >
            {isFetchingNextPage ? 'Loading…' : 'Show more'}
          </button>
        )}
      </div>
    </div>
  )
}
