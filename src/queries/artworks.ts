import type {
  Public_GetAllProductsQuery,
  Public_GetAllProductsQueryVariables,
} from '@/queries/graphql/generated/react-query'
import type { ArtworksFilterOptions } from '@/types/filters'
import type { Artwork } from '@/types/products'
import type { QueryFunctionContext, QueryKey } from '@tanstack/react-query'

import { formatProducts, productsToArtworks } from '@/lib/normalizers/products'
import { fetcher } from '@/queries/graphql/fetcher'
import { Public_GetAllProductsDocument } from '@/queries/graphql/generated/react-query'
import { getAllArtworks } from '@/queries/sanity/products'

export type ArtworksPageParam = { source: 'sanity' | 'shopify'; after?: string }

export type ArtworksPage = {
  source: 'sanity' | 'shopify'
  items: Artwork[]
  pageInfo: { hasNextPage: boolean; endCursor?: string | null }
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

export async function fetchArtworksPage(
  { pageParam }: QueryFunctionContext<QueryKey, ArtworksPageParam>,
  pageSize = 24,
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
    ? { source: 'shopify', after: lastPage.pageInfo.endCursor ?? undefined }
    : undefined
}

export function createAllArtworksInfiniteQueryOptions(pageSize = 24) {
  return {
    queryKey: ['all-artworks'],
    initialPageParam: { source: 'sanity' as const, after: undefined },
    queryFn: (ctx: QueryFunctionContext<QueryKey, ArtworksPageParam>) =>
      fetchArtworksPage(ctx, pageSize),
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
        if (artwork.style) optionSets.styles.add(artwork.style)
        if (artwork.category) optionSets.categories.add(artwork.category)
        if (artwork.theme) optionSets.themes.add(artwork.theme)
        const artistName = artwork.artist.name
        if (artistName) optionSets.artists.add(artistName)
      })
      hasNextPage = page.pageInfo.hasNextPage
      after = page.pageInfo.endCursor ?? undefined
    }

    const sanityArtworks = extractSanityArtworks(await getAllArtworks())
    sanityArtworks.forEach((artwork) => {
      if (artwork.style) optionSets.styles.add(artwork.style)
      if (artwork.category) optionSets.categories.add(artwork.category)
      if (artwork.theme) optionSets.themes.add(artwork.theme)
      const artistName = artwork.artist.name
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
