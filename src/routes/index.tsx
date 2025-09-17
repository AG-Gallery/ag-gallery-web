import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import Header from '@/components/Header'
import HeroVideo from '@/components/HeroVideo'
import ProductsGrid from '@/components/ProductsGrid'
import ArtistsGrid from '@/features/artists/ArtistsGrid'
import EventGrid from '@/features/exhibitions/ExhibitionsGrid'
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
    <>
      <Header isFloating={true} />
      <main>
        <HeroVideo
          posterSrc="/hero/hero-image.png"
          videoSrc="/hero/hero-video.webm"
        />

        <section className="mt-16">
          <h2 className="mb-4 text-lg font-medium tracking-tight md:mb-8 md:text-[26px]">
            Curator's Picks
          </h2>
          <ProductsGrid products={curatorsPicks} />
        </section>

        <section>
          <h2 className="mb-4 text-lg font-medium tracking-tight md:mb-8 md:text-[26px]">
            Exhibitions
          </h2>
          <EventGrid events={featuredExhibitions} />
        </section>

        <section>
          <h2 className="mb-4 text-lg font-medium tracking-tight md:mb-8 md:text-[26px]">
            Fairs
          </h2>
          <EventGrid events={featuredFairs} />
        </section>

        <section>
          <h2 className="mb-4 text-lg font-medium tracking-tight md:mb-8 md:text-[26px]">
            Highlighted Artists
          </h2>
          <ArtistsGrid artists={featuredArtists} />
        </section>
      </main>
    </>
  )
}
