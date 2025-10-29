import { useState } from 'react'

import {
  useCreateCartMutation,
  useGetProductsForCheckoutQuery,
} from '@/queries/graphql/generated/react-query'
import { useBagStore } from '@/store/bag-store'

type CheckoutError = {
  type: 'unavailable' | 'network' | 'validation' | 'unknown'
  message: string
  unavailableItems?: string[]
}

export function useCheckout() {
  const [error, setError] = useState<CheckoutError | null>(null)
  const items = useBagStore.use.items()
  const setPendingCheckout = useBagStore.use.setPendingCheckout()
  const pendingCheckoutUrl = useBagStore.use.pendingCheckoutUrl()

  // Validate inventory before checkout
  const { refetch: refetchProducts } = useGetProductsForCheckoutQuery(
    {
      ids: items.map((item) => item.id),
    },
    {
      enabled: false, // Only run when we manually trigger
    },
  )

  const createCartMutation = useCreateCartMutation({
    onSuccess: (data) => {
      const cartCreate = data.cartCreate
      const checkoutUrl = cartCreate?.cart?.checkoutUrl
      const cartId = cartCreate?.cart?.id ?? null
      const userErrors = cartCreate?.userErrors ?? []

      if (checkoutUrl && userErrors.length === 0) {
        setPendingCheckout({ url: checkoutUrl, cartId })
        window.open(checkoutUrl, '_blank', 'noopener,noreferrer')
        return
      }

      if (userErrors.length > 0) {
        const errorMessages = userErrors.map((err) => err.message).join(', ')
        setError({
          type: 'validation',
          message: errorMessages || 'Unable to complete checkout.',
        })
        return
      }

      setError({
        type: 'unknown',
        message: 'Checkout did not complete. Please try again.',
      })
    },
    onError: (err) => {
      console.error('Checkout error:', err)
      setError({
        type: 'network',
        message: 'Failed to create checkout. Please try again.',
      })
    },
  })

  const proceedToCheckout = async () => {
    setError(null)

    if (pendingCheckoutUrl) {
      setError({
        type: 'validation',
        message: 'Please resume or dismiss your existing checkout first.',
      })
      return
    }

    if (items.length === 0) {
      setError({
        type: 'validation',
        message: 'Your bag is empty',
      })
      return
    }

    try {
      // First, validate inventory availability
      const { data } = await refetchProducts()

      if (!data?.products) {
        setError({
          type: 'network',
          message: 'Failed to validate product availability',
        })
        return
      }

      // Check which items are unavailable or out of stock
      const unavailableItems: string[] = []

      items.forEach((bagItem) => {
        const product = data.products.find((p) => p?.id === bagItem.id)

        if (!product) {
          unavailableItems.push(bagItem.title)
          return
        }

        if (product.__typename === 'Product') {
          const variant = product.variants?.edges[0]?.node

          if (
            !product.availableForSale ||
            !variant?.availableForSale ||
            (variant.quantityAvailable !== null &&
              variant.quantityAvailable !== undefined &&
              variant.quantityAvailable < 1)
          ) {
            unavailableItems.push(bagItem.title)
          }
        }
      })

      // If any items are unavailable, show error
      if (unavailableItems.length > 0) {
        setError({
          type: 'unavailable',
          message:
            unavailableItems.length === 1
              ? `${unavailableItems[0]} is no longer available`
              : `${unavailableItems.length} items are no longer available`,
          unavailableItems,
        })
        return
      }

      // All items available, proceed with cart creation
      // Convert bag items to cart line items with variant IDs
      const lines = await Promise.all(
        items.map(async (item) => {
          const product = data.products.find((p) => p?.id === item.id)
          const variantId =
            product?.__typename === 'Product'
              ? product.variants?.edges[0]?.node?.id
              : null

          if (!variantId) {
            throw new Error(`No variant found for ${item.title}`)
          }

          return {
            merchandiseId: variantId,
            quantity: 1,
          }
        }),
      )

      // Create the cart with Shopify
      createCartMutation.mutate({
        input: {
          lines,
        },
      })
    } catch (err) {
      console.error('Checkout validation error:', err)
      setError({
        type: 'unknown',
        message: 'An unexpected error occurred. Please try again.',
      })
    }
  }

  return {
    proceedToCheckout,
    isLoading: createCartMutation.isPending,
    error,
    clearError: () => setError(null),
  }
}
