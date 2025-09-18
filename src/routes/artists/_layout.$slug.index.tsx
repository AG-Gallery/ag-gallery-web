import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'

import ProductsGrid from '@/components/ProductsGrid'
import EventsGrid from '@/features/events/EventsGrid'
import { getArtist } from '@/queries/sanity/artists'

function createArtistQuery(slug: string) {
  return queryOptions({
    queryKey: [`artist-${slug}`],
    queryFn: () => getArtist(slug),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const Route = createFileRoute('/artists/_layout/$slug/')({
  loader: ({ context, params }) => {
    const artistQuery = createArtistQuery(params.slug)
    return context.queryClient.ensureQueryData(artistQuery)
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { slug } = Route.useParams()
  const artistQuery = createArtistQuery(slug)

  const { data: artist, isLoading, error } = useSuspenseQuery(artistQuery)
  console.log(artist)

  return (
    <main className="page-main">
      <h2 className="page-headline">{artist.name}</h2>

      <section className="animate-fade-in my-5 items-center justify-center lg:my-14 lg:flex">
        <img
          src={artist.imageUrl}
          alt=""
          width="1920"
          height="1080"
          className="animate-fade-in aspect-square self-start object-cover grayscale-100 lg:max-w-[400px] xl:max-w-[500px]"
        />

        <article className="my-8 flex items-start gap-4 align-top lg:my-0 lg:ml-8 lg:w-1/2 xl:ml-16 xl:w-[600px] xl:gap-8 2xl:ml-24 2xl:w-[700px]">
          <h2 className="mb-3 text-xl font-medium tracking-wide lg:mb-0 lg:text-base">
            Biography
          </h2>

          <div className="w-full tracking-wide text-pretty">
            <p>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Odio
              neque quis ratione debitis quos dicta distinctio, reiciendis odit
              incidunt nisi enim, expedita sapiente deserunt officiis dolor
              perferendis nam deleniti quia. Sed quos sapiente error, explicabo
              assumenda nesciunt doloribus. Quas saepe obcaecati dolorum eaque
              nemo exercitationem nihil minima voluptatum. Voluptatum, provident
              porro quo ex id animi officiis quae eos, est ratione sit soluta,
              quasi repellendus laudantium libero exercitationem. Nobis,
              reprehenderit commodi. Lorem ipsum dolor sit amet, consectetur
              adipisicing elit. Quas saepe obcaecati dolorum eaque nemo
              exercitationem nihil minima voluptatum.
              <br />
              <br />
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Exercitationem sequi qui blanditiis ut odio, quas nostrum natus
              laudantium. Nisi, doloremque. Quas saepe obcaecati dolorum eaque
              nemo exercitationem nihil minima voluptatum. Eveniet rerum amet
              repudiandae doloremque non quidem. Corporis id, assumenda
              excepturi vel perferendis sunt provident. Quod minus, et ab
              voluptatibus impedit ea. Lorem ipsum dolor, sit amet consectetur
              adipisicing elit. Id tempore cupiditate voluptatem minima, quae
              nulla maiores consectetur aliquid dolorem fugiat pariatur ratione
              laudantium similique quis aspernatur quas. Saepe, numquam ipsam.
            </p>
          </div>
        </article>
      </section>

      <hr className="bg-foreground w-full" />

      <section className="my-8 lg:my-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl">Selected Works</h2>
          <Link
            to="/"
            className="hover:text-foreground text-sm text-neutral-500 transition-colors duration-200"
          >
            View all
          </Link>
        </div>

        {/*<ProductsGrid products={ } />*/}
      </section>

      <hr className="bg-foreground w-full" />

      <section className="my-8 lg:my-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl">Exhibitions</h2>
          <Link
            to="/"
            className="hover:text-foreground text-sm text-neutral-500 transition-colors duration-200"
          >
            View all
          </Link>
        </div>

        {/*<EventsGrid events={} />*/}
      </section>
    </main>
  )
}
