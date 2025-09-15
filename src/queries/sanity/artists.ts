import type { Artist } from '@/types/artists'

import { sanityClient } from '@/lib/sanity-client'

const allArtistsQuery = `
  *[
  _type == "artist"
  && defined(slug.current)
  ]{
    "id": _id,
    name,
    "slug": slug.current,
    "imageUrl": image.asset->url,
    bio,
  }
`

export async function getAllArtists(): Promise<Artist[]> {
  return sanityClient.fetch(allArtistsQuery)
}
