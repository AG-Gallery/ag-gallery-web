import type {
  Public_GetAllProductsQuery,
  Public_GetAllProductsQueryVariables,
  Public_GetCollectionProductsQuery,
  Public_GetCollectionProductsQueryVariables,
} from '@/queries/graphql/generated/react-query'
import type {
  ArtworksFilterOptions,
  ArtworksFilterState,
} from '@/types/filters'
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

type Public_GetCollectionsQuery = {
  collections?: {
    pageInfo: {
      hasNextPage: boolean
      endCursor?: string | null
    }
    edges: Array<{
      node?: {
        handle?: string | null
        title?: string | null
      } | null
    }>
  } | null
}

type Public_GetCollectionsQueryVariables = {
  first: number
  after?: string | null
}

const PUBLIC_GET_COLLECTIONS_DOCUMENT = /* GraphQL */ `
  query Public_GetCollections($first: Int = 50, $after: String) {
    collections(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          handle
          title
        }
      }
    }
  }
`

export type ArtworksPageParam = {
  source: 'sanity' | 'shopify'
  after?: string
  collectionHandles?: string[]
  collectionIndex?: number
}

export type ArtworksPage = {
  source: 'sanity' | 'shopify'
  items: Artwork[]
  pageInfo: { hasNextPage: boolean; endCursor?: string | null }
  collectionHandles?: string[]
  collectionIndex?: number
}

function extractSanityArtworks(input: unknown): Artwork[] {
  if (Array.isArray(input)) return input as Artwork[]
  if (
    typeof input === 'object' &&
    input !== null &&
    Array.isArray((input as any).selectedArtworks)
  ) {
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
      connection as unknown as NonNullable<
        Public_GetAllProductsQuery['products']
      >,
    ) ?? []
  const items = productsToArtworks(normalized)
  const pageInfo = connection.pageInfo

  return {
    source: 'shopify',
    items,
    pageInfo: {
      hasNextPage: pageInfo.hasNextPage,
      endCursor: pageInfo.endCursor,
    },
  }
}

type CollectionSummary = {
  handle: string
  title: string
}

async function fetchCollectionsPage(
  after: string | undefined,
  pageSize: number,
): Promise<{
  items: CollectionSummary[]
  pageInfo: { hasNextPage: boolean; endCursor?: string }
}> {
  const variables: Public_GetCollectionsQueryVariables = {
    first: pageSize,
    after: after ?? null,
  }

  const res = await fetcher<
    Public_GetCollectionsQuery,
    Public_GetCollectionsQueryVariables
  >(PUBLIC_GET_COLLECTIONS_DOCUMENT, variables)()

  const connection = res.collections
  if (!connection) {
    return {
      items: [],
      pageInfo: { hasNextPage: false, endCursor: undefined },
    }
  }

  const items = connection.edges
    .map((edge) => edge.node)
    .filter((node): node is NonNullable<typeof node> => Boolean(node))
    .map((node) => ({
      handle: node.handle ?? '',
      title: node.title ?? '',
    }))
    .filter((node): node is CollectionSummary => node.handle !== '' && node.title !== '')
    .map((node) => ({
      handle: node.handle.trim(),
      title: node.title.trim(),
    }))

  const { hasNextPage, endCursor } = connection.pageInfo

  return {
    items,
    pageInfo: {
      hasNextPage,
      endCursor: endCursor ?? undefined,
    },
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

async function fetchArtworksForCollectionHandles(
  handles: string[],
  pageParam: ArtworksPageParam,
  pageSize: number,
): Promise<ArtworksPage> {
  if (handles.length === 0) {
    return {
      source: 'shopify',
      items: [],
      pageInfo: { hasNextPage: false, endCursor: undefined },
      collectionHandles: [],
      collectionIndex: 0,
    }
  }

  const uniqueHandles = Array.from(new Set(handles.filter(Boolean)))
  if (uniqueHandles.length === 0) {
    return {
      source: 'shopify',
      items: [],
      pageInfo: { hasNextPage: false, endCursor: undefined },
      collectionHandles: [],
      collectionIndex: 0,
    }
  }

  const persistedHandles = pageParam.collectionHandles
  const handleList = Array.isArray(persistedHandles)
    ? persistedHandles
    : uniqueHandles
  if (handleList.length === 0) {
    return {
      source: 'shopify',
      items: [],
      pageInfo: { hasNextPage: false, endCursor: undefined },
      collectionHandles: [],
      collectionIndex: 0,
    }
  }
  const cappedIndex = Math.max(
    0,
    Math.min(pageParam.collectionIndex ?? 0, handleList.length - 1),
  )

  let index = cappedIndex
  let after = pageParam.after

  while (index < handleList.length) {
    const handle = handleList[index]
    try {
      const page = await fetchCollectionProductsPage(handle, after, pageSize)
      if (handle.startsWith(FILTER_COLLECTION_PREFIXES.categories)) {
        console.log('[category-collection:page]', {
          handle,
          after,
          received: page.items.length,
          hasNextPage: page.pageInfo.hasNextPage,
          titles: page.items.map((item) => item.title),
        })
      }
      const adjustedItems = applyCollectionMetadataToArtworks(handle, page.items)
      const hasMoreInCollection = page.pageInfo.hasNextPage
      const hasMoreHandles = index < handleList.length - 1
      if (adjustedItems.length > 0 || after) {
        return {
          source: 'shopify',
          items: adjustedItems,
          pageInfo: {
            hasNextPage: hasMoreInCollection || hasMoreHandles,
            endCursor: hasMoreInCollection
              ? page.pageInfo.endCursor ?? undefined
              : undefined,
          },
          collectionHandles: handleList,
          collectionIndex: index,
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Failed to load collection products for handle', handle, error)
      }
    }

    index += 1
    after = undefined
  }

  return {
    source: 'shopify',
    items: [],
    pageInfo: { hasNextPage: false, endCursor: undefined },
    collectionHandles: handleList,
    collectionIndex: handleList.length,
  }
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

  const collectionHandles =
    pageParam.collectionHandles ?? buildFilterCollectionHandles(filters)

  if (collectionHandles.length > 0) {
    return fetchArtworksForCollectionHandles(
      collectionHandles,
      pageParam,
      pageSize,
    )
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
  const handles = lastPage.collectionHandles
  if (handles && handles.length > 0) {
    const index = lastPage.collectionIndex ?? 0
    const endCursor = lastPage.pageInfo.endCursor ?? undefined

    if (endCursor) {
      return {
        source: 'shopify',
        after: endCursor,
        collectionHandles: handles,
        collectionIndex: index,
      }
    }

    if (index + 1 < handles.length) {
      return {
        source: 'shopify',
        after: undefined,
        collectionHandles: handles,
        collectionIndex: index + 1,
      }
    }

    return undefined
  }

  if (lastPage.pageInfo.hasNextPage) {
    return {
      source: 'shopify',
      after: lastPage.pageInfo.endCursor ?? undefined,
    }
  }

  return undefined
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
  const initialHandles = buildFilterCollectionHandles(normalizedFilters)
  const hasFilters = initialHandles.length > 0
  const initialSource: ArtworksPageParam['source'] = hasFilters
    ? 'shopify'
    : 'sanity'

  return {
    queryKey: ['all-artworks', normalizedFilters],
    initialPageParam: {
      source: initialSource,
      after: undefined,
      collectionHandles: hasFilters ? initialHandles : undefined,
      collectionIndex: 0,
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

const COLLECTIONS_FETCH_PAGE_SIZE = 100
const COLLECTIONS_FETCH_MAX_PAGES = 20

type FilterKey = keyof ArtworksFilterOptions

const FILTER_COLLECTION_PREFIXES: Record<FilterKey, string> = {
  styles: 'style-',
  categories: 'category-',
  themes: 'theme-',
  artists: 'artist-',
}

const FILTER_COLLECTION_PREFIX_ENTRIES = Object.entries(
  FILTER_COLLECTION_PREFIXES,
) as Array<[FilterKey, string]>

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

const collectionHandleToTitle: Record<FilterKey, Map<string, string>> = {
  styles: new Map(),
  categories: new Map(),
  themes: new Map(),
  artists: new Map(),
}

function normalizeCollectionTitle(title: string): string {
  return title.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en-US')
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

  const entry = FILTER_COLLECTION_PREFIX_ENTRIES.find(([_, prefix]) =>
    handle.startsWith(prefix),
  )
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
  const registered = getRegisteredHandle(type, value)
  if (registered) return registered

  const slug = slugify(value)
  if (!slug) return undefined
  return `${FILTER_COLLECTION_PREFIXES[type]}${slug}`
}

function resolveHandlesForArtist(value: string): string[] {
  const handles = new Set<string>()
  const registered = getRegisteredHandle('artists', value)
  if (registered) handles.add(registered)

  resolveCollectionHandlesForArtist(value).forEach((handle) => {
    handles.add(handle)
  })
  return Array.from(handles)
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

function buildFilterCollectionHandles(
  filters: ArtworksFilterState,
): string[] {
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

function getCollectionMetaForHandle(
  handle: string,
): { type: FilterKey; title: string } | undefined {
  for (const [type, prefix] of FILTER_COLLECTION_PREFIX_ENTRIES) {
    if (!handle.startsWith(prefix)) continue
    const title = collectionHandleToTitle[type].get(handle)
    if (title) {
      return { type, title }
    }
  }
  return undefined
}

function applyCollectionMetadataToArtworks(
  handle: string,
  items: Artwork[],
): Artwork[] {
  const meta = getCollectionMetaForHandle(handle)
  if (!meta) return items

  switch (meta.type) {
    case 'categories':
      return items.map((artwork) => {
        if (artwork.category === meta.title) return artwork
        return { ...artwork, category: meta.title }
      })
    case 'styles':
      return items.map((artwork) => {
        if (artwork.style === meta.title) return artwork
        return { ...artwork, style: meta.title }
      })
    case 'themes':
      return items.map((artwork) => {
        if (artwork.theme === meta.title) return artwork
        return { ...artwork, theme: meta.title }
      })
    case 'artists':
      return items.map((artwork) => {
        if (artwork.artist.name === meta.title) return artwork
        return {
          ...artwork,
          artist: {
            ...artwork.artist,
            name: meta.title,
            slug: slugify(meta.title),
          },
        }
      })
    default:
      return items
  }
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
    return EMPTY_FILTER_OPTIONS
  }

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
}
