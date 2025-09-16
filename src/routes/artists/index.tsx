import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import ArtistsGrid from '@/components/ArtistsGrid'
import { getAllArtists } from '@/queries/sanity/artists'

const artistsQuery = queryOptions({
  queryKey: ['all-artists'],
  queryFn: getAllArtists,
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
})

export const Route = createFileRoute('/artists/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(artistsQuery),
  component: ArtistsPage,
})

function ArtistsPage() {
  const { data: artists, isLoading, error } = useSuspenseQuery(artistsQuery)

  return <ArtistsGrid artists={artists} />
}
