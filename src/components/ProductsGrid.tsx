import type { FeaturedArt } from '@/types/products'

import { Link, useLocation } from '@tanstack/react-router'

type ProductsGridProps = {
  products: FeaturedArt[]
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
            <div key={product.id} className="group flex flex-col">
              <Link to="/artworks/$slug" params={{ slug: product.slug }}>
                <div className="flex aspect-[5/4] w-full flex-col items-center justify-center rounded border border-neutral-200/80 bg-neutral-50 p-2 transition-colors duration-150 ease-in select-none hover:bg-neutral-200/50 lg:p-4 2xl:p-6">
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
                <h3 className="hover:text-accent w-fit font-medium transition-colors duration-200 md:text-lg">
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
                  className={` ${!isActive && 'hover:text-accent'} 'w-fit md:text-base' text-sm tracking-wide transition-colors duration-200`}
                  disabled={isActive}
                >
                  {product.artist.name}
                </Link>
              </div>

              <div className="-mt-1 text-neutral-500">
                <span className="text-[0.8125rem] font-light tracking-wide md:font-normal">
                  {product.medium}
                </span>
                <div className="relative text-xs font-light tracking-tight select-none md:font-normal md:tracking-normal">
                  <span className="block transition-opacity duration-200 ease-in-out group-hover:opacity-0">
                    {product.dimensionsImperial}
                  </span>
                  <span className="pointer-events-none absolute top-0 opacity-0 transition-opacity duration-200 ease-in-out group-hover:opacity-100">
                    {product.dimensionsMetric}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
