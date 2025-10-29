import { useEffect } from 'react'

import { useGetCartByIdQuery } from '@/queries/graphql/generated/react-query'
import { useBagStore } from '@/store/bag-store'

const EXPIRE_AFTER_MS = 60 * 60 * 1000 // 60 minutes

export function usePendingCheckoutWatcher() {
  const pendingCheckoutUrl = useBagStore.use.pendingCheckoutUrl()
  const pendingCheckoutCartId = useBagStore.use.pendingCheckoutCartId()
  const pendingCheckoutCreatedAt = useBagStore.use.pendingCheckoutCreatedAt()
  const clearPendingCheckout = useBagStore.use.clearPendingCheckout()

  const isExpired =
    pendingCheckoutCreatedAt !== null &&
    Date.now() - pendingCheckoutCreatedAt > EXPIRE_AFTER_MS

  const shouldQuery = Boolean(
    pendingCheckoutUrl && pendingCheckoutCartId && !isExpired,
  )

  const { data, error } = useGetCartByIdQuery(
    { id: pendingCheckoutCartId ?? '' },
    {
      enabled: shouldQuery,
      staleTime: 5 * 60 * 1000,
    },
  )

  useEffect(() => {
    if (!shouldQuery) {
      if (pendingCheckoutUrl && isExpired) {
        clearPendingCheckout()
      }
      return
    }

    if (error) {
      clearPendingCheckout()
      return
    }

    if (data?.cart === null) {
      clearPendingCheckout()
    }
  }, [
    shouldQuery,
    pendingCheckoutUrl,
    isExpired,
    data?.cart,
    error,
    clearPendingCheckout,
  ])
}
