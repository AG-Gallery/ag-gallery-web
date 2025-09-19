import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'

import ProductsGrid from '@/components/ProductsGrid'
import { getArtist } from '@/queries/sanity/artists'
import { getProductsByArtist } from '@/queries/sanity/products'

function createArtistQuery(slug: string) {
  return queryOptions({
    queryKey: [`artist-${slug}`],
    queryFn: () => getArtist(slug),
  })
}

function createProductsQuery(slug: string, page: string, pageSize = 24) {
  // parseInt is safe. The route's beforeLoad ensures safety.
  const pageNum = parseInt(page)
  const start = (pageNum - 1) * pageSize
  const end = pageNum * pageSize

  return queryOptions({
    queryKey: [`${slug}-products-${page}`],
    queryFn: () => getProductsByArtist(slug, start, end),
  })
}

export const Route = createFileRoute('/artists/_layout/$slug/artworks/$page')({
  beforeLoad: ({ params }) => {
    const page = Number.parseInt(params.page, 10)

    if (Number.isNaN(page)) {
      throw redirect({ to: '/artists' })
    }
    if (page < 1) {
      throw redirect({ to: '/artists' })
    }
  },
  loader: ({ context, params }) => {
    const artistQuery = createArtistQuery(params.slug)
    const productQuery = createProductsQuery(params.slug, params.page)

    const artistResult = context.queryClient.ensureQueryData(artistQuery)
    const productResult = context.queryClient.ensureQueryData(productQuery)
    return { artistResult, productResult }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { slug, page } = Route.useParams()
  const artistQuery = createArtistQuery(slug)
  const productQuery = createProductsQuery(slug, page)

  const {
    data: artist,
    isLoading: artistIsLoading,
    error: artistError,
  } = useSuspenseQuery(artistQuery)
  const {
    data: products,
    isLoading: productIsLoading,
    error: productError,
  } = useSuspenseQuery(productQuery)

  return (
    <main className="page-main">
      <h2 className="page-headline md:!text-[1.375rem]">
        {artist.name} – All Artworks
      </h2>

      <section className="animate-fade-in my-5 items-center justify-center lg:my-14 lg:flex">
        <ProductsGrid products={products} />
      </section>
    </main>
  )
}
