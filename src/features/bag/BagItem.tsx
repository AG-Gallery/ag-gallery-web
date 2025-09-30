import { useMemo } from 'react'

import type { BagItem as BagItemType } from '@/store/bag-store'

import { X } from 'lucide-react'

import { useBagStore } from '@/store/bag-store'

type BagItemProps = {
  item: BagItemType
}

export default function BagItem({ item }: BagItemProps) {
  const removeItem = useBagStore.use.removeItem()
  const { id, artist, currencyCode, imageAlt, imageUrl, price, title } = item

  const formattedPrice = useMemo(() => {
    const numericPrice = Number(price)
    const safePrice = Number.isFinite(numericPrice) ? numericPrice : 0

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(safePrice)
  }, [currencyCode, price])

  const handleRemove = () => {
    removeItem(id)
  }

  return (
    <div className="flex gap-4 rounded-lg border border-neutral-200 p-4">
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
        <img
          src={imageUrl}
          alt={imageAlt || title}
          className="object-cover"
          loading="lazy"
        />
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="line-clamp-2 font-medium">{title}</h3>

            <button
              onClick={handleRemove}
              className="p-0 text-neutral-400 transition-colors duration-150 hover:text-neutral-600"
              aria-label={`Remove ${title} from bag`}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {artist && <p className="text-sm text-neutral-600">by {artist}</p>}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span>{formattedPrice}</span>
        </div>
      </div>
    </div>
  )
}
