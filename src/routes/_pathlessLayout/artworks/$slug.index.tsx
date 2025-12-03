import type {
  Public_GetProductByHandleQuery,
  Public_GetProductByHandleQueryVariables,
} from '@/queries/graphql/generated/react-query'
import type { Artwork } from '@/types/products'

import { useState } from 'react'

import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'

import Carousel from '@/components/Carousel'
import { ShopPayIcon } from '@/components/icons/PaymentIcons'
import ZoomedCarousel from '@/components/ZoomedCarousel'
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

function generateSeoDescription(artwork: Artwork) {
  const artistName = artwork.artist.name
  const descriptionSegments = [
    `Artwork by ${artistName}`,
    `Medium: ${artwork.medium}`,
    `Dimensions: ${artwork.dimensionsImperial}`,
  ]

  return `${descriptionSegments.join(' • ')}. Available through AG Gallery.`
}

export const Route = createFileRoute('/_pathlessLayout/artworks/$slug/')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(createProductQuery(params.slug)),
  head: ({ loaderData, params }) => {
    const product = loaderData?.productByHandle
    const normalized = product ? formatProduct(product) : undefined
    const artwork = normalized ? productToArtwork(normalized) : undefined

    const description = artwork
      ? generateSeoDescription(artwork)
      : 'Discover original artworks available through AG Gallery in Glendale, California.'

    return {
      meta: [
        {
          title: artwork?.title ?? params.slug,
          description,
          image: normalized?.images[0]?.url ?? null,
          type: 'product',
        },
      ],
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { slug } = Route.useParams()
  const { data } = useSuspenseQuery(createProductQuery(slug))

  const product = data.productByHandle
  const normalized = product ? formatProduct(product) : undefined
  const artwork = normalized ? productToArtwork(normalized) : undefined
  const images = normalized?.images.map((i) => i.url) ?? []
  const priceDisplay = normalized
    ? formatMoney(normalized.currencyCode, normalized.price)
    : ''

  const [zoomOpen, setZoomOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const handleImageClick = (index: number) => {
    setActiveIndex(index)
    setZoomOpen(true)
  }

  return (
    <main className="page-main">
      <div className="animate-fade-in my-5 items-start justify-center lg:my-14 lg:flex">
        <Carousel
          images={images}
          enableZoom={images.length > 0}
          onImageClick={handleImageClick}
        />

        <div className="mx-auto my-8 max-w-[700px] align-top text-nowrap lg:my-0 lg:ml-8 lg:w-1/2 xl:ml-16 xl:w-[600px] 2xl:ml-24 2xl:w-[700px]">
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
            {artwork?.style && (
              <p className="font-medium">
                Style:
                <Link
                  to="/artworks"
                  search={{ styles: artwork.style }}
                  className="hover:text-accent font-normal transition-colors duration-200"
                >
                  {' '}
                  {artwork.style}
                </Link>
              </p>
            )}

            {artwork?.theme && (
              <p className="font-medium">
                Theme:
                <Link
                  to="/artworks"
                  search={{ themes: artwork.theme }}
                  className="hover:text-accent font-normal transition-colors duration-200"
                >
                  {' '}
                  {artwork.theme}
                </Link>
              </p>
            )}

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

          <section className="mt-8 flex flex-col items-center gap-6 md:flex-row">
            {artwork && <AddToBagBtn type="solid" product={artwork} />}
            <p className="text-sm">
              Pay in installments <br /> with <ShopPayIcon />
            </p>
          </section>
        </div>
      </div>

      <ZoomedCarousel
        images={images}
        initialIndex={activeIndex}
        open={zoomOpen}
        title={artwork?.title}
        onOpenChange={setZoomOpen}
      />
    </main>
  )
}
