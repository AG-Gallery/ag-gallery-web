import type { ArtworksFilterOptions, ArtworksFilterState } from '@/types/filters'

import { slugify } from '@/lib/utils'

import {
  COLLECTIONS_FETCH_MAX_PAGES,
  COLLECTIONS_FETCH_PAGE_SIZE,
  EMPTY_FILTER_OPTIONS,
  FILTER_COLLECTION_PREFIXES,
} from './constants'
import { fetchCollectionsPage } from './fetchers'
import type { CollectionSummary } from './types'
import {
  normalizeCollectionTitle,
  resolveCollectionHandlesForArtist,
} from './utils'

type FilterKey = keyof ArtworksFilterOptions

const collectionHandleLookup: Record<FilterKey, Map<string, string>> = {
  styles: new Map(),
  categories: new Map(),
  themes: new Map(),
  artists: new Map(),
}

const collectionTitleLookup: Record<FilterKey, Map<string, string>> = {
  styles: new Map(),
  categories: new Map(),
  themes: new Map(),
  artists: new Map(),
}

export const collectionHandleToTitle: Record<FilterKey, Map<string, string>> = {
  styles: new Map(),
  categories: new Map(),
  themes: new Map(),
  artists: new Map(),
}

function addCollectionToOptions(
  collection: CollectionSummary,
  optionSets: {
    styles: Set<string>
    categories: Set<string>
    themes: Set<string>
    artists: Set<string>
  },
) {
  const { handle, title } = collection
  if (!handle || !title) return

  const entry = Object.entries(FILTER_COLLECTION_PREFIXES).find(([_, prefix]) =>
    handle.startsWith(prefix),
  ) as [FilterKey, string] | undefined

  if (!entry) return

  const [type] = entry
  const normalizedTitle = title.trim()
  if (!normalizedTitle) return

  const canonical = normalizeCollectionTitle(normalizedTitle)
  const seenTitles = collectionTitleLookup[type]
  if (seenTitles.has(canonical)) {
    if (!collectionHandleToTitle[type].has(handle)) {
      collectionHandleToTitle[type].set(handle, normalizedTitle)
    }
    return
  }

  seenTitles.set(canonical, normalizedTitle)
  optionSets[type].add(normalizedTitle)
  if (!collectionHandleLookup[type].has(normalizedTitle)) {
    collectionHandleLookup[type].set(normalizedTitle, handle)
  }
  if (!collectionHandleToTitle[type].has(handle)) {
    collectionHandleToTitle[type].set(handle, normalizedTitle)
  }
}

function getRegisteredHandle(
  type: keyof typeof FILTER_COLLECTION_PREFIXES,
  value: string,
): string | undefined {
  return collectionHandleLookup[type].get(value)
}

function normalizeHandleFromValue(
  type: keyof typeof FILTER_COLLECTION_PREFIXES,
  value: string,
): string | undefined {
  // Don't use cached lookup - always build handle fresh from the value
  // This prevents stale data in production server-side rendering
  const slug = slugify(value)
  if (!slug) return undefined
  return `${FILTER_COLLECTION_PREFIXES[type]}${slug}`
}

function resolveHandlesForArtist(value: string): string[] {
  // Don't use cached lookup - always build handles fresh from the artist name
  // This prevents stale data in production server-side rendering
  return resolveCollectionHandlesForArtist(value)
}

function resolveHandlesForFilter(
  type: keyof ArtworksFilterState,
  value: string,
): string[] {
  if (!value) return []
  if (type === 'artists') {
    return resolveHandlesForArtist(value)
  }

  const handle = normalizeHandleFromValue(type, value)
  return handle ? [handle] : []
}

export function buildFilterCollectionHandles(filters: ArtworksFilterState): string[] {
  const allHandles = new Set<string>()

  ;(Object.keys(filters) as Array<keyof ArtworksFilterState>).forEach((key) => {
    const values = filters[key]
    values.forEach((value) => {
      resolveHandlesForFilter(key, value).forEach((handle) => {
        if (handle) allHandles.add(handle)
      })
    })
  })

  return Array.from(allHandles)
}

export async function fetchFilterOptions(): Promise<ArtworksFilterOptions> {
  collectionHandleLookup.styles.clear()
  collectionHandleLookup.categories.clear()
  collectionHandleLookup.themes.clear()
  collectionHandleLookup.artists.clear()
  collectionTitleLookup.styles.clear()
  collectionTitleLookup.categories.clear()
  collectionTitleLookup.themes.clear()
  collectionTitleLookup.artists.clear()
  collectionHandleToTitle.styles.clear()
  collectionHandleToTitle.categories.clear()
  collectionHandleToTitle.themes.clear()
  collectionHandleToTitle.artists.clear()

  const optionSets = {
    styles: new Set<string>(),
    categories: new Set<string>(),
    themes: new Set<string>(),
    artists: new Set<string>(),
  }

  let after: string | undefined = undefined
  let hasNextPage = true
  let iterations = 0

  while (hasNextPage && iterations < COLLECTIONS_FETCH_MAX_PAGES) {
    iterations += 1

    let page: Awaited<ReturnType<typeof fetchCollectionsPage>>
    try {
      page = await fetchCollectionsPage(after, COLLECTIONS_FETCH_PAGE_SIZE)
    } catch (error) {
      console.error('Failed to fetch filter collections page', error)
      break
    }

    page.items.forEach((collection) => {
      addCollectionToOptions(collection, optionSets)
    })

    hasNextPage = page.pageInfo.hasNextPage
    after = page.pageInfo.endCursor
  }

  const hasAnyOptions = Object.values(optionSets).some((set) => set.size > 0)

  if (!hasAnyOptions) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[filter-options] no collections discovered')
    }
    return EMPTY_FILTER_OPTIONS
  }

  return {
    styles: Array.from(optionSets.styles).sort((a, b) => a.localeCompare(b)),
    categories: Array.from(optionSets.categories).sort((a, b) =>
      a.localeCompare(b),
    ),
    themes: Array.from(optionSets.themes).sort((a, b) => a.localeCompare(b)),
    artists: Array.from(optionSets.artists).sort((a, b) => a.localeCompare(b)),
  }
}
