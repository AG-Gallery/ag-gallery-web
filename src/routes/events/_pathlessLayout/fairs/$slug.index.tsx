import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { PortableText } from '@portabletext/react'

import ArtistsGrid from '@/features/artists/ArtistsGrid'
import { getFair } from '@/queries/sanity/events'

function createFairQuery(slug: string) {
  const fairQuery = queryOptions({
    queryKey: ['fair', slug],
    queryFn: () => getFair(slug),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  return fairQuery
}

export const Route = createFileRoute('/events/_pathlessLayout/fairs/$slug/')({
  loader: ({ context, params }) => {
    const queryOpts = createFairQuery(params.slug)
    const queryResult = context.queryClient.ensureQueryData(queryOpts)
    return queryResult
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { slug } = Route.useParams()
  const fairQuery = createFairQuery(slug)

  const { data: fair, isLoading, error } = useSuspenseQuery(fairQuery)

  return (
    <main className="page-main">
      <h2 className="page-headline">{fair.title}</h2>

      <section className="animate-fade-in my-5 items-center justify-center lg:my-14 lg:flex">
        <img
          src={fair.coverImageUrl}
          alt=""
          width="1920"
          height="1080"
          className="animate-fade-in aspect-square self-start object-cover lg:max-w-[400px] xl:max-w-[500px]"
        />

        <article className="my-8 flex items-start gap-4 align-top lg:my-0 lg:ml-8 lg:w-1/2 xl:ml-16 xl:w-[600px] xl:gap-8 2xl:ml-24 2xl:w-[700px]">
          <h2 className="mb-3 text-xl font-medium tracking-wide lg:mb-0 lg:text-base">
            Biography
          </h2>

          <div className="w-full tracking-wide text-pretty">
            <PortableText
              value={fair.body}
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

      <section className="my-6 lg:my-8">
        <h2 className="mb-6 text-xl font-medium">Artists</h2>

        <ArtistsGrid artists={fair.artists} />
      </section>
    </main>
  )
}
