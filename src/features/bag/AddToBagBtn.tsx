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

  const items = useBagStore.use.items()
  const addItem = useBagStore.use.addItem()

  const isAlreadyInBag = items.some((bagItem) => bagItem.id === product.id)
  const isDisabled = disabled || isAlreadyInBag || isLoading

  const isSolid = type === 'solid'
  const baseClasses = isSolid
    ? 'w-full rounded-lg px-6 py-2 shadow-2xs transition-all duration-200 active:scale-[99%]'
    : 'flex w-fit items-center gap-1 duration-100 ease-in outline-none'
  const enabledClasses = isSolid
    ? 'bg-sky-800 shadow-sky-900 hover:bg-sky-700 cursor-pointer'
    : 'text-sky-800 hover:text-sky-700 cursor-pointer'
  const disabledClasses = isSolid
    ? 'bg-gray-400 cursor-default'
    : 'text-gray-400 cursor-default'
  const classes = `${baseClasses} ${isDisabled ? disabledClasses : enabledClasses}`

  const handleAddToBag = () => {
    if (isDisabled) return

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

  let buttonText = 'Add to bag'
  if (isLoading) {
    buttonText = 'Adding...'
  } else if (isAlreadyInBag) {
    buttonText = 'In bag'
  }

  const iconClasses = isLoading ? 'size-5 animate-pulse' : 'size-5'

  return (
    <button
      className={classes}
      onClick={handleAddToBag}
      disabled={isDisabled}
      aria-label={`Add ${product.title} to shopping bag`}
      type="button"
    >
      {type === 'minimal' && <BagIcon classes={iconClasses} />}
      <span>{buttonText}</span>
    </button>
  )
}
