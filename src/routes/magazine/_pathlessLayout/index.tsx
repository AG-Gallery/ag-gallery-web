import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/magazine/_pathlessLayout/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className="page-main">
      <section className="mb-12">
        <h2 className="page-headline">AG Magazine</h2>
      </section>
    </main>
  )
}
