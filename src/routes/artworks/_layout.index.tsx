import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/artworks/_layout/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main>
      <h2 className="mb-12 text-lg md:text-[26px]">Artworks</h2>
      <div>Hello "/artworks/"!</div>
    </main>
  )
}
