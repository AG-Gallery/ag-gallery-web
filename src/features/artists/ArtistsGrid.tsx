import type { Artist } from '@/types/artists'

import { Link } from '@tanstack/react-router'

type ArtistsGridProps = {
  artists: Omit<Artist, 'bio'>[] | undefined
}

export default function ArtistsGrid({ artists }: ArtistsGridProps) {
  return (
    artists &&
    artists.length !== 0 && (
      <div className="animate-fade-in mb-8 pb-4">
        <div className="grid grid-cols-2 gap-2">
          {artists.map((artist) => {
            return (
              <div key={artist.id}>
                <Link
                  to="/artists/$slug"
                  params={{ slug: artist.slug }}
                  className="group relative"
                >
                  <div>
                    <img
                      src={artist.artistImage}
                      alt={`A portrait image of the artist ${artist.name}`}
                      width={1920}
                      height={1080}
                      className="z-10 aspect-[3/2] rounded-xs object-cover lg:aspect-[4/2] lg:object-contain 2xl:aspect-[2.25]"
                    />
                    <img
                      src={artist.backgroundImage}
                      alt={`A portrait image of the artist ${artist.name}`}
                      width={1920}
                      height={1080}
                      className="absolute top-0 right-0 left-0 -z-10 aspect-[3/2] rounded-xs object-cover opacity-50 transition-all duration-100 ease-in group-hover:opacity-85 lg:aspect-[4/2] 2xl:aspect-[2.25]"
                    />
                  </div>

                  <div className="z-0 mt-5 flex w-fit flex-col items-center justify-center transition-colors duration-200 group-hover:text-white md:absolute md:top-8 md:right-0 md:left-0 md:mx-auto">
                    <h3 className="font-playfair w-fit text-lg font-medium md:text-xl lg:text-2xl xl:text-4xl">
                      {artist.name}
                    </h3>
                    <p className="text-sm font-medium text-neutral-800 italic transition-colors duration-200 group-hover:text-white md:text-base lg:mt-1 lg:text-lg lg:tracking-wide">
                      {artist.tagline}
                    </p>
                  </div>

                  <div className="absolute top-0 right-0 left-0 -z-10 mx-auto h-[45%] w-full bg-gradient-to-b group-hover:from-black/30 group-hover:via-black/20 group-hover:to-transparent" />
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    )
  )
}
