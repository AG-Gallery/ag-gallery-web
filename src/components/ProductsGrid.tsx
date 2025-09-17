import type { FeaturedArt } from '@/types/products'

import { Link } from '@tanstack/react-router'

type ProductsGridProps = {
  products: FeaturedArt[]
}

export default function ProductsGrid({ products }: ProductsGridProps) {
  return (
    <div className="featured-grid-container">
      <div className="featured-grid">
        {products.map((product) => {
          return (
            <div key={product.id}>
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

              <div className="mt-5 flex flex-col">
                <div className="flex items-center justify-between">
                  <h3 className="hover:text-primary text-lg font-medium transition-colors duration-200">
                    <Link
                      to={`/artworks/$slug`}
                      params={{ slug: product.slug }}
                    >
                      {product.title}
                    </Link>
                  </h3>
                </div>
              </div>

              <Link
                to={`/artists/$slug`}
                params={{ slug: product.artist.slug }}
                className="hover:text-primary w-fit tracking-wide transition-colors duration-200"
              >
                {product.artist.name}
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// export default function ProductsGrid({ products }: ProductsGridProps) {
//   return (
//     products !== undefined && (
//       <div className="featured-grid-container">
//         <div className="featured-grid">
//           {products.map((product) => {
//             const mainImage = product.images[0]
//             const dimensions = product.dimensions?.match(/^(.*in )(.+)$/)

//             const artistSlug = slugifyName(product.artist)

//             return (
//               <div key={product.cursor}>
//                 <Link to={`/artworks/${product.handle}`}>
//                   <div className="flex aspect-[5/4] w-full flex-col items-center justify-center rounded border border-neutral-200/80 bg-neutral-50 p-2 transition-colors duration-150 ease-in select-none hover:bg-neutral-200/50 lg:p-4 2xl:p-6">
//                     <img
//                       src={mainImage.url}
//                       alt={mainImage.altText ?? ''}
//                       width={mainImage.width ?? '1920'}
//                       height={mainImage.height ?? '1080'}
//                       className="size-full object-contain"
//                     />
//                   </div>
//                 </Link>

//                 <div className="mt-5 flex flex-col">
//                   <div className="flex items-center justify-between">
//                     <h3 className="hover:text-primary text-lg font-medium transition-colors duration-200">
//                       <Link to={`/artworks/${product.handle}`}>
//                         {product.title}
//                       </Link>
//                     </h3>
//                     <div className="group relative pl-4 select-none">
//                       <span className="block text-sm font-normal text-neutral-500 transition-opacity duration-200 ease-in-out group-hover:opacity-0">
//                         {dimensions && dimensions[1]}
//                       </span>
//                       <span className="pointer-events-none absolute top-0 right-0 text-sm font-normal text-neutral-500 opacity-0 transition-opacity duration-200 ease-in-out group-hover:opacity-100">
//                         {dimensions && dimensions[2]}
//                       </span>
//                     </div>
//                   </div>

//                   <Link
//                     to={`/artists/${artistSlug}`}
//                     className="hover:text-primary w-fit tracking-wide transition-colors duration-200"
//                   >
//                     {product.artist}
//                   </Link>
//                   <span className="mt-0.5 text-sm font-light tracking-wide">
//                     {product.medium[0].label} {product.category}
//                   </span>
//                 </div>
//               </div>
//             )
//           })}
//         </div>
//       </div>
//     )
//   )
// }
