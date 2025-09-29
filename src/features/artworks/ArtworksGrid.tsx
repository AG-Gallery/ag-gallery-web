import type { Artwork } from '@/types/products'

import { useLocation } from '@tanstack/react-router'

import { ArtworkGridItem } from './ArtworkGridItem'

type ArtworksGridProps = {
  artworks: Artwork[]
}

export default function ArtworksGrid({ artworks }: ArtworksGridProps) {
  const pathname = useLocation({
    select: (location) => location.pathname,
  })

  const isArtworksRoute = pathname.startsWith('/artworks')

  return (
    <div className="featured-grid-container">
      <div className="featured-grid">
        {artworks.map((artwork, index) => {
          const artistHref = `/artists/${artwork.artist.slug}`
          const isArtistLinkActive = pathname === artistHref

          return (
            <ArtworkGridItem
              key={artwork.id}
              artwork={artwork}
              index={index}
              isArtworksRoute={isArtworksRoute}
              isArtistLinkActive={isArtistLinkActive}
            />
          )
        })}
      </div>
    </div>
  )
}
