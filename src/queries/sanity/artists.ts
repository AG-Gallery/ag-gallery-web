import type { Artist } from '@/types/artists'

import { sanityClient } from '@/lib/sanity-client'

const allArtistsQuery = `
  *[
  _type == "artist"
  && defined(slug.current)
  ]{
    _id,
    slug,
    name,
    image,
    bio
  }
`

export async function getAllArtists(): Promise<Artist[]> {
  return sanityClient.fetch(allArtistsQuery)
}
