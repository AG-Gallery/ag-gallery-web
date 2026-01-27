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

const allPagesQuery = `
  *[_type == "page" && !(_id in path("drafts.**"))] | order(title asc) {
    "slug": slug.current,
    title,
    lastUpdated,
    _updatedAt,
    _createdAt
  }
`

export async function getPage(slug: string): Promise<Page> {
  return sanityClient.fetch(pageQuery, { slug })
}

export async function getAllPages(): Promise<
  Array<{
    slug: string
    title: string
    lastUpdated?: string
    _updatedAt: string
    _createdAt: string
  }>
> {
  return sanityClient.fetch(allPagesQuery)
}
