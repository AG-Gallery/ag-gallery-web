import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { PortableText } from '@portabletext/react'

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

  return (
    <main className="page-main">
      <section className="mb-12 w-full">
        <h2 className="page-headline text-center">About AG Gallery</h2>

        {data && (
          <article className="flex w-full justify-center tracking-wide text-pretty">
            <div className="w-full md:w-1/3">
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
      </section>
    </main>
  )
}
