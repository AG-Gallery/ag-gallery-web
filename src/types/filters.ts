export type ArtworksSortOption =
  | 'default'
  | 'title-asc'
  | 'title-desc'
  | 'price-asc'
  | 'price-desc'

export type ArtworksFilterState = {
  styles: string[]
  categories: string[]
  themes: string[]
  artists: string[]
}

export type ArtworksFilterOptions = {
  styles: string[]
  categories: string[]
  themes: string[]
  artists: string[]
}
