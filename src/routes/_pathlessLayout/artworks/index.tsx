import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_pathlessLayout/artworks/')({
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
