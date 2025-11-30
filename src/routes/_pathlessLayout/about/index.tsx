import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { PortableText } from '@portabletext/react'

import SocialMedia from '@/components/SocialMedia'
import { getAbout } from '@/queries/sanity/about'

const aboutQueryOptions = queryOptions({
  queryKey: ['about'],
  queryFn: getAbout,
  staleTime: 30 * 60 * 1000,
  gcTime: 60 * 60 * 1000,
})

export const Route = createFileRoute('/_pathlessLayout/about/')({
  head: () => ({
    meta: [
      {
        title: 'About AG Gallery',
        description:
          'Learn about AG Gallery’s commitment to contemporary art, our Glendale roots, and how we support artists and collectors.',
      },
    ],
  }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(aboutQueryOptions),
  component: AboutPage,
})

function AboutPage() {
  const aboutQuery = useSuspenseQuery(aboutQueryOptions)
  const data = aboutQuery.isSuccess ? aboutQuery.data : null

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

  const google =
    'https://www.google.com/maps?q=34.142514825818,-118.25037743196647'
  const apple = 'maps://maps.apple.com/?q=34.142514825818,-118.25037743196647'

  const href = isIOS ? apple : google

  return (
    <main className="page-main">
      <div className="mb-12">
        <h2 className="page-headline">About AG Gallery</h2>

        <section className="flex flex-col gap-4 md:flex-row">
          {data && (
            <article className="tracking-wide text-pretty">
              <div className="w-full max-w-[1000px] md:w-4/5">
                <PortableText
                  value={data.body}
                  components={{
                    block: {
                      normal: ({ children }) => (
                        <p className="mb-4">{children}</p>
                      ),
                    },
                  }}
                />
              </div>
            </article>
          )}

          <div className="flex w-full flex-col items-stretch gap-6">
            <a href={href} className="w-full max-w-[600px]">
              <img src="gallery-location.png" className="size-full" />
            </a>

            <div className="flex max-w-[600px] flex-col items-start justify-between gap-8 lg:flex-row">
              <section>
                <h3 className="mb-2 text-lg font-semibold">Contact</h3>
                <p className="mt-2 text-sm">
                  418 E Colorado Blvd, Glendale, CA 91205
                </p>
                <a
                  href="mailto:info@ag-gallery.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent mt-1 text-sm transition-colors"
                >
                  info@ag-gallery.com
                </a>
                <p className="mt-0.5 text-sm">+1 (747) 372-1084</p>
              </section>

              <section>
                <h3 className="mb-2 text-lg font-semibold">Social Media</h3>
                <SocialMedia displayStyle="flex" />
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
