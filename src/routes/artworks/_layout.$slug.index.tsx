import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/artworks/_layout/$slug/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/artworks/$slug"!</div>
}
