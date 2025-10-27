import { createFileRoute, Outlet } from '@tanstack/react-router'

import Header from '@/components/Header'

export const Route = createFileRoute('/_pathlessLayout')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="w-full">
      <Header />
      <Outlet />
    </div>
  )
}
