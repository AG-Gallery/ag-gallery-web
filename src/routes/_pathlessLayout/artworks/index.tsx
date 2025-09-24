import type {
  Public_GetAllProductsQuery,
  Public_GetAllProductsQueryVariables,
} from '@/queries/graphql/generated/react-query'
import type { Artwork } from '@/types/products'

import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import ProductsGrid from '@/components/ProductsGrid'
import { formatProducts, productsToArtworks } from '@/lib/normalizers/products'
import { fetcher } from '@/queries/graphql/fetcher'
import { Public_GetAllProductsDocument } from '@/queries/graphql/generated/react-query'

// TODO:
// write a loader that fetches hand-selected works (first 24)

export const Route = createFileRoute('/_pathlessLayout/artworks/')({
  component: RouteComponent,
})

function RouteComponent() {
  const PAGE_SIZE = 20
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      queryKey: ['all-artworks'],
      initialPageParam: { after: undefined as string | undefined },
      queryFn: async ({ pageParam }) => {
        const variables: Public_GetAllProductsQueryVariables = {
          first: PAGE_SIZE,
          after: pageParam.after,
          imagesFirst: 1,
        }
        const res = await fetcher<
          Public_GetAllProductsQuery,
          Public_GetAllProductsQueryVariables
        >(Public_GetAllProductsDocument, variables)()

        const normalized = formatProducts(res.products) ?? []
        const pageInfo = res.products.pageInfo
        return { items: normalized, pageInfo }
      },
      getNextPageParam: (lastPage) =>
        lastPage.pageInfo.hasNextPage
          ? { after: lastPage.pageInfo.endCursor ?? undefined }
          : undefined,
      gcTime: 7 * 60 * 1000,
      maxPages: 5,
    })

  const normalized = data.pages.flatMap((p) => p.items)
  const products: Artwork[] = productsToArtworks(normalized)

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
