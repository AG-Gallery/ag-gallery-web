import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import ArtistsGrid from '@/components/ArtistsGrid'
import HeroVideo from '@/components/HeroVideo'
import ProductsGrid from '@/components/ProductsGrid'
import { getHomeData } from '@/queries/sanity/homepage'

const homeDataQuery = queryOptions({
  queryKey: ['home-data'],
  queryFn: getHomeData,
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
})

export const Route = createFileRoute('/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(homeDataQuery),
  component: IndexPage,
})

function IndexPage() {
  const { data, isLoading, error } = useSuspenseQuery(homeDataQuery)

  const curatorsPicks = data.curatorsPicks
  const featuredArtists = data.featuredArtists
  const featuredExhibitions = data.featuredExhibitions
  const featuredFairs = data.featuredFairs

  return (
    <main>
      <HeroVideo
        posterSrc="/hero/hero-image.png"
        videoSrc="/hero/hero-video.webm"
      />

      <section className="animate-fade-in my-8 mt-16">
        <h2 className="mb-4 text-[26px] font-medium tracking-tight md:mb-8">
          Curator's Picks
        </h2>
        <ProductsGrid products={curatorsPicks} />
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
