import type { Product } from '@/types/products'

import { Link } from '@tanstack/react-router'

import { formatNumber, slugifyName } from '@/lib/utils'

interface ProductsGridProps {
  products: Product[] | undefined
}

export default function ProductsGrid({ products }: ProductsGridProps) {
  return (
    products !== undefined && (
      <div className="animate-fade-in mb-8 pb-4">
        <div className="grid gap-3 lg:grid-cols-3 lg:gap-4 2xl:gap-5">
          {products.map((product) => {
            const mainImage = product.images[0]
            const price = formatNumber(product.price)
            const dimensions = product.dimensions?.match(/^(.*in )(.+)$/)

            const artistSlug = slugifyName(product.artist)

            return (
              <div key={product.cursor}>
                <Link to={`/artworks/${product.handle}`}>
                  <div className="flex aspect-[5/4] w-full flex-col items-center justify-center rounded bg-neutral-100 p-6 shadow-xs inset-shadow-sm transition-colors duration-150 ease-in select-none hover:bg-neutral-200/50">
                    <img
                      src={mainImage.url}
                      alt={mainImage.altText ?? ''}
                      width={mainImage.width ?? '1920'}
                      height={mainImage.height ?? '1080'}
                      className="size-full object-contain"
                    />
                  </div>
                </Link>

                <div className="mt-5 flex flex-col">
                  <div className="flex items-center justify-between">
                    <h3 className="hover:text-primary text-lg transition-colors duration-200">
                      <Link to={`/artworks/${product.handle}`}>
                        {product.title}
                      </Link>
                    </h3>
                    <span className="text-sm font-normal">
                      {dimensions && dimensions[2]}
                    </span>
                  </div>

                  <Link
                    to={`/artists/${artistSlug}`}
                    className="hover:text-primary w-fit font-normal tracking-wide transition-colors duration-200"
                  >
                    {product.artist}
                  </Link>
                  <span className="mt-0.5 text-[15px] font-normal tracking-wide">
                    {product.type} on {product.medium}
                  </span>

                  <div className="my-2 flex items-center justify-start gap-1 font-normal">
                    <span>{price}</span>
                    <span>{product.currencyCode}</span>
                  </div>
                </div>

                <button>Add to bag</button>
              </div>
            )
          })}
        </div>
      </div>
    )
  )
}
