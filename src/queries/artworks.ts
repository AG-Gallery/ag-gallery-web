import type {
  Public_GetAllProductsQuery,
  Public_GetAllProductsQueryVariables,
  Public_GetCollectionProductsQuery,
  Public_GetCollectionProductsQueryVariables,
} from '@/queries/graphql/generated/react-query'
import type { ArtworksFilterOptions, ArtworksFilterState } from '@/types/filters'
import type { Artwork } from '@/types/products'
import type { QueryFunctionContext, QueryKey } from '@tanstack/react-query'

import { formatProducts, productsToArtworks } from '@/lib/normalizers/products'
import { slugify, slugifyName } from '@/lib/utils'
import { fetcher } from '@/queries/graphql/fetcher'
import {
  Public_GetAllProductsDocument,
  Public_GetCollectionProductsDocument,
} from '@/queries/graphql/generated/react-query'
import { getAllArtworks } from '@/queries/sanity/products'

export type ArtworksPageParam = {
  source: 'sanity' | 'shopify'
  after?: string
  artistHandle?: string
}

export type ArtworksPage = {
  source: 'sanity' | 'shopify'
  items: Artwork[]
  pageInfo: { hasNextPage: boolean; endCursor?: string | null }
  artistHandle?: string
}

function isRecord(v: unknown): v is Record<string | number | symbol, unknown> {
  return typeof v === 'object' && v !== null
}

function extractSanityArtworks(input: unknown): Artwork[] {
  if (Array.isArray(input)) return input as Artwork[]
  if (isRecord(input) && Array.isArray((input as any).selectedArtworks)) {
    return (input as any).selectedArtworks as Artwork[]
  }
  return []
}

async function fetchShopifyPage(
  after: string | undefined,
  pageSize: number,
): Promise<ArtworksPage> {
  const variables: Public_GetAllProductsQueryVariables = {
    first: pageSize,
    after,
    imagesFirst: 1,
  }

  const res = await fetcher<
    Public_GetAllProductsQuery,
    Public_GetAllProductsQueryVariables
  >(Public_GetAllProductsDocument, variables)()

  const normalized = formatProducts(res.products) ?? []
  const items = productsToArtworks(normalized)
  const pageInfo = res.products.pageInfo

  return { source: 'shopify', items, pageInfo }
}

async function fetchCollectionProductsPage(
  handle: string,
  after: string | undefined,
  pageSize: number,
): Promise<ArtworksPage> {
  const variables: Public_GetCollectionProductsQueryVariables = {
    collectionHandle: handle,
    productsFirst: pageSize,
    productsAfter: after,
    imagesFirst: 1,
  }

  const res = await fetcher<
    Public_GetCollectionProductsQuery,
    Public_GetCollectionProductsQueryVariables
  >(Public_GetCollectionProductsDocument, variables)().catch((error) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Failed to load collection products', handle, error)
    }
    throw error
  })

  const connection = res.collectionByHandle?.products
  if (!connection) {
    return {
      source: 'shopify',
      items: [],
      pageInfo: { hasNextPage: false, endCursor: undefined },
    }
  }

  const normalized =
    formatProducts(
      connection as unknown as NonNullable<Public_GetAllProductsQuery['products']>,
    ) ?? []
  const items = productsToArtworks(normalized)
  const pageInfo = connection.pageInfo

  return {
    source: 'shopify',
    items,
    pageInfo: { hasNextPage: pageInfo.hasNextPage, endCursor: pageInfo.endCursor },
    artistHandle: handle,
  }
}

export function resolveCollectionHandlesForArtist(name: string) {
  const handles = new Set<string>()

  const primary = slugifyName(name)
  const fallback = slugify(name)

  ;[primary, fallback].forEach((variant) => {
    if (!variant) return
    handles.add(`artist-${variant}`)
  })

  return Array.from(handles)
}

async function fetchArtworksForArtists(
  artists: string[],
  pageSize: number,
): Promise<Artwork[]> {
  if (artists.length === 0) return []

  const collected: Artwork[] = []
  const seen = new Set<string>()

  for (const name of artists) {
    const handleCandidates = resolveCollectionHandlesForArtist(name)
    if (handleCandidates.length === 0) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('No collection handles found for artist', name)
      }
    }

    for (const handle of handleCandidates) {
      let after: string | undefined = undefined
      let hasNextPage = true
      const beforeCount = collected.length

      while (hasNextPage) {
        const page = await fetchCollectionProductsPage(handle, after, pageSize)
        page.items.forEach((artwork) => {
          const key = artwork.gid || artwork.id
          if (key && !seen.has(key)) {
            seen.add(key)
            collected.push(artwork)
          }
        })
        hasNextPage = page.pageInfo.hasNextPage
        after = page.pageInfo.endCursor ?? undefined
      }

      if (collected.length > beforeCount) {
        break
      }
    }
  }

  return collected
}

export async function fetchArtworksPage(
  { pageParam }: QueryFunctionContext<QueryKey, ArtworksPageParam>,
  {
    pageSize = 24,
    filters,
  }: {
    pageSize?: number
    filters: ArtworksFilterState
  },
): Promise<ArtworksPage> {
  if (pageParam.source === 'sanity') {
    const raw = await getAllArtworks()
    const items = extractSanityArtworks(raw).slice(0, pageSize)
    // Intentionally mark hasNextPage true so the next page switches to Shopify
    return {
      source: 'sanity',
      items,
      pageInfo: { hasNextPage: true, endCursor: undefined },
    }
  }

  const artistFilters = filters.artists
  if (artistFilters.length === 1) {
    const artistName = artistFilters[0]
    const candidateHandles = pageParam.artistHandle
      ? [pageParam.artistHandle]
      : resolveCollectionHandlesForArtist(artistName)

    for (const handle of candidateHandles) {
      try {
        const page = await fetchCollectionProductsPage(
          handle,
          pageParam.after,
          pageSize,
        )

        if (process.env.NODE_ENV !== 'production') {
          console.debug('[artist-collection]', {
            artist: artistName,
            handle,
            after: pageParam.after,
            received: page.items.length,
            hasNextPage: page.pageInfo.hasNextPage,
          })
        }

        if (page.items.length > 0 || pageParam.after) {
          return { ...page, artistHandle: handle }
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Falling back to default feed for artist', artistName)
        }
        break
      }
    }
  } else if (artistFilters.length > 1) {
    const artistArtworks = await fetchArtworksForArtists(artistFilters, pageSize)
    if (artistArtworks.length > 0) {
      return {
        source: 'shopify',
        items: artistArtworks,
        pageInfo: { hasNextPage: false, endCursor: undefined },
      }
    }
  }

  return fetchShopifyPage(pageParam.after, pageSize)
}

export function getNextArtworksPageParam(
  lastPage: ArtworksPage,
): ArtworksPageParam | undefined {
  if (lastPage.source === 'sanity') {
    // After the initial Sanity page, we move to Shopify paging
    return { source: 'shopify', after: undefined }
  }
  return lastPage.pageInfo.hasNextPage
    ? {
        source: 'shopify',
        after: lastPage.pageInfo.endCursor ?? undefined,
        artistHandle: lastPage.artistHandle,
      }
    : undefined
}

function normalizeFilterValues(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b))
}

function normalizeFilters(filters: ArtworksFilterState): ArtworksFilterState {
  return {
    styles: normalizeFilterValues(filters.styles),
    categories: normalizeFilterValues(filters.categories),
    themes: normalizeFilterValues(filters.themes),
    artists: normalizeFilterValues(filters.artists),
  }
}

export function createAllArtworksInfiniteQueryOptions({
  pageSize = 24,
  filters,
}: {
  pageSize?: number
  filters: ArtworksFilterState
}) {
  const normalizedFilters = normalizeFilters(filters)
  const initialSource: ArtworksPageParam['source'] =
    normalizedFilters.artists.length > 0 ? 'shopify' : 'sanity'
  const initialArtistHandle =
    normalizedFilters.artists.length === 1
      ? resolveCollectionHandlesForArtist(normalizedFilters.artists[0])[0]
      : undefined

  return {
    queryKey: ['all-artworks', normalizedFilters],
    initialPageParam: {
      source: initialSource,
      after: undefined,
      artistHandle: initialArtistHandle,
    },
    queryFn: (ctx: QueryFunctionContext<QueryKey, ArtworksPageParam>) =>
      fetchArtworksPage(ctx, { pageSize, filters: normalizedFilters }),
    getNextPageParam: getNextArtworksPageParam,
    gcTime: 7 * 60 * 1000,
    maxPages: 20,
  }
}

const EMPTY_FILTER_OPTIONS: ArtworksFilterOptions = {
  styles: [],
  categories: [],
  themes: [],
  artists: [],
}

const FILTER_FETCH_PAGE_SIZE = 50
const FILTER_FETCH_MAX_PAGES = 20

export async function fetchFilterOptions(): Promise<ArtworksFilterOptions> {
  try {
    const optionSets = {
      styles: new Set<string>(),
      categories: new Set<string>(),
      themes: new Set<string>(),
      artists: new Set<string>(),
    }

    let after: string | undefined = undefined
    let hasNextPage = true
    let iterations = 0

    while (hasNextPage && iterations < FILTER_FETCH_MAX_PAGES) {
      iterations += 1
      const page = await fetchShopifyPage(after, FILTER_FETCH_PAGE_SIZE)
      page.items.forEach((artwork) => {
        const styleRaw = artwork.style
        const style = typeof styleRaw === 'string' ? styleRaw.trim() : ''
        if (style) optionSets.styles.add(style)

        const categoryRaw = artwork.category
        const category = typeof categoryRaw === 'string' ? categoryRaw.trim() : ''
        if (category) optionSets.categories.add(category)

        const themeRaw = artwork.theme
        const theme = typeof themeRaw === 'string' ? themeRaw.trim() : ''
        if (theme) optionSets.themes.add(theme)

        const artistName = artwork.artist.name.trim()
        if (artistName) optionSets.artists.add(artistName)
      })
      hasNextPage = page.pageInfo.hasNextPage
      after = page.pageInfo.endCursor ?? undefined
    }

    // Sanity-only artwork metadata can expose options the Shopify feed has not surfaced yet.
    const sanityArtworks = extractSanityArtworks(await getAllArtworks())
    sanityArtworks.forEach((artwork) => {
      const styleRaw = artwork.style
      const style = typeof styleRaw === 'string' ? styleRaw.trim() : ''
      if (style) optionSets.styles.add(style)

      const categoryRaw = artwork.category
      const category = typeof categoryRaw === 'string' ? categoryRaw.trim() : ''
      if (category) optionSets.categories.add(category)

      const themeRaw = artwork.theme
      const theme = typeof themeRaw === 'string' ? themeRaw.trim() : ''
      if (theme) optionSets.themes.add(theme)

      const artistName = artwork.artist.name.trim()
      if (artistName) optionSets.artists.add(artistName)
    })

    return {
      styles: Array.from(optionSets.styles).sort((a, b) => a.localeCompare(b)),
      categories: Array.from(optionSets.categories).sort((a, b) =>
        a.localeCompare(b),
      ),
      themes: Array.from(optionSets.themes).sort((a, b) => a.localeCompare(b)),
      artists: Array.from(optionSets.artists).sort((a, b) =>
        a.localeCompare(b),
      ),
    }
  } catch (error) {
    console.error('Failed to fetch filter options', error)
    return EMPTY_FILTER_OPTIONS
  }
}
