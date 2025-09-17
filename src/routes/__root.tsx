import type { QueryClient } from '@tanstack/react-query'

import { TanstackDevtools } from '@tanstack/react-devtools'
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

import pretendardFontUrl from '../assets/fonts/pretendard-variable.woff2?url'
import Header from '../components/Header'
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'
import appCss from '../styles.css?url'

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
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="mx-3 md:mx-10">
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
