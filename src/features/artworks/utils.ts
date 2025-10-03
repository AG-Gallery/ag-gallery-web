import type {
  ArtworksFilterState,
  ArtworksSortOption,
} from '@/types/filters'
import type { Artwork } from '@/types/products'

// Merge Sanity + Shopify results while keeping the earliest instance of each work (gid with id fallback).
export function dedupeArtworks(artworks: Artwork[]): Artwork[] {
  if (artworks.length === 0) return artworks

  const seen = new Set<string>()
  const unique: Artwork[] = []

  artworks.forEach((artwork) => {
    const key = artwork.gid
    if (!key || seen.has(key)) return
    seen.add(key)
    unique.push(artwork)
  })

  return unique
}

export function mergeFilterOptions(
  primary: {
    styles: string[]
    categories: string[]
    themes: string[]
    artists: string[]
  },
  fallback: {
    styles: string[]
    categories: string[]
    themes: string[]
    artists: string[]
  },
) {
  const mergeValues = (primaryValues: string[], fallbackValues: string[]) => {
    const set = new Set(primaryValues)
    fallbackValues.forEach((value) => set.add(value))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }

  return {
    styles: mergeValues(primary.styles, fallback.styles),
    categories: mergeValues(primary.categories, fallback.categories),
    themes: mergeValues(primary.themes, fallback.themes),
    artists: mergeValues(primary.artists, fallback.artists),
  }
}

const normalizeFilterValue = (value: string | null | undefined) => {
  if (typeof value !== 'string') return ''
  return value.trim()
}

type AttributeExtractor = (artwork: Artwork) => string[]

const attributeExtractors: Record<keyof ArtworksFilterState, AttributeExtractor> = {
  styles: (artwork) => {
    const values: string[] = []
    const primary = normalizeFilterValue(artwork.style)
    if (primary) values.push(primary)
    const tags = (artwork as Artwork & { styleTags?: string[] }).styleTags
    if (Array.isArray(tags)) {
      tags.forEach((tag) => {
        const normalized = normalizeFilterValue(tag)
        if (normalized) values.push(normalized)
      })
    }
    return Array.from(new Set(values))
  },
  categories: (artwork) => {
    const value = normalizeFilterValue(artwork.category)
    return value ? [value] : []
  },
  themes: (artwork) => {
    const values: string[] = []
    const primary = normalizeFilterValue(artwork.theme)
    if (primary) values.push(primary)
    const tags = (artwork as Artwork & { themeTags?: string[] }).themeTags
    if (Array.isArray(tags)) {
      tags.forEach((tag) => {
        const normalized = normalizeFilterValue(tag)
        if (normalized) values.push(normalized)
      })
    }
    return Array.from(new Set(values))
  },
  artists: (artwork) => {
    const value = normalizeFilterValue(artwork.artist.name)
    return value ? [value] : []
  },
}

export function filterArtworks(
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
    return (Object.keys(filters) as Array<keyof ArtworksFilterState>).every(
      (key) => {
        const selectedValues = filters[key]
        if (selectedValues.length === 0) return true

        const availableValues = attributeExtractors[key](artwork)
        if (availableValues.length === 0) return false

        return selectedValues.some((selected) =>
          availableValues.includes(normalizeFilterValue(selected)),
        )
      },
    )
  })
}

export function sortArtworks(
  artworks: Artwork[],
  sortOption: ArtworksSortOption,
): Artwork[] {
  if (sortOption === 'title-asc') {
    return artworks
  }

  const sorted = [...artworks]

  const compareByTitle = (a: Artwork, b: Artwork) =>
    a.title.localeCompare(b.title)

  const compareByPrice = (a: Artwork, b: Artwork) =>
    getPriceValue(a) - getPriceValue(b)

  switch (sortOption) {
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
