import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/artists/_layout/$slug/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/artists/$slug"!</div>
}
