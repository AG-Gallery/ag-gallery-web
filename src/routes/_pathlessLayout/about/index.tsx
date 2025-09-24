import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_pathlessLayout/about/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className="page-main">
      <section className="mb-12">
        <h2 className="page-headline">About AG Gallery</h2>
      </section>
    </main>
  )
}
