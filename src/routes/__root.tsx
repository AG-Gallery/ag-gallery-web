import type { QueryClient } from '@tanstack/react-query'

import { TanstackDevtools } from '@tanstack/react-devtools'
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  useLocation,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

import pretendardFontUrl from '../assets/fonts/pretendard-variable.woff2?url'
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'
import appCss from '../styles.css?url'

import { cn } from '@/lib/utils'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'AG Gallery',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'preload',
        as: 'font',
        href: pretendardFontUrl,
        type: 'font/woff2',
        crossOrigin: 'anonymous',
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const pathname = useLocation({
    select: (location) => location.pathname,
  })

  const isMagazineRoute = pathname.startsWith('/magazine')

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <HeadContent />
      </head>
      <body
        className={cn(
          'mx-3 transition-colors duration-200 ease-in-out md:mx-10',
          isMagazineRoute ? 'bg-black text-white' : 'bg-white text-black',
        )}
      >
        <div className="mx-auto pt-[var(--header-height)]">{children}</div>

        {import.meta.env.DEV && <Devtools />}
        <Scripts />
      </body>
    </html>
  )
}

function Devtools() {
  return (
    <TanstackDevtools
      config={{
        position: 'bottom-left',
      }}
      plugins={[
        {
          name: 'Tanstack Router',
          render: <TanStackRouterDevtoolsPanel />,
        },
        TanStackQueryDevtools,
      ]}
    />
  )
}
