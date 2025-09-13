import type { QueryClient } from '@tanstack/react-query'

import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'

import pretendardFontUrl from '../assets/fonts/pretendard-variable.woff2?url'
import Header from '../components/Header'
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
      <body>
        <Header />
        <div className="mx-auto">{children}</div>

        {import.meta.env.DEV && <Devtools />}
        <Scripts />
      </body>
    </html>
  )
}

function Devtools() {
  const { TanstackDevtools } = require('@tanstack/react-devtools')
  const {
    TanStackRouterDevtoolsPanel,
  } = require('@tanstack/react-router-devtools')
  const TanStackQueryDevtools =
    require('../integrations/tanstack-query/devtools').default

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
