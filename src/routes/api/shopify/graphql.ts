import { createFileRoute } from '@tanstack/react-router'

const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN!
const SHOPIFY_TOKEN = process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN!
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

        // Decide cache policy.
        // Prefers headers from the fetcher, but falls back to parsing body
        const header = (name: string) => request.headers.get(name) ?? ''
        const hintedClass = header('X-Cache-Class').toLowerCase()

        // Fallbacks if headers are missing
        let cacheClass: 'public' | 'private' =
          hintedClass === 'public' ? 'public' : 'private'
        if (!hintedClass) {
          const q = gqlBody.query.toString()
          const m = /^\s*(query|mutation|subscription)\s+([A-Za-z0-9_]+)/i.exec(
            q,
          )
          const opType = m?.[1]?.toLowerCase()
          const opName = (gqlBody.operationName || m?.[2] || '').toLowerCase()
          cacheClass =
            opType === 'mutation'
              ? 'private'
              : opName.startsWith('public_')
                ? 'public'
                : 'private'
        }

        const cacheHeader =
          cacheClass === 'public'
            ? 'public, max-age=60, stale-while-revalidate=300'
            : 'no-store'

        return new Response(text, {
          status: upstream.status,
          headers: {
            'Content-Type':
              upstream.headers.get('content-type') ?? 'application/json',
            'Cache-Control': cacheHeader,
            Vary: 'Accept-Encoding',
          },
        })
      },
    },
  },
})
