import type { Artwork } from '@/types/products'

import { Link, useLocation } from '@tanstack/react-router'

import { AddToBagIcon } from './icons/AddToBagIcon'

type ProductsGridProps = {
  artworks: Artwork[]
}

export default function ArtworksGrid({ artworks }: ProductsGridProps) {
  const pathname = useLocation({
    select: (location) => location.pathname,
  })

  const isArtworksRoute = pathname.startsWith('/artworks')

  return (
    <div className="featured-grid-container">
      <div className="featured-grid">
        {artworks.map((artwork, index) => {
          const href = `/artists/${artwork.artist.slug}`
          const isActive = pathname === href

          return (
            <div
              key={artwork.id}
              className="group animate-fade-in flex flex-col items-start"
            >
              <Link to="/artworks/$slug" params={{ slug: artwork.slug }}>
                <div className="flex aspect-[5/4] w-full flex-col items-center justify-center rounded border border-neutral-200/80 bg-neutral-50 p-2 transition-colors duration-100 ease-in select-none hover:bg-neutral-200/50 lg:p-4 2xl:p-6">
                  <img
                    src={artwork.previewImageUrl}
                    // ----------
                    // TODO: ALT TEXT
                    // ----------
                    alt={'GET ALT TEXT'}
                    width="1920"
                    height="1080"
                    loading={index <= 8 ? 'eager' : 'lazy'}
                    className="size-full object-contain"
                  />
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
                  className={` ${!isActive && 'hover:text-accent'} w-fit text-sm tracking-wide transition-colors duration-100 md:text-base`}
                  disabled={isActive}
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
        })}
      </div>
    </div>
  )
}
