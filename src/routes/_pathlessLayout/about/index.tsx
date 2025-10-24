import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_pathlessLayout/about/')({
  head: () => ({
    meta: [
      {
        title: 'About AG Gallery',
        description:
          'Learn about AG Gallery’s commitment to contemporary art, our Glendale roots, and how we support artists and collectors.',
      },
    ],
  }),
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
