import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import ProductsGrid from '@/components/ProductsGrid'
import { fetchArtworksPage, getNextArtworksPageParam } from '@/queries/artworks'

const PAGE_SIZE = 24

export const Route = createFileRoute('/_pathlessLayout/artworks/')({
  component: RouteComponent,
})

function RouteComponent() {
  const {
    data: products,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSuspenseInfiniteQuery({
    queryKey: ['all-artworks'],
    initialPageParam: { source: 'sanity', after: undefined },
    queryFn: (ctx) => fetchArtworksPage(ctx, PAGE_SIZE),
    getNextPageParam: getNextArtworksPageParam,
    gcTime: 7 * 60 * 1000,
    maxPages: 5,
    select: (data) => data.pages.flatMap((p) => p.items),
  })

  return (
    <main className="page-main">
      <h2 className="page-headline">Artworks</h2>
      <ProductsGrid products={products} />
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="mx-auto my-6 block cursor-pointer rounded-full border border-black px-6 py-3 font-medium transition-colors duration-200 ease-in hover:bg-black hover:text-white disabled:opacity-50"
        >
          {isFetchingNextPage ? 'Loading…' : 'Show more'}
        </button>
      )}
    </main>
  )
}
