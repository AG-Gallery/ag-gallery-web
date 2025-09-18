import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'

import { PortableText } from '@portabletext/react'

import ProductsGrid from '@/components/ProductsGrid'
import EventsGrid from '@/features/events/EventsGrid'
import { getArtist } from '@/queries/sanity/artists'
import { getProductsByArtist } from '@/queries/sanity/products'

function createArtistQuery(slug: string) {
  return queryOptions({
    queryKey: [`artist-${slug}`],
    queryFn: () => getArtist(slug),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

function createProductsQuery(slug: string) {
  return queryOptions({
    queryKey: [`artist-${slug}-products`],
    queryFn: () => getProductsByArtist(slug),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const Route = createFileRoute('/artists/_layout/$slug/')({
  loader: ({ context, params }) => {
    const artistQuery = createArtistQuery(params.slug)
    const artistResult = context.queryClient.ensureQueryData(artistQuery)
    const productQuery = createProductsQuery(params.slug)
    const productResult = context.queryClient.ensureQueryData(productQuery)
    return { artistResult, productResult }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { slug } = Route.useParams()
  const artistQuery = createArtistQuery(slug)
  const productQuery = createProductsQuery(slug)

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

  return (
    <main className="page-main">
      <h2 className="page-headline">{artist.name}</h2>

      <section className="animate-fade-in my-5 items-center justify-center lg:my-14 lg:flex">
        <img
          src={artist.imageUrl}
          alt=""
          width="1920"
          height="1080"
          className="animate-fade-in aspect-square self-start object-cover grayscale-100 lg:max-w-[400px] xl:max-w-[500px]"
        />

        <article className="my-8 flex items-start gap-4 align-top lg:my-0 lg:ml-8 lg:w-1/2 xl:ml-16 xl:w-[600px] xl:gap-8 2xl:ml-24 2xl:w-[700px]">
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

      <hr className="bg-foreground w-full" />

      <section className="my-8 lg:my-10">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl">Selected Works</h2>
          <Link
            to="/"
            className="hover:text-foreground text-sm text-neutral-500 transition-colors duration-200"
          >
            View all
          </Link>
        </div>

        <ProductsGrid products={products} />
      </section>

      <hr className="bg-foreground w-full" />

      <section className="my-8 lg:my-10">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl">Exhibitions</h2>
          <Link
            to="/"
            className="hover:text-foreground text-sm text-neutral-500 transition-colors duration-200"
          >
            View all
          </Link>
        </div>

        {/*<EventsGrid events={} />*/}
      </section>
    </main>
  )
}
