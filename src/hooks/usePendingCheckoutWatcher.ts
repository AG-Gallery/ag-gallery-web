import { useEffect } from 'react'

import { useClientId } from '@/hooks/useClientId'
import { fetchCheckoutStatus } from '@/lib/checkout-session'
import { useBagStore } from '@/store/bag-store'

const EXPIRE_AFTER_MS = 60 * 60 * 1000 // 60 minutes
const STATUS_POLL_INTERVAL = 15 * 1000 // 15 seconds

export function usePendingCheckoutWatcher() {
  const pendingCheckoutUrl = useBagStore.use.pendingCheckoutUrl()
  const pendingCheckoutCreatedAt = useBagStore.use.pendingCheckoutCreatedAt()
  const pendingCheckoutClientId = useBagStore.use.pendingCheckoutClientId()
  const clearPendingCheckout = useBagStore.use.clearPendingCheckout()
  const clearBag = useBagStore.use.clearBag()
  const clientId = useClientId()
  const statusClientId = pendingCheckoutClientId ?? clientId

  const isExpired =
    pendingCheckoutCreatedAt !== null &&
    Date.now() - pendingCheckoutCreatedAt > EXPIRE_AFTER_MS

  const shouldQuery = Boolean(pendingCheckoutUrl && !isExpired && statusClientId)

  useEffect(() => {
    if (pendingCheckoutUrl && isExpired) {
      clearPendingCheckout()
    }
  }, [pendingCheckoutUrl, isExpired, clearPendingCheckout])

  useEffect(() => {
    if (!shouldQuery || !statusClientId) return

    let cancelled = false

    async function checkStatus() {
      const status = await fetchCheckoutStatus(statusClientId)
      if (cancelled || !status) return

      if (status.status === 'completed') {
        clearBag()
        clearPendingCheckout()
      }
    }

    void checkStatus()
    const interval = window.setInterval(() => {
      void checkStatus()
    }, STATUS_POLL_INTERVAL)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [shouldQuery, statusClientId, clearPendingCheckout, clearBag])
}
