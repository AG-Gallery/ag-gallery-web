import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { PortableText } from '@portabletext/react'

import { getProduct } from '@/queries/sanity/products'

function createArtworkQuery(slug: string) {
  const artworkQuery = queryOptions({
    queryKey: ['artwork', slug],
    queryFn: () => getProduct(slug),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  return artworkQuery
}

export const Route = createFileRoute('/artworks/_pathlessLayout/$slug/')({
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

  return (
    <main className="page-main">
      <div className="animate-fade-in my-5 items-start justify-center lg:my-14 lg:flex">
        <img
          src={artwork.previewImageUrl}
          alt=""
          width="1920"
          height="1080"
          className="animate-fade-in aspect-square self-start object-cover lg:max-w-[400px] xl:max-w-[500px]"
        />

        <section className="my-8 flex items-start gap-4 align-top text-nowrap lg:my-0 lg:ml-8 lg:w-1/2 xl:ml-16 xl:w-[600px] xl:gap-8 2xl:ml-24 2xl:w-[700px]">
          <h2 className="page-headline">{artwork.title}</h2>

          <article className="w-full tracking-wide text-pretty">
            <PortableText
              value={artwork.body}
              components={{
                block: {
                  normal: ({ children }) => <p className="mb-4">{children}</p>,
                },
              }}
            />
          </article>
        </section>
      </div>
    </main>
  )
}
