type CacheClass = 'public' | 'private'

/**
 * Extract the first operation (type + name) from a GraphQL document string
 *
 * @param query - The query to make
 * @returns An object containing the operation type and name
 */
function parseOperation(query: string): {
  opType: 'query' | 'mutation' | 'subscription'
  opName: string
} {
  const m = /^\s*(query|mutation|subscription)\s+([A-Za-z0-9_]+)/i.exec(query)
  if (!m) throw new Error('GraphQL operation must be named (no anonymous ops).')
  const opType = m[1].toLowerCase() as 'query' | 'mutation' | 'subscription'
  const opName = m[2]
  return { opType, opName }
}

/**
 * Classify cacheability via name prefix + type
 *
 * @param opType - The operation type
 * @param opName - The operation name
 * @returns The CacheClass ("public" or "private")
 */
function classifyCache(
  opType: 'query' | 'mutation' | 'subscription',
  opName: string,
): CacheClass {
  if (opType === 'mutation') return 'private'
  const lower = opName.toLowerCase()
  if (lower.startsWith('public_')) return 'public'
  if (
    lower.startsWith('cart_') ||
    lower.startsWith('checkout_') ||
    lower.startsWith('customer_')
  )
    return 'private'
  throw new Error(
    `Operation name "${opName}" must start with one of: Public_, Cart_, Checkout_, Customer_.`,
  )
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
    const { opType, opName } = parseOperation(query)
    const cacheClass = classifyCache(opType, opName)

    const res = await fetch('/api/shopify/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Cache-Class': cacheClass,
        'X-Op-Name': opName,
        'X-Op-Type': opType,
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
