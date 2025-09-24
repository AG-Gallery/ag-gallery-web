import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { PortableText } from '@portabletext/react'

import Carousel from '@/components/Carousel'
import ProductsGrid from '@/components/ProductsGrid'
import ArtistsGrid from '@/features/artists/ArtistsGrid'
import { formatDateRange } from '@/lib/utils'
import { getExhibition } from '@/queries/sanity/events'

function createExhibitionQuery(slug: string) {
  const exhibitionQuery = queryOptions({
    queryKey: ['exhibition', slug],
    queryFn: () => getExhibition(slug),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  return exhibitionQuery
}

export const Route = createFileRoute(
  '/_pathlessLayout/events/exhibitions/$slug/',
)({
  loader: ({ context, params }) => {
    const queryOpts = createExhibitionQuery(params.slug)
    const queryResult = context.queryClient.ensureQueryData(queryOpts)
    return queryResult
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { slug } = Route.useParams()
  const exhibitionQuery = createExhibitionQuery(slug)

  const {
    data: exhibition,
    isLoading,
    error,
  } = useSuspenseQuery(exhibitionQuery)

  const eventDates = formatDateRange(exhibition.startDate, exhibition.endDate)

  return (
    <main className="page-main">
      <h2 className="page-headline">{exhibition.title}</h2>
      <h3 className="-mt-6 font-medium tracking-wide text-neutral-500">
        {eventDates}
      </h3>

      <section className="animate-fade-in my-5 items-center justify-center lg:my-14 lg:flex">
        <Carousel images={exhibition.images} />

        <article className="my-8 w-full gap-4 self-start tracking-wide text-pretty lg:my-0 lg:ml-8 lg:w-1/2 xl:ml-16 xl:w-[600px] xl:gap-8 2xl:ml-24 2xl:w-[700px]">
          <PortableText
            value={exhibition.body}
            components={{
              block: {
                normal: ({ children }) => <p className="mb-4">{children}</p>,
              },
            }}
          />
        </article>
      </section>

      <hr className="w-full bg-neutral-400" />

      <section className="my-6 lg:my-8">
        <h2 className="font-lora mb-6 text-xl font-medium md:text-2xl md:tracking-tight">
          Artists
        </h2>

        <ArtistsGrid
          artists={
            exhibition.isGroup ? exhibition.artists : [exhibition.artist]
          }
        />
      </section>
    </main>
  )
}
