import { useEffect, useMemo, useRef, useState } from 'react'

import { BagIcon } from '@/components/icons/BagIcon'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { useCheckout } from '@/hooks/useCheckout'
import { usePendingCheckoutWatcher } from '@/hooks/usePendingCheckoutWatcher'
import { useBagStore } from '@/store/bag-store'

import BagItem from './BagItem'

type BagState = 'right' | 'bottom'

export default function Bag() {
  const [drawerDirection, setDrawerDirection] = useState<BagState>('right')
  const triggerButtonRef = useRef<HTMLButtonElement>(null)

  usePendingCheckoutWatcher()

  const items = useBagStore.use.items()
  const getItemCount = useBagStore.use.getItemCount()
  const getTotalPriceFormatted = useBagStore.use.getTotalPriceFormatted()
  const clearBag = useBagStore.use.clearBag()
  const pendingCheckoutUrl = useBagStore.use.pendingCheckoutUrl()
  const pendingCheckoutCreatedAt = useBagStore.use.pendingCheckoutCreatedAt()
  const clearPendingCheckout = useBagStore.use.clearPendingCheckout()

  const {
    proceedToCheckout,
    isLoading: isCheckoutLoading,
    error: checkoutError,
    clearError,
  } = useCheckout()

  const itemCount = getItemCount()
  const totalPrice = getTotalPriceFormatted()

  const handleTriggerClick = () => {
    // Blur the trigger button immediately to prevent aria-hidden conflict
    // when the drawer applies aria-hidden to background elements
    triggerButtonRef.current?.blur()
  }

  useEffect(() => {
    useBagStore.persist.rehydrate()
  }, [])

  useEffect(() => {
    const checkScreenSize = () => {
      setDrawerDirection(window.innerWidth < 768 ? 'bottom' : 'right')
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const isSideDrawer = drawerDirection === 'right'
  const drawerContentClassName = isSideDrawer
    ? 'ml-auto h-full w-full max-w-md'
    : ''
  const innerContainerClassName = `mx-auto size-full ${isSideDrawer ? 'max-w-none' : 'max-w-md'}`
  const hasItems = itemCount > 0
  const hasPendingCheckout = Boolean(pendingCheckoutUrl)
  const bagBadgeLabel = itemCount > 9 ? '9+' : itemCount

  const checkoutButtonLabel = hasPendingCheckout
    ? 'Checkout in progress'
    : 'Checkout'

  const handleResumeCheckout = () => {
    if (!pendingCheckoutUrl) return
    window.open(pendingCheckoutUrl, '_blank', 'noopener,noreferrer')
  }

  const handleClearBag = () => {
    clearBag()
  }

  const pendingCheckoutTimestamp = useMemo(() => {
    if (!pendingCheckoutCreatedAt) return 'Created just now.'
    return `Created ${new Date(pendingCheckoutCreatedAt).toLocaleString()}`
  }, [pendingCheckoutCreatedAt])

  const bagContent = hasItems ? (
    <div className="space-y-4">
      {items.map((item) => (
        <BagItem key={item.id} item={item} />
      ))}
    </div>
  ) : (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <BagIcon classes="size-12 text-neutral-300 mb-4" />
      <h3 className="mb-2 text-lg font-medium">Your bag is empty</h3>
      <p className="mb-6 text-neutral-500">
        Discover unique artworks and add pieces to your collection.
      </p>
      <DrawerClose asChild>
        <button
          className="h-9 cursor-pointer rounded-md border border-neutral-200 px-4 py-2 text-sm transition-all hover:bg-neutral-100"
          type="button"
        >
          Continue Browsing
        </button>
      </DrawerClose>
    </div>
  )

  const bagFooter = !hasItems ? null : (
    <DrawerFooter className="border-t border-neutral-200">
      {hasPendingCheckout && (
        <div className="mb-4 rounded-lg border border-sky-200 bg-sky-50 p-4">
          <p className="text-sm text-sky-900">
            You have a checkout in progress.
          </p>
          <p className="mt-1 text-xs text-sky-800">
            {pendingCheckoutTimestamp}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={handleResumeCheckout}
              variant="secondary"
              className="hover:transparent cursor-pointer border border-sky-700 bg-sky-50 text-sky-800 hover:border-sky-600 hover:bg-sky-100 hover:text-sky-700"
            >
              Resume checkout
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-sky-800 hover:bg-sky-100 hover:text-sky-900"
              onClick={clearPendingCheckout}
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}
      {checkoutError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-800">{checkoutError.message}</p>
          {checkoutError.unavailableItems &&
            checkoutError.unavailableItems.length > 0 && (
              <ul className="mt-2 text-xs text-red-700">
                {checkoutError.unavailableItems.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            )}
          <button
            onClick={clearError}
            className="mt-2 text-xs text-red-600 underline hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}
      <div className="mb-4 flex items-center justify-between text-lg font-semibold">
        <span>Subtotal</span>
        <span className="font-medium">{totalPrice}</span>
      </div>
      <Button
        className="rounded-md border border-sky-800 bg-sky-700 font-medium text-white hover:border-sky-700 hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={proceedToCheckout}
        disabled={isCheckoutLoading || hasPendingCheckout}
      >
        {isCheckoutLoading ? 'Processing...' : checkoutButtonLabel}
      </Button>
      <DrawerClose asChild>
        <Button variant="outline" type="button" disabled={isCheckoutLoading}>
          Continue Browsing
        </Button>
      </DrawerClose>
      <DrawerClose asChild>
        <Button
          variant="ghost"
          type="button"
          className="text-neutral-600 hover:bg-transparent hover:text-neutral-900"
          disabled={isCheckoutLoading}
          onClick={handleClearBag}
        >
          Clear bag
        </Button>
      </DrawerClose>
    </DrawerFooter>
  )

  return (
    <Drawer direction={drawerDirection} autoFocus={true}>
      <DrawerTrigger asChild>
        <button
          ref={triggerButtonRef}
          onClick={handleTriggerClick}
          className="relative cursor-pointer p-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isCheckoutLoading}
          type="button"
        >
          <BagIcon classes="size-5" />
          {hasItems && (
            <span className="absolute -top-0.5 -right-1.5 flex size-[18px] items-center justify-center rounded-full bg-black text-xs font-medium text-white">
              {bagBadgeLabel}
            </span>
          )}
        </button>
      </DrawerTrigger>

      <DrawerContent className={drawerContentClassName}>
        <div className={innerContainerClassName}>
          <DrawerHeader className="flex flex-row items-center justify-between">
            <div>
              <DrawerTitle className="inline-flex h-10 w-full items-center">
                {hasItems ? (
                  <span className="inline-flex gap-2">
                    Bag <span>{itemCount}</span>
                  </span>
                ) : (
                  <span>Bag</span>
                )}
              </DrawerTitle>
              <DrawerDescription className="sr-only">
                View the artwork in your bag.
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" className="text-neutral-600">
                Close
              </Button>
            </DrawerClose>
          </DrawerHeader>

          {/*
            Store is low volume so may be unnecessary

            <div className="flex justify-end px-2">
              <button
                onClick={clearBag}
                className="mr-4 text-sm text-neutral-500 hover:text-neutral-700"
                disabled={hasItems === false || isCheckoutLoading}
                type="button"
              >
                Clear all
              </button>
            </div>
          */}

          <div className="flex-1 overflow-y-auto p-4 pt-2">{bagContent}</div>

          {bagFooter}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
