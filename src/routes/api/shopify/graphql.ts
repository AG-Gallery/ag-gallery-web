import { createFileRoute } from '@tanstack/react-router'

const SHOPIFY_DOMAIN = process.env.VITE_SHOPIFY_DOMAIN!
const SHOPIFY_TOKEN = process.env.VITE_SHOPIFY_STOREFRONT_PUBLIC_TOKEN!
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION ?? '2025-07'

if (!SHOPIFY_DOMAIN || !SHOPIFY_TOKEN) {
  throw new Error('Missing SHOPIFY_DOMAIN or SHOPIFY_STOREFRONT_PUBLIC_TOKEN')
}

const SHOPIFY_ENDPOINT = `https://${SHOPIFY_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`

// Minimal GraphQL request shape
interface GraphQLRequest {
  query: string
  variables?: Record<string, unknown>
  operationName?: string
}

export const Route = createFileRoute('/api/shopify/graphql')({
  server: {
    handlers: {
      GET: () =>
        new Response(JSON.stringify({ error: 'Use POST for GraphQL' }), {
          status: 405,
          headers: { 'Content-Type': 'application/json', Allow: 'POST' },
        }),

      POST: async ({ request }) => {
        const ctype = request.headers.get('content-type') ?? ''
        if (!ctype.includes('application/json')) {
          return new Response(
            JSON.stringify({ error: 'Content-Type must be application/json' }),
            {
              status: 415,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        }

        let body: unknown
        try {
          body = await request.json()
        } catch {
          return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        if (
          typeof body !== 'object' ||
          body === null ||
          typeof (body as any).query !== 'string'
        ) {
          return new Response(
            JSON.stringify({ error: 'Invalid GraphQL request shape' }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        }

        const gqlBody = body as GraphQLRequest

        const upstream = await fetch(SHOPIFY_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': SHOPIFY_TOKEN,
          },
          body: JSON.stringify(gqlBody),
        })

        const text = await upstream.text()

        // No HTTP caching - all queries have variables which can't be part of HTTP cache key
        // Client-side caching is handled by React Query
        return new Response(text, {
          status: upstream.status,
          headers: {
            'Content-Type':
              upstream.headers.get('content-type') ?? 'application/json',
            'Cache-Control': 'no-store',
          },
        })
      },
    },
  },
})
