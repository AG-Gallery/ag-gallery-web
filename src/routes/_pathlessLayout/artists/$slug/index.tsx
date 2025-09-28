import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'

import { PortableText } from '@portabletext/react'

import ProductsGrid from '@/components/ProductsGrid'
import EventsGrid from '@/features/events/EventsGrid'
import { getArtist } from '@/queries/sanity/artists'
import {
  getExhibitionsWithArtist,
  getFairsWithArtist,
} from '@/queries/sanity/events'
import { getProductsByArtist } from '@/queries/sanity/products'

function createArtistQuery(slug: string) {
  return queryOptions({
    queryKey: [`artist-${slug}`],
    queryFn: () => getArtist(slug),
  })
}
function createProductsQuery(slug: string) {
  return queryOptions({
    queryKey: [`${slug}-products-limited`],
    queryFn: () => getProductsByArtist(slug, 0, 11),
  })
}
function createExhibitionsQuery(slug: string) {
  return queryOptions({
    queryKey: [`${slug}-exhibitions`],
    queryFn: () => getExhibitionsWithArtist(slug),
  })
}
function createFairsQuery(slug: string) {
  return queryOptions({
    queryKey: [`${slug}-fairs`],
    queryFn: () => getFairsWithArtist(slug),
  })
}

export const Route = createFileRoute('/_pathlessLayout/artists/$slug/')({
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(createArtistQuery(params.slug)),
      context.queryClient.ensureQueryData(createProductsQuery(params.slug)),
      context.queryClient.ensureQueryData(createExhibitionsQuery(params.slug)),
      context.queryClient.ensureQueryData(createFairsQuery(params.slug)),
    ]).then(() => undefined),
  component: RouteComponent,
})

function RouteComponent() {
  const { slug } = Route.useParams()
  const artistQuery = createArtistQuery(slug)
  const productQuery = createProductsQuery(slug)
  const exhibitionsQuery = createExhibitionsQuery(slug)
  const fairsQuery = createFairsQuery(slug)

  const {
    data: artist,
    isLoading: artistIsLoading,
    error: artistError,
  } = useSuspenseQuery(artistQuery)
  const {
    data: products,
    isLoading: productIsLoading,
    error: productError,
  } = useSuspenseQuery(productQuery)
  const {
    data: exhibitions,
    isLoading: exhibitionIsLoading,
    error: exhibitionError,
  } = useSuspenseQuery(exhibitionsQuery)
  const {
    data: fairs,
    isLoading: fairIsLoading,
    error: fairError,
  } = useSuspenseQuery(fairsQuery)

  const hasProducts = Array.isArray(products) && products.length > 0
  const hasExhibitions = Array.isArray(exhibitions) && exhibitions.length > 0
  const hasFairs = Array.isArray(fairs) && fairs.length > 0

  return (
    <main className="page-main">
      <h2 className="page-headline">{artist.name}</h2>

      <section className="animate-fade-in my-5 items-start justify-center lg:my-14 lg:flex">
        <div className="group relative">
          <img
            src={artist.artistImage}
            alt={`A portrait image of the artist ${artist.name}`}
            width={1920}
            height={1080}
            className="animate-fade-in z-10 aspect-square self-start object-cover grayscale-100 lg:max-w-[400px] xl:max-w-[500px] 2xl:max-w-[600px]"
          />
          <img
            src={artist.backgroundImage}
            alt={`A portrait image of the artist ${artist.name}`}
            width={1920}
            height={1080}
            className="absolute top-0 right-0 left-0 -z-10 aspect-square object-cover opacity-45 transition-all duration-100 ease-in group-hover:opacity-85"
          />
        </div>

        <article className="my-6 flex flex-col items-start gap-2 self-start align-top md:my-8 md:flex-row md:gap-4 lg:my-0 lg:ml-8 lg:w-1/2 xl:ml-16 xl:w-[600px] xl:gap-8 2xl:ml-24 2xl:w-[700px]">
          <h2 className="mb-3 text-xl font-medium tracking-wide lg:mb-0 lg:text-base">
            Biography
          </h2>

          <div className="w-full tracking-wide text-pretty">
            <PortableText
              value={artist.bio}
              components={{
                block: {
                  normal: ({ children }) => <p className="mb-4">{children}</p>,
                },
              }}
            />
          </div>
        </article>
      </section>

      {hasProducts && (
        <>
          <hr className="w-full bg-neutral-400" />
          <section className="my-8 lg:my-10">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-lora text-xl font-medium md:text-2xl md:tracking-tight">
                Selected Works
              </h2>
              <Link
                to="/artists/$slug/artworks"
                params={{ slug: artist.slug }}
                className="hover:text-foreground text-sm text-neutral-500 transition-colors duration-200"
              >
                View all
              </Link>
            </div>

            <ProductsGrid products={products} />
          </section>
        </>
      )}

      {hasExhibitions && (
        <>
          <hr className="w-full bg-neutral-400" />
          <section className="my-6 lg:my-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-lora text-xl font-medium md:text-2xl md:tracking-tight">
                Exhibitions
              </h2>
            </div>

            <EventsGrid events={exhibitions} />
          </section>
        </>
      )}

      {hasFairs && (
        <>
          <hr className="w-full bg-neutral-400" />
          <section className="my-6 lg:my-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-lora text-xl font-medium md:text-2xl md:tracking-tight">
                Fairs
              </h2>
            </div>

            <EventsGrid events={fairs} />
          </section>
        </>
      )}
    </main>
  )
}
