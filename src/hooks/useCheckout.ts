import { useState } from 'react'

import { useMutation, useQuery } from '@tanstack/react-query'

import { useBagStore } from '@/store/bag-store'
import {
  useCreateCartMutation,
  useGetProductsForCheckoutQuery,
} from '@/queries/graphql/generated/react-query'

type CheckoutError = {
  type: 'unavailable' | 'network' | 'validation' | 'unknown'
  message: string
  unavailableItems?: string[]
}

export function useCheckout() {
  const [error, setError] = useState<CheckoutError | null>(null)
  const items = useBagStore.use.items()
  const clearBag = useBagStore.use.clearBag()

  // Validate inventory before checkout
  const { data: productsData, refetch: refetchProducts } =
    useGetProductsForCheckoutQuery(
      {
        ids: items.map((item) => item.id),
      },
      {
        enabled: false, // Only run when we manually trigger
      },
    )

  const createCartMutation = useCreateCartMutation({
    onSuccess: (data) => {
      if (data.cartCreate?.cart?.checkoutUrl) {
        // Clear bag on successful checkout creation
        clearBag()
        // Open Shopify checkout in new tab
        window.open(data.cartCreate.cart.checkoutUrl, '_blank', 'noopener,noreferrer')
      } else if (data.cartCreate?.userErrors && data.cartCreate.userErrors.length > 0) {
        const errorMessages = data.cartCreate.userErrors
          .map((err) => err.message)
          .join(', ')
        setError({
          type: 'validation',
          message: errorMessages,
        })
      }
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
