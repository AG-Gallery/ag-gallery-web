import type {
  Sitemap_GetAllProductsQuery,
  Sitemap_GetAllProductsQueryVariables,
} from './generated/react-query'

import { SHOPIFY_AVAILABLE_IN_STOCK_QUERY } from '@/queries/constants'
import { fetcher } from '@/queries/graphql/fetcher'
import { Sitemap_GetAllProductsDocument } from '@/queries/graphql/generated/react-query'

export interface SitemapProduct {
  handle: string
  createdAt: string
}

/**
 * Fetches a single page of products for sitemap generation
 * Uses optimized query that only fetches handle and createdAt
 */
async function fetchSitemapProductsPage(
  after: string | undefined,
  pageSize: number,
): Promise<{
  products: SitemapProduct[]
  pageInfo: { hasNextPage: boolean; endCursor: string | null }
}> {
  const variables: Sitemap_GetAllProductsQueryVariables = {
    first: pageSize,
    after: after ?? null,
  }

  const res = await fetcher<
    Sitemap_GetAllProductsQuery,
    Sitemap_GetAllProductsQueryVariables
  >(Sitemap_GetAllProductsDocument, variables)()

  const products: SitemapProduct[] =
    res.products.edges?.map((edge) => ({
      handle: edge.node.handle,
      createdAt: edge.node.createdAt,
    })) ?? []

  return {
    products,
    pageInfo: {
      hasNextPage: res.products.pageInfo.hasNextPage,
      endCursor: res.products.pageInfo.endCursor ?? null,
    },
  }
}

/**
 * Fetches ALL products for sitemap generation with pagination
 * Uses 250 items per page for optimal performance
 */
export async function fetchAllSitemapProducts(): Promise<SitemapProduct[]> {
  const allProducts: SitemapProduct[] = []
  let cursor: string | undefined = undefined
  let hasNextPage = true

  // Use 250 as page size (Shopify Storefront API max)
  const pageSize = 250

  while (hasNextPage) {
    const page = await fetchSitemapProductsPage(cursor, pageSize)
    allProducts.push(...page.products)

    hasNextPage = page.pageInfo.hasNextPage
    cursor = page.pageInfo.endCursor ?? undefined
  }

  return allProducts
}
