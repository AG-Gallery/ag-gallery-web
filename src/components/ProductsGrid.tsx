import type { Artwork } from '@/types/products'

import { Link, useLocation } from '@tanstack/react-router'

import { BagIcon } from './icons/BagIcon'

type ProductsGridProps = {
  products: Artwork[]
}

export default function ProductsGrid({ products }: ProductsGridProps) {
  const pathname = useLocation({
    select: (location) => location.pathname,
  })

  return (
    <div className="featured-grid-container">
      <div className="featured-grid">
        {products.map((product) => {
          const href = `/artists/${product.artist.slug}`
          const isActive = pathname === href

          return (
            <div
              key={product.id}
              className="group animate-fade-in flex flex-col items-start"
            >
              <Link to="/artworks/$slug" params={{ slug: product.slug }}>
                <div className="flex aspect-[5/4] w-full flex-col items-center justify-center rounded border border-neutral-200/80 bg-neutral-50 p-2 transition-colors duration-100 ease-in select-none hover:bg-neutral-200/50 lg:p-4 2xl:p-6">
                  <img
                    src={product.previewImageUrl}
                    // ----------
                    // TODO: ALT TEXT
                    // ----------
                    alt={'GET ALT TEXT'}
                    width="1920"
                    height="1080"
                    className="size-full object-contain"
                  />
                </div>
              </Link>

              <div className="mt-4">
                <h3 className="hover:text-accent w-fit font-medium transition-colors duration-100 md:text-lg">
                  <Link
                    to={`/artworks/$slug`}
                    params={{ slug: product.slug }}
                    className="w-fit"
                  >
                    {product.title}
                  </Link>
                </h3>

                <Link
                  to={href}
                  params={{ slug: product.artist.slug }}
                  className={` ${!isActive && 'hover:text-accent'} w-fit text-sm tracking-wide transition-colors duration-100 md:text-base`}
                  disabled={isActive}
                >
                  {product.artist.name}
                </Link>
              </div>

              <div className="space-y-0.5 text-neutral-500">
                <p className="text-[0.8125rem] font-light tracking-wide md:font-normal">
                  {product.medium}
                </p>
                <p className="text-xs font-light tracking-tight select-none md:font-normal md:tracking-normal">
                  {product.dimensionsImperial}
                </p>
              </div>

              {/* <button className="mt-2 flex cursor-pointer gap-1 text-sm transition-colors duration-150 ease-in hover:text-sky-700 md:text-[0.9375rem]">
                <BagIcon classes="size-5" />
                Add to Bag
              </button> */}
            </div>
          )
        })}
      </div>
    </div>
  )
}
