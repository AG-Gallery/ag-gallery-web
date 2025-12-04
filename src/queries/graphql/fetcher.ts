import { fetchShopifyGraphQL } from './shopify-server-fn'

/**
 * Extract the operation name from a GraphQL document string
 *
 * @param query - The query to make
 * @returns The operation name
 */
function parseOperationName(query: string): string {
  const m = /^\s*(query|mutation|subscription)\s+([A-Za-z0-9_]+)/i.exec(query)
  if (!m) throw new Error('GraphQL operation must be named (no anonymous ops).')
  return m[2]
}

/**
 * Narrows unknown JSON type.
 * @param v - The value returned from parsing JSON,
 * @returns An object with optional data and errors properties,
 */
function isObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object'
}

/**
 * Generic fetcher used by the codegen plugin.
 *
 * Uses a server function to avoid HTTP fetch during SSR on Cloudflare Workers.
 * This prevents 522 errors when trying to fetch back to the same worker during SSR.
 *
 * @param query - The query to make.
 * @param variables - The query variables.
 * @returns A function (the queryFn) as expected by the codegen plugin.
 */
export function fetcher<
  TData,
  TVariables extends Record<string, unknown> | undefined,
>(query: string, variables?: TVariables) {
  return async (): Promise<TData> => {
    const opName = parseOperationName(query)

    // Use server function instead of HTTP fetch
    // During SSR: executes directly, no HTTP overhead
    // During client navigation: becomes a fetch request
    const raw = (await fetchShopifyGraphQL({
      data: { query, variables, operationName: opName },
    })) as unknown

    if (!isObject(raw)) {
      throw new Error(`GraphQL ${opName} returned invalid JSON shape.`)
    }

    const data = raw['data'] as TData | undefined
    const errors = raw['errors']

    if (Array.isArray(errors) && errors.length > 0) {
      const msg = errors
        .map((e) =>
          isObject(e) && typeof e.message === 'string' ? e.message : 'Error',
        )
        .join('; ')
      throw new Error(`GraphQL ${opName} error: ${msg}`)
    }

    if (typeof data === 'undefined') {
      throw new Error(`GraphQL ${opName} returned no data.`)
    }

    return data
  }
}
