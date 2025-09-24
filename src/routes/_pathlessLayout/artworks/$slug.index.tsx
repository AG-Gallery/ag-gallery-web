import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'

import { PortableText } from '@portabletext/react'

import Carousel from '@/components/Carousel'
import { getProduct } from '@/queries/sanity/products'

function createArtworkQuery(slug: string) {
  const artworkQuery = queryOptions({
    queryKey: ['artwork', slug],
    queryFn: () => getProduct(slug),
  })

  return artworkQuery
}

export const Route = createFileRoute('/_pathlessLayout/artworks/$slug/')({
  loader: ({ context, params }) => {
    const queryOpts = createArtworkQuery(params.slug)
    const queryResult = context.queryClient.ensureQueryData(queryOpts)
    return { queryResult }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { slug } = Route.useParams()
  const queryOpts = createArtworkQuery(slug)

  const { data: artwork, isLoading, error } = useSuspenseQuery(queryOpts)

  // TODO: Update query to get product details from shopify
  const images = [artwork.previewImageUrl, artwork.previewImageUrl]

  return (
    <main className="page-main">
      <div className="animate-fade-in my-5 items-start justify-center lg:my-14 lg:flex">
        <Carousel images={images} />

        <div className="my-8 align-top text-nowrap lg:my-0 lg:ml-8 lg:w-1/2 xl:ml-16 xl:w-[600px] 2xl:ml-24 2xl:w-[700px]">
          <section className="space-y-1">
            <h2 className="font-lora text-xl font-medium md:text-[1.625rem]">
              {artwork.title}
            </h2>
            <p className="flex gap-1 text-lg md:text-xl">
              by
              <Link
                to={'/artists/$slug'}
                params={{ slug: artwork.artist.slug }}
                className="hover:text-accent transition-colors duration-200 ease-in"
              >
                {artwork.artist.name}
              </Link>
            </p>
          </section>

          <article className="mt-5 w-full leading-tight text-pretty">
            <p className="text-lg">
              Lorem ipsum dolor, sit amet consectetur adipisicing elit.
              Voluptatum eveniet ipsam vero tempore, in aliquam vel quis beatae
              maiores ab aliquid iure alias quod eaque, quisquam numquam
              architecto praesentium nulla. Lorem ipsum dolor sit amet
              consectetur adipisicing elit. Perspiciatis temporibus id ullam
              accusamus, corrupti dolorum laboriosam. Illum, ducimus omnis!
              Dignissimos voluptatibus corrupti tempore quibusdam alias! Labore
              nisi ipsa sit ex!
            </p>

            {/* <PortableText
              value={artwork.body}
              components={{
                block: {
                  normal: ({ children }) => <p className="mb-4">{children}</p>,
                },
              }}
            /> */}
          </article>

          <section className="mt-8 space-y-1 tracking-wide">
            <p className="font-medium">
              Style: <span className="font-normal">{artwork.style}</span>
            </p>

            <p className="font-medium">
              Medium: <span className="font-normal">{artwork.medium}</span>
            </p>

            <p className="font-medium">
              Dimensions:{' '}
              <span className="font-normal">{artwork.dimensionsImperial}</span>
              {/* spacing is intentional */}
              <span className="font-light"> | </span>
              <span className="font-normal">{artwork.dimensionsMetric}</span>
            </p>
          </section>

          <section className="mt-8">
            <button className="w-full cursor-pointer rounded-full bg-neutral-900 px-6 py-3 font-medium text-white transition-colors duration-300 ease-in md:w-fit md:px-12">
              Add to bag
            </button>
          </section>
        </div>
      </div>
    </main>
  )
}
