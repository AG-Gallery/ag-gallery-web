import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/events/_layout/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main>
      <h2 className="mb-12 text-lg md:text-[26px]">{'Exhibitions & Fairs'}</h2>
      <div>Hello events!</div>
    </main>
  )
}
