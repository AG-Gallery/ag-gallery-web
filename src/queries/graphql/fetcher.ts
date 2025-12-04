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

    // Use absolute URL for SSR compatibility
    const isServer = typeof window === 'undefined'
    const baseUrl = isServer
      ? (import.meta.env.VITE_BASE_URL || 'https://ag-gallery.com')
      : ''
    const url = `${baseUrl}/api/shopify/graphql`

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables, operationName: opName }),
    })

    // Non-2xx: try to surface server body (text) for debugging
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(
        `GraphQL ${opName} failed (${res.status}): ${text || res.statusText}`,
      )
    }

    // Guard: empty/204 or non-JSON content
    const ctype = res.headers.get('content-type') || ''
    if (res.status === 204 || !ctype.includes('application/json')) {
      const text = await res.text().catch(() => '')
      throw new Error(
        `GraphQL ${opName} returned non-JSON or empty body (${res.status}). ${text}`,
      )
    }

    const raw = (await res.json().catch(() => undefined)) as unknown
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
