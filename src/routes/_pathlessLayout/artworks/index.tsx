import { useInfiniteQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import ArtworksGrid from '@/components/ArtworksGrid'
import ArtworksGridSkeleton from '@/components/ArtworksGridSkeleton'
import { createAllArtworksInfiniteQueryOptions } from '@/queries/artworks'

const PAGE_SIZE = 24

export const Route = createFileRoute('/_pathlessLayout/artworks/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className="page-main">
      <h2 className="page-headline">Artworks</h2>
      <ArtworksGridContent />
    </main>
  )
}

function ArtworksGridContent() {
  const {
    data: artworks,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    ...createAllArtworksInfiniteQueryOptions(PAGE_SIZE),
    select: (data) => data.pages.flatMap((p) => p.items),
  })

  if (status === 'pending') {
    return <ArtworksGridSkeleton />
  }

  if (status === 'error') {
    return (
      <p className="mt-4 text-center text-sm text-red-600">
        Unable to load artworks. Please try again.
      </p>
    )
  }

  return (
    <>
      <ArtworksGrid artworks={artworks} />
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="mx-auto my-6 block cursor-pointer rounded-full border border-black px-6 py-3 font-medium transition-colors duration-200 ease-in hover:bg-black hover:text-white disabled:opacity-50"
        >
          {isFetchingNextPage ? 'Loading…' : 'Show more'}
        </button>
      )}
    </>
  )
}
