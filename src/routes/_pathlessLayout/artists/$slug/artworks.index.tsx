import {
  queryOptions,
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import ArtworksGrid from '@/features/artworks/ArtworksGrid'
import { getArtist } from '@/queries/sanity/artists'
import { getProductsByArtist } from '@/queries/sanity/products'

function createArtistQuery(slug: string) {
  return queryOptions({
    queryKey: [`artist-${slug}`],
    queryFn: () => getArtist(slug),
  })
}

const PAGE_SIZE = 20

export const Route = createFileRoute(
  '/_pathlessLayout/artists/$slug/artworks/',
)({
  loader: ({ context, params }) => {
    const artistQuery = createArtistQuery(params.slug)
    const artistResult = context.queryClient.ensureQueryData(artistQuery)
    return { artistResult }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { slug } = Route.useParams()
  const artistQuery = createArtistQuery(slug)

  const {
    data: artist,
    isLoading: artistIsLoading,
    error: artistError,
  } = useSuspenseQuery(artistQuery)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error: productsError,
  } = useSuspenseInfiniteQuery({
    queryKey: [`${artist.slug}`, 'artworks'],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const start = (pageParam - 1) * PAGE_SIZE
      const end = start + PAGE_SIZE // fetch one extra to detect next page
      const result = await getProductsByArtist(slug, start, end)
      const hasMore = result.length > PAGE_SIZE
      const items = hasMore ? result.slice(0, PAGE_SIZE) : result
      return { items, hasMore }
    },
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      return lastPage.hasMore ? lastPageParam + 1 : undefined
    },
    gcTime: 7 * 60 * 1000,
    maxPages: 3,
  })

  const artworks = data.pages.flatMap((p) => p.items)

  return (
    <main className="page-main">
      <h2 className="page-headline md:!text-[1.375rem]">
        {artist.name} – All Artworks
      </h2>

      <section className="animate-fade-in mt-5 items-center justify-center lg:mt-14 lg:flex">
        <ArtworksGrid artworks={artworks} />
      </section>

      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="mx-auto block rounded-full border border-black px-6 py-3 font-medium disabled:opacity-50"
        >
          {isFetchingNextPage ? 'Loading…' : 'Show more'}
        </button>
      )}
    </main>
  )
}
