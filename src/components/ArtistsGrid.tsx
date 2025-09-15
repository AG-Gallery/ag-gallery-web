'use client'

import type { Artist } from '@/types/artists'

import { Link } from '@tanstack/react-router'

type ArtistsGridProps = {
  artists?: Artist[]
}

export default function ArtistsGrid({ artists }: ArtistsGridProps) {
  return (
    artists &&
    artists.length !== 0 && (
      <section className="featured-grid-container">
        <div className="featured-grid">
          {artists.map((artist) => {
            return (
              <Link
                key={artist.id}
                to={`/artists/${artist.slug}`}
                className="relative aspect-square size-full"
              >
                <img
                  src={artist.imageUrl}
                  alt={`A portrait image of the artist ${artist.name}`}
                  width={1920}
                  height={1080}
                  className="aspect-square size-full rounded object-cover grayscale-100"
                />

                <span>
                  <h3 className="hover:text-primary mt-5 text-lg font-medium transition-colors duration-200">
                    {artist.name}
                  </h3>
                </span>
              </Link>
            )
          })}
        </div>
      </section>
    )
  )
}
