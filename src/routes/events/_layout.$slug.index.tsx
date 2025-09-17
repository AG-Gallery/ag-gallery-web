import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/events/_layout/$slug/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/exhibitions/_layout/$slug/"!</div>
}
