import type {
  Public_GetProductByHandleQuery,
  Public_GetProductByHandleQueryVariables,
} from '@/queries/graphql/generated/react-query'

import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'

import Carousel from '@/components/Carousel'
import AddToBagBtn from '@/features/bag/AddToBagBtn'
import {
  formatMoney,
  formatProduct,
  productToArtwork,
} from '@/lib/normalizers/products'
import { fetcher } from '@/queries/graphql/fetcher'
import { Public_GetProductByHandleDocument } from '@/queries/graphql/generated/react-query'

function createProductQuery(handle: string) {
  return queryOptions({
    queryKey: ['product-by-handle', handle],
    queryFn: fetcher<
      Public_GetProductByHandleQuery,
      Public_GetProductByHandleQueryVariables
    >(Public_GetProductByHandleDocument, { handle, imagesFirst: 6 }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const Route = createFileRoute('/_pathlessLayout/artworks/$slug/')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(createProductQuery(params.slug)),
  component: RouteComponent,
})

function RouteComponent() {
  const { slug } = Route.useParams()
  const queryOpts = createProductQuery(slug)
  const { data } = useSuspenseQuery(queryOpts)

  const p = data.productByHandle
  const normalized = p ? formatProduct(p) : undefined
  const artwork = normalized ? productToArtwork(normalized) : undefined
  const images = normalized?.images.map((i) => i.url) ?? []
  const priceDisplay = normalized
    ? formatMoney(normalized.currencyCode, normalized.price)
    : ''

  return (
    <main className="page-main">
      <div className="animate-fade-in my-5 items-start justify-center lg:my-14 lg:flex">
        <Carousel images={images} />

        <div className="my-8 align-top text-nowrap lg:my-0 lg:ml-8 lg:w-1/2 xl:ml-16 xl:w-[600px] 2xl:ml-24 2xl:w-[700px]">
          <section className="space-y-1">
            <h2 className="font-lora text-xl font-medium text-wrap md:text-[1.625rem]">
              {artwork?.title}
            </h2>
            <p className="flex gap-1 text-lg md:text-xl">
              by
              <Link
                to={'/artists/$slug'}
                params={{ slug: artwork?.artist.slug ?? '' }}
                className="hover:text-accent transition-colors duration-200 ease-in"
              >
                {artwork?.artist.name}
              </Link>
            </p>
          </section>

          {priceDisplay && (
            <p className="mt-4 text-lg md:text-xl">{priceDisplay}</p>
          )}

          <article className="mt-5 w-full leading-tight text-pretty">
            <div
              dangerouslySetInnerHTML={{
                __html: normalized?.descriptionHtml ?? '',
              }}
            />
          </article>

          <section className="mt-8 space-y-1 tracking-wide">
            <p className="font-medium">
              Style: <span className="font-normal">{artwork?.style}</span>
            </p>

            <p className="font-medium">
              Medium: <span className="font-normal">{artwork?.medium}</span>
            </p>

            <p className="font-medium">
              Dimensions:{' '}
              <span className="font-normal">{artwork?.dimensionsImperial}</span>
              <span className="font-light"> | </span>
              <span className="font-normal">{artwork?.dimensionsMetric}</span>
            </p>
          </section>

          <section className="mt-8">
            {artwork && <AddToBagBtn type="solid" product={artwork} />}
            {/* <button className="w-full cursor-pointer rounded-full bg-neutral-900 px-6 py-3 font-medium text-white transition-colors duration-300 ease-in md:w-fit md:px-12">
              Add to bag
            </button> */}
          </section>
        </div>
      </div>
    </main>
  )
}
