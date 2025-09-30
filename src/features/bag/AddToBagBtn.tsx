import type { Product } from '@/types/products'

import { useState } from 'react'

import { toast } from 'sonner'

import { BagIcon } from '@/components/icons/BagIcon'
import { convertProductToBagItem, useBagStore } from '@/store/bag-store'

type AddToBagBtnProps = {
  type: 'solid' | 'minimal'
  product: Product
  disabled?: boolean
}

export default function AddToBagBtn({
  type,
  product,
  disabled = false,
}: AddToBagBtnProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Need to subscribe to items array to trigger re-renders
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const items = useBagStore.use.items()
  const addItem = useBagStore.use.addItem()
  const isItemInBag = useBagStore.use.isItemInBag()

  const isAlreadyInBag = isItemInBag(product.id)

  const classes =
    type === 'solid'
      ? `w-full rounded-lg px-6 py-2 shadow-2xs transition-all duration-200 active:scale-[99%] ${
          disabled || isAlreadyInBag
            ? 'bg-gray-400 cursor-default'
            : 'bg-sky-800 shadow-sky-900 hover:bg-sky-700 cursor-pointer'
        }`
      : `flex w-fit items-center gap-1 duration-100 ease-in outline-none ${
          disabled || isAlreadyInBag
            ? 'text-gray-400 cursor-default'
            : 'text-sky-800 hover:text-sky-700 cursor-pointer'
        }`

  const handleAddToBag = async () => {
    if (disabled || isAlreadyInBag || isLoading) return

    setIsLoading(true)

    try {
      const bagItem = convertProductToBagItem(product)
      const success = addItem(bagItem)

      if (success) {
        toast.success(`"${product.title}" added to bag`, {
          description: product.artist ? `by ${product.artist}` : undefined,
          duration: 3000,
        })
      } else {
        toast.info(`"${product.title}" is already in your bag`)
      }
    } catch (error) {
      console.error('Error adding item to bag:', error)
      toast.error('Failed to add item to bag. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getButtonText = () => {
    if (isLoading) return 'Adding...'
    if (isAlreadyInBag) return 'In bag'
    return 'Add to bag'
  }

  return (
    <button
      className={classes}
      onClick={handleAddToBag}
      disabled={disabled || isAlreadyInBag || isLoading}
      aria-label={`Add ${product.title} to shopping bag`}
    >
      {type === 'minimal' && (
        <BagIcon classes={`size-5 ${isLoading ? 'animate-pulse' : ''}`} />
      )}
      <span>{getButtonText()}</span>
    </button>
  )
}
