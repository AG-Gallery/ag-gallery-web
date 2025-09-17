import type { Exhibition } from '@/types/exhibitions'
import type { Fair } from '@/types/fairs'

import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import EventsGrid from '@/features/events/EventsGrid'
import { getAllExhibitions, getAllFairs } from '@/queries/sanity/events'

const exhibitionsQuery = queryOptions({
  queryKey: ['all-exhibitions'],
  queryFn: getAllExhibitions,
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
})

const fairsQuery = queryOptions({
  queryKey: ['all-fairs'],
  queryFn: getAllFairs,
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
})

export const Route = createFileRoute('/events/_layout/')({
  loader: ({ context }) => {
    ;(context.queryClient.ensureQueryData(exhibitionsQuery),
      context.queryClient.ensureQueryData(fairsQuery))
  },
  component: RouteComponent,
})

function RouteComponent() {
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

  return (
    <main className="mt-4">
      <section className="mb-12">
        <h2 className="mb-8 text-lg md:text-[26px]">Exhibitions</h2>
        <EventsGrid events={exhibitions} />
      </section>

      <section>
        <h2 className="mb-8 text-lg md:text-[26px]">Fairs</h2>
        <EventsGrid events={fairs} />
      </section>
    </main>
  )
}
