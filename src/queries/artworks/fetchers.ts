import type {
  Public_GetAllProductsQuery,
  Public_GetAllProductsQueryVariables,
  Public_GetCollectionProductsQuery,
  Public_GetCollectionProductsQueryVariables,
} from '@/queries/graphql/generated/react-query'
import type { Artwork } from '@/types/products'

import { formatProducts, productsToArtworks } from '@/lib/normalizers/products'
import { fetcher } from '@/queries/graphql/fetcher'
import {
  Public_GetAllProductsDocument,
  Public_GetCollectionProductsDocument,
  Public_GetCollectionsDocument,
} from '@/queries/graphql/generated/react-query'
import { getAllArtworks } from '@/queries/sanity/products'

import type {
  ArtworksPage,
  CollectionSummary,
  Public_GetCollectionsQuery,
  Public_GetCollectionsQueryVariables,
} from './types'
import { detectFilterKey, formatCollectionTitleFromHandle } from './utils'

export async function fetchShopifyPage(
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

export async function fetchCollectionProductsPage(
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

export async function fetchCollectionsPage(
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
  >(Public_GetCollectionsDocument, variables)()

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
    .map((node) => {
      const handle = (node.handle ?? '').trim()
      const rawTitle = (node.title ?? '').trim()
      const key = detectFilterKey(handle)
      const fallback = key ? formatCollectionTitleFromHandle(handle, key) : ''
      return {
        handle,
        title: rawTitle || fallback,
      }
    })
    .filter(
      (node): node is CollectionSummary =>
        node.handle !== '' && node.title !== '',
    )

  const { hasNextPage, endCursor } = connection.pageInfo

  return {
    items,
    pageInfo: {
      hasNextPage,
      endCursor: endCursor ?? undefined,
    },
  }
}

export function extractSanityArtworks(input: unknown): Artwork[] {
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

export async function fetchSanityPage(pageSize: number): Promise<ArtworksPage> {
  const raw = await getAllArtworks()
  const items = extractSanityArtworks(raw).slice(0, pageSize)
  // Intentionally mark hasNextPage true so the next page switches to Shopify
  return {
    source: 'sanity',
    items,
    pageInfo: { hasNextPage: true, endCursor: undefined },
  }
}
