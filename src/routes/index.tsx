import { createFileRoute } from '@tanstack/react-router'

import ArtistsGrid from '@/components/ArtistsGrid'
import HeroVideo from '@/components/HeroVideo'
import ProductsGrid from '@/components/ProductsGrid'
import { formatArtists } from '@/lib/normalizers/artists'
import { formatProducts } from '@/lib/normalizers/products'
import {
  usePublic_GetCollectionProductsQuery,
  usePublic_GetFeaturedArtistsQuery,
} from '@/queries/graphql/generated/react-query'

export const Route = createFileRoute('/')({
  component: IndexPage,
})

function IndexPage() {
  const { data, isLoading, error } = usePublic_GetCollectionProductsQuery(
    {
      collectionHandle: 'curators-picks',
      productsFirst: 4,
    },
    {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  )

  const {
    data: artistData,
    isLoading: artistIsLoading,
    error: artistError,
  } = usePublic_GetFeaturedArtistsQuery()

  const products = formatProducts(data?.collectionByHandle?.products)
  const featuredArtists = formatArtists(artistData?.blog)

  return (
    <main>
      <HeroVideo
        posterSrc="/hero/hero-image.png"
        videoSrc="/hero/hero-video.webm"
      />

      <section className="animate-fade-in my-8 md:my-14">
        <h2 className="mb-4 text-[26px] font-medium tracking-tight md:mb-8">
          Curator's Picks
        </h2>
        <ProductsGrid products={products} />
      </section>

      <section className="animate-fade-in my-8">
        <h2 className="mb-4 text-[26px] font-medium tracking-tight md:mb-8">
          Exhibitions
        </h2>
      </section>

      <section className="animate-fade-in my-8">
        <h2 className="mb-4 text-[26px] font-medium tracking-tight md:mb-8">
          Highlighted Artists
        </h2>
        <ArtistsGrid artists={featuredArtists} />
      </section>

      <section className="animate-fade-in my-8">
        <h2 className="mb-4 text-[26px] font-medium tracking-tight md:mb-8">
          Fairs
        </h2>
      </section>
    </main>
  )
}
