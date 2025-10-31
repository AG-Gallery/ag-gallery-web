const ENDPOINT =
  import.meta.env.VITE_CHECKOUT_SESSION_ENDPOINT ??
  '/api/internal/checkout-session'

export type CheckoutSessionPayload = {
  clientId: string
  cartId: string
  checkoutUrl: string
}

export type CheckoutStatus = {
  status: 'pending' | 'completed'
  checkoutUrl: string
  cartId: string | null
  completedAt: string | null
}

export async function announceCheckoutSession(
  payload: CheckoutSessionPayload,
): Promise<void> {
  if (!ENDPOINT) return

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true,
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.warn('[checkout-session] failed to announce', res.status, text)
    }
  } catch (error) {
    console.warn('[checkout-session] error announcing session', error)
  }
}

export async function fetchCheckoutStatus(
  clientId: string,
): Promise<CheckoutStatus | null> {
  if (!ENDPOINT) return null

  try {
    const url = new URL(ENDPOINT)
    url.searchParams.set('clientId', clientId)

    const res = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    })

    if (res.status === 204) return null
    if (!res.ok) {
      console.warn('[checkout-session] status request failed', res.status)
      return null
    }

    const json = (await res.json()) as {
      status: CheckoutStatus['status']
      checkoutUrl: string
      cartId: string | null
      completedAt: string | null
    }

    return {
      status: json.status,
      checkoutUrl: json.checkoutUrl,
      cartId: json.cartId,
      completedAt: json.completedAt,
    }
  } catch (error) {
    console.warn('[checkout-session] failed to fetch status', error)
    return null
  }
}
