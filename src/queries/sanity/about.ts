import { sanityClient } from '@/lib/sanity-client'

const aboutQuery = `
  *[_type == "about" && slug.current == "about"][0]{
    body
  }
`

export async function getAbout(): Promise<{ body: any[] }> {
  return sanityClient.fetch(aboutQuery)
}
