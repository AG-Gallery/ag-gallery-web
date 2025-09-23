import type { Artist } from '@/types/artists'

import { Link } from '@tanstack/react-router'

type ArtistsGridProps = {
  artists: Omit<Artist, 'bio'>[] | undefined
}

export default function ArtistsGrid({ artists }: ArtistsGridProps) {
  return (
    artists &&
    artists.length !== 0 && (
      <div className="featured-grid-container">
        <div className="featured-grid">
          {artists.map((artist) => {
            return (
              <div key={artist.id}>
                <Link to="/artists/$slug" params={{ slug: artist.slug }}>
                  <img
                    src={artist.imageUrl}
                    alt={`A portrait image of the artist ${artist.name}`}
                    width={1920}
                    height={1080}
                    className="aspect-[5/4] rounded object-cover grayscale-100 transition-all duration-200 ease-in hover:grayscale-0"
                  />

                  <div className="mt-5 flex flex-col">
                    <h3 className="hover:text-accent text-lg font-medium transition-colors duration-200">
                      {artist.name}
                    </h3>
                    <p className="text-sm font-medium text-neutral-500 italic">
                      {artist.tagline}
                    </p>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    )
  )
}
