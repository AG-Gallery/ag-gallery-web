import type { QueryClient } from '@tanstack/react-query'

import { useEffect } from 'react'

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

import Footer from '@/components/Footer'
import Accessibe from '@/integrations/accessiBe/accessibe'
import { seo } from '@/lib/seo'
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
      ...seo({
        title: 'AG Gallery | Discover Contemporary Art',
        description:
          'AG Gallery is a contemporary art gallery in Glendale, California showcasing curated exhibitions, artists, and collectible works.',
      }),
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
          'mx-3 flex min-h-screen flex-col transition-colors duration-200 ease-in-out md:mx-10',
          isMagazineRoute ? 'bg-black text-white' : 'bg-white text-black',
        )}
      >
        <div className="mx-auto flex w-full flex-1 flex-col items-center pt-[var(--header-height)]">
          {children}
          <Footer />
        </div>

        <Scripts />

        {import.meta.env.DEV && <Devtools />}

        {import.meta.env.PROD && (
          <script
            // This injects static, trusted content → no runtime user data
            dangerouslySetInnerHTML={{
              __html: `
              (function() {
                var s = document.createElement('script');
                var h = document.querySelector('head') || document.body;
                s.src = 'https://acsbapp.com/apps/app/dist/js/app.js';
                s.async = true;
                s.onload = function(){ if (window.acsbJS) acsbJS.init(); };
                h.appendChild(s);
              })();
            `,
            }}
          />
        )}
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
