import { useEffect, useState } from 'react'

import { ensureClientId } from '@/lib/client-id'

export function useClientId() {
  const [clientId, setClientId] = useState<string | null>(null)

  useEffect(() => {
    const id = ensureClientId()
    if (id) {
      setClientId(id)
    }
  }, [])

  return clientId
}
