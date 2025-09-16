import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/artists/$slug/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/artists/$slug"!</div>
}
