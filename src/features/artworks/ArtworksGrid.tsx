import type { Artwork } from '@/types/products'

import { useLocation } from '@tanstack/react-router'

import { ArtworkGridItem } from './ArtworkGridItem'

type ArtworksGridProps = {
  artworks: Artwork[]
  showPrice: boolean
}

export default function ArtworksGrid({
  artworks,
  showPrice = false,
}: ArtworksGridProps) {
  const pathname = useLocation({
    select: (location) => location.pathname,
  })

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
              showPrice={showPrice}
              isArtistLinkActive={isArtistLinkActive}
            />
          )
        })}
      </div>
    </div>
  )
}
