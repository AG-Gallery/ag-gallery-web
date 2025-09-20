import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/artworks/_pathlessLayout/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className="page-main">
      <h2 className="page-headline">Artworks</h2>
      <div>Hello "/artworks/"!</div>
    </main>
  )
}
