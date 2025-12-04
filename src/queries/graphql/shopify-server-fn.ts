import { createServerFn } from '@tanstack/react-start'

interface GraphQLRequest {
  query: string
  variables?: Record<string, unknown>
  operationName?: string
}

/**
 * Server function that fetches from Shopify GraphQL API
 * During SSR: executes directly on server (no HTTP overhead)
 * During client navigation: becomes a fetch request
 */
export const fetchShopifyGraphQL = createServerFn({ method: 'POST' })
  .inputValidator((data: GraphQLRequest) => data)
  .handler(async ({ data }) => {
    // Access env vars inside handler for proper runtime availability
    const SHOPIFY_DOMAIN = import.meta.env.VITE_SHOPIFY_DOMAIN
    const SHOPIFY_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_PUBLIC_TOKEN
    const SHOPIFY_API_VERSION = import.meta.env.SHOPIFY_API_VERSION ?? '2025-07'

    if (!SHOPIFY_DOMAIN || !SHOPIFY_TOKEN) {
      throw new Error('Missing SHOPIFY_DOMAIN or SHOPIFY_STOREFRONT_PUBLIC_TOKEN')
    }

    const SHOPIFY_ENDPOINT = `https://${SHOPIFY_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`

    const response = await fetch(SHOPIFY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_TOKEN,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(
        `Shopify GraphQL failed (${response.status}): ${text || response.statusText}`,
      )
    }

    return response.json()
  })
