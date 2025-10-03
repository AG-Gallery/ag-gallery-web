import type { ArtworksFilterOptions } from '@/types/filters'

export const EMPTY_FILTER_OPTIONS: ArtworksFilterOptions = {
  styles: [],
  categories: [],
  themes: [],
  artists: [],
}

export const COLLECTIONS_FETCH_PAGE_SIZE = 100
export const COLLECTIONS_FETCH_MAX_PAGES = 20

type FilterKey = keyof ArtworksFilterOptions

export const FILTER_COLLECTION_PREFIXES: Record<FilterKey, string> = {
  styles: 'style-',
  categories: 'category-',
  themes: 'theme-',
  artists: 'artist-',
}

export const FILTER_COLLECTION_PREFIX_ENTRIES = Object.entries(
  FILTER_COLLECTION_PREFIXES,
) as Array<[FilterKey, string]>
