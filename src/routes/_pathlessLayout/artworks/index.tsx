import { createFileRoute } from '@tanstack/react-router'

import ArtworksGridContent from '@/features/artworks/ArtworksGridContent'
import { loadFilterOptions } from '@/hooks/useArtworksListing'

export const Route = createFileRoute('/_pathlessLayout/artworks/')({
  loader: loadFilterOptions,
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className="page-main">
      <h2 className="page-headline">Artworks</h2>
      <ArtworksGridContent />
    </main>
  )
}
