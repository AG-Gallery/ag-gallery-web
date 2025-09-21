import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import Header from '@/components/Header'
import HeroVideo from '@/components/HeroVideo'
import ProductsGrid from '@/components/ProductsGrid'
import ArtistsGrid from '@/features/artists/ArtistsGrid'
import EventsGrid from '@/features/events/EventsGrid'
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

        <section className="absolute top-1/2 left-1/2 z-40 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-8 text-white md:gap-10">
          <span className="font-lora w-full text-[1.625rem] text-nowrap md:text-4xl md:tracking-tight">
            Curated for the discerning eye.
          </span>
          <a
            href="#curators-picks"
            className="w-fit transform rounded-full border border-white bg-white/30 px-6 py-3 font-medium shadow-sm backdrop-blur-md transition duration-200 ease-in hover:bg-white hover:text-black"
          >
            Explore the Gallery
          </a>
        </section>

        <section
          id="curators-picks"
          className="mt-8 scroll-mt-[var(--header-height)]"
        >
          <h2 className="featured-headline">Curator's Picks</h2>
          <ProductsGrid products={curatorsPicks} />
        </section>

        <section>
          <h2 className="featured-headline">Exhibitions</h2>
          <EventsGrid events={featuredExhibitions} />
        </section>

        <section>
          <h2 className="featured-headline">Fairs</h2>
          <EventsGrid events={featuredFairs} />
        </section>

        <section>
          <h2 className="featured-headline">Highlighted Artists</h2>
          <ArtistsGrid artists={featuredArtists} />
        </section>
      </main>
    </>
  )
}
