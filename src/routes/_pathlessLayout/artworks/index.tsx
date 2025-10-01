import type {
  ArtworksFilterOptions,
  ArtworksFilterState,
  ArtworksSortOption,
} from '@/types/filters'
import type { Artwork } from '@/types/products'

import { useEffect, useMemo, useRef } from 'react'

import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import ArtworksFiltersSidebar from '@/features/artworks/ArtworksFiltersSidebar'
import ArtworksGrid from '@/features/artworks/ArtworksGrid'
import ArtworksGridSkeleton from '@/features/artworks/ArtworksGridSkeleton'
import {
  createAllArtworksInfiniteQueryOptions,
  fetchFilterOptions,
} from '@/queries/artworks'
import { useUrlStore } from '@/store/url-store'

const PAGE_SIZE = 24
const DEFAULT_SORT: ArtworksSortOption = 'title-asc'
const FILTER_KEYS: Array<keyof ArtworksFilterState> = [
  'styles',
  'categories',
  'themes',
  'artists',
]

export const Route = createFileRoute('/_pathlessLayout/artworks/')({
  loader: () => fetchFilterOptions(),
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className="page-main">
      <h2 className="page-headline">Artworks</h2>
      <ArtworksGridContent />
    </main>
  )
}

function ArtworksGridContent() {
  const initialFilterOptions = Route.useLoaderData()
  const query = useUrlStore.use.query()
  const setQuery = useUrlStore.use.setQuery()
  const setQueries = useUrlStore.use.setQueries()
  const syncQueryFromUrl = useUrlStore.use.syncQueryFromUrl()
  const hasSyncedFromUrlRef = useRef(false)

  const { data: remoteFilterOptions } = useQuery({
    queryKey: ['artwork-filter-options'],
    queryFn: fetchFilterOptions,
    staleTime: 7 * 60 * 1000,
    initialData: initialFilterOptions,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const syncFromLocation = () => {
      const params = new URLSearchParams(window.location.search)
      syncQueryFromUrl(params)
    }

    if (!hasSyncedFromUrlRef.current) {
      hasSyncedFromUrlRef.current = true
      syncFromLocation()
    }

    window.addEventListener('popstate', syncFromLocation)
    return () => window.removeEventListener('popstate', syncFromLocation)
  }, [syncQueryFromUrl])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams()
    Object.entries(query).forEach(([key, values]) => {
      values.forEach((value) => {
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

  const {
    data: artworks,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    ...createAllArtworksInfiniteQueryOptions(PAGE_SIZE),
    select: (data) => data.pages.flatMap((p) => p.items),
  })

  const loadedArtworks = artworks ?? []

  const dedupedArtworks = useMemo(() => {
    if (loadedArtworks.length === 0) return loadedArtworks

    const seenKeys = new Set<string>()
    const unique: Artwork[] = []

    for (const artwork of loadedArtworks) {
      const key = artwork.gid ?? artwork.id
      if (!key || seenKeys.has(key)) continue
      seenKeys.add(key)
      unique.push(artwork)
    }

    return unique
  }, [loadedArtworks])

  const sortOption = useMemo<ArtworksSortOption>(() => {
    const [value] = query['sort'] ?? []
    return isSortOption(value) ? value : DEFAULT_SORT
  }, [query])

  const filters = useMemo<ArtworksFilterState>(
    () => ({
      styles: query['styles'] ?? [],
      categories: query['categories'] ?? [],
      themes: query['themes'] ?? [],
      artists: query['artists'] ?? [],
    }),
    [query],
  )

  const fallbackOptions = useMemo<ArtworksFilterOptions>(
    () => createFilterOptions(dedupedArtworks),
    [dedupedArtworks],
  )

  const availableOptions = useMemo<ArtworksFilterOptions>(() => {
    if (!remoteFilterOptions) return fallbackOptions

    const merge = (primary: string[], secondary: string[]) => {
      const set = new Set(primary)
      secondary.forEach((value) => set.add(value))
      return Array.from(set).sort((a, b) => a.localeCompare(b))
    }

    return {
      styles: merge(remoteFilterOptions.styles, fallbackOptions.styles),
      categories: merge(
        remoteFilterOptions.categories,
        fallbackOptions.categories,
      ),
      themes: merge(remoteFilterOptions.themes, fallbackOptions.themes),
      artists: merge(remoteFilterOptions.artists, fallbackOptions.artists),
    }
  }, [remoteFilterOptions, fallbackOptions])

  const filteredArtworks = useMemo(
    () => filterArtworks(dedupedArtworks, filters),
    [dedupedArtworks, filters],
  )

  const sortedArtworks = useMemo(
    () => sortArtworks(filteredArtworks, sortOption),
    [filteredArtworks, sortOption],
  )

  const hasActiveFilters = FILTER_KEYS.some((key) => filters[key].length > 0)

  useEffect(() => {
    if (status !== 'success') return
    if (!hasActiveFilters) return
    if (sortedArtworks.length > 0) return
    if (!hasNextPage || isFetchingNextPage) return
    void fetchNextPage()
  }, [
    status,
    hasActiveFilters,
    sortedArtworks.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ])

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

  const handleFiltersChange = (nextFilters: ArtworksFilterState) => {
    const updates: Record<string, string[] | undefined> = {}
    FILTER_KEYS.forEach((key) => {
      const values = nextFilters[key]
      updates[key] = values.length > 0 ? values : undefined
    })

    setQueries(updates)
  }

  const handleClearFilters = () => {
    const cleared: Record<string, undefined> = {}
    FILTER_KEYS.forEach((key) => {
      cleared[key] = undefined
    })
    setQueries(cleared)
  }

  const showLoadMoreButton =
    hasNextPage && (!hasActiveFilters || filteredArtworks.length >= PAGE_SIZE)

  return (
    <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
      <div className="lg:w-64 lg:flex-shrink-0">
        <ArtworksFiltersSidebar
          sortOption={sortOption}
          onSortChange={(value) =>
            setQuery('sort', value === DEFAULT_SORT ? undefined : value)
          }
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
            onClick={() => fetchNextPage()}
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

function createFilterOptions(artworks: Artwork[]): ArtworksFilterOptions {
  const styles = new Set<string>()
  const categories = new Set<string>()
  const themes = new Set<string>()
  const artists = new Set<string>()

  for (const artwork of artworks) {
    if (artwork.style) styles.add(artwork.style)
    if (artwork.category) categories.add(artwork.category)
    if (artwork.theme) themes.add(artwork.theme)
    if (artwork.artist.name) artists.add(artwork.artist.name)
  }

  const toSortedArray = (values: Set<string>) =>
    Array.from(values).sort((a, b) => a.localeCompare(b))

  return {
    styles: toSortedArray(styles),
    categories: toSortedArray(categories),
    themes: toSortedArray(themes),
    artists: toSortedArray(artists),
  }
}

function filterArtworks(
  artworks: Artwork[],
  filters: ArtworksFilterState,
): Artwork[] {
  if (
    filters.styles.length === 0 &&
    filters.categories.length === 0 &&
    filters.themes.length === 0 &&
    filters.artists.length === 0
  ) {
    return artworks
  }

  return artworks.filter((artwork) => {
    if (filters.styles.length > 0) {
      if (!artwork.style || !filters.styles.includes(artwork.style)) {
        return false
      }
    }

    if (filters.categories.length > 0) {
      if (!artwork.category || !filters.categories.includes(artwork.category)) {
        return false
      }
    }

    if (filters.themes.length > 0) {
      if (!artwork.theme || !filters.themes.includes(artwork.theme)) {
        return false
      }
    }

    if (filters.artists.length > 0) {
      if (
        !artwork.artist.name ||
        !filters.artists.includes(artwork.artist.name)
      ) {
        return false
      }
    }

    return true
  })
}

function sortArtworks(
  artworks: Artwork[],
  sortOption: ArtworksSortOption,
): Artwork[] {
  const sorted = [...artworks]

  const compareByTitle = (a: Artwork, b: Artwork) =>
    a.title.localeCompare(b.title)

  const compareByPrice = (a: Artwork, b: Artwork) =>
    getPriceValue(a) - getPriceValue(b)

  switch (sortOption) {
    case 'title-asc':
      sorted.sort(compareByTitle)
      break
    case 'title-desc':
      sorted.sort((a, b) => compareByTitle(b, a))
      break
    case 'price-asc':
      sorted.sort(compareByPrice)
      break
    case 'price-desc':
      sorted.sort((a, b) => compareByPrice(b, a))
      break
    default:
      break
  }

  return sorted
}

function getPriceValue(artwork: Artwork): number {
  const value = Number.parseFloat(artwork.price)
  return Number.isFinite(value) ? value : 0
}

function isSortOption(value: string | undefined): value is ArtworksSortOption {
  return (
    value === 'title-asc' ||
    value === 'title-desc' ||
    value === 'price-asc' ||
    value === 'price-desc'
  )
}
