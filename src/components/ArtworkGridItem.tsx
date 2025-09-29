import type { Artwork } from '@/types/products'

import { useEffect, useRef, useState } from 'react'

import { Link } from '@tanstack/react-router'

import { cn } from '@/lib/utils'

import { AddToBagIcon } from './icons/AddToBagIcon'
import { Skeleton } from './ui/skeleton'

type ArtworkGridItemProps = {
  artwork: Artwork
  index: number
  isArtworksRoute: boolean
  isArtistLinkActive: boolean
}

export function ArtworkGridItem({
  artwork,
  index,
  isArtworksRoute,
  isArtistLinkActive,
}: ArtworkGridItemProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const imageRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    if (imageRef.current?.complete) {
      setIsImageLoaded(true)
    }
  }, [])

  const href = `/artists/${artwork.artist.slug}`

  const handleImageReady = () => {
    setIsImageLoaded(true)
  }

  return (
    <div className="group animate-fade-in flex flex-col items-start">
      <Link
        to="/artworks/$slug"
        params={{ slug: artwork.slug }}
        className="block w-full"
      >
        <div className="relative flex aspect-[5/4] w-full items-center justify-center overflow-hidden rounded border border-neutral-200/80 bg-neutral-50 p-2 transition-colors duration-100 ease-in select-none hover:bg-neutral-200/50 lg:p-5">
          <Skeleton
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-2 rounded bg-neutral-200/70 transition-opacity duration-200 lg:inset-4 2xl:inset-6',
              isImageLoaded && 'pointer-events-none animate-none opacity-0',
            )}
          />
          <div className="flex h-full w-full items-center justify-center">
            <img
              ref={imageRef}
              src={artwork.previewImageUrl}
              // ----------
              // TODO: ALT TEXT
              // ----------
              alt={'GET ALT TEXT'}
              width="1920"
              height="1080"
              loading={index <= 8 ? 'eager' : 'lazy'}
              onLoad={handleImageReady}
              onError={handleImageReady}
              className={cn(
                'max-h-full max-w-full object-contain transition-opacity duration-200',
                isImageLoaded ? 'opacity-100' : 'opacity-0',
              )}
            />
          </div>
        </div>
      </Link>

      <div className="mt-4">
        <h3 className="hover:text-accent w-fit font-medium transition-colors duration-100 md:text-lg">
          <Link
            to={`/artworks/$slug`}
            params={{ slug: artwork.slug }}
            className="w-fit"
          >
            {artwork.title}
          </Link>
        </h3>

        <Link
          to={href}
          params={{ slug: artwork.artist.slug }}
          className={cn(
            'w-fit text-sm tracking-wide transition-colors duration-100 md:text-base',
            !isArtistLinkActive && 'hover:text-accent',
          )}
          disabled={isArtistLinkActive}
        >
          {artwork.artist.name}
        </Link>
      </div>

      <div className="flex w-full items-center justify-between space-y-0.5 text-neutral-500">
        <div>
          <p className="text-[0.8125rem] font-light tracking-wide md:font-normal">
            {artwork.medium}
          </p>
          <p className="text-xs font-light tracking-tight select-none md:font-normal md:tracking-normal">
            {artwork.dimensionsImperial}
          </p>
        </div>

        {isArtworksRoute && (
          <AddToBagIcon className="size-8 cursor-pointer text-black transition-all ease-in-out active:scale-95" />
        )}
      </div>
    </div>
  )
}
