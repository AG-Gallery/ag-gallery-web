import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/artworks/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/artworks/"!</div>
}
