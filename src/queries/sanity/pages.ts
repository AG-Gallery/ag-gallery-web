import { sanityClient } from '@/lib/sanity-client'

const pageQuery = `
  *[_type == "page" && slug.current == $slug][0]{
    body,
    lastUpdated,
    "slug": slug.current,
    seo,
    title
  }
`

export async function getPage(slug: string): Promise<Page> {
  return sanityClient.fetch(pageQuery, { slug })
}
