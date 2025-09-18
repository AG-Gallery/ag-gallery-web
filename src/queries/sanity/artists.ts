import type { Artist } from '@/types/artists'

import { sanityClient } from '@/lib/sanity-client'

const allArtistsQuery = `
  *[
  _type == "artist"
  ]{
    "id": _id,
    name,
    "slug": slug.current,
    "imageUrl": image.asset->url,
    tagline,
    bio,
  }
`

const artistQuery = `
  *[
  _type == "artist"
  && slug.current == $slug
  ][0]{
    "id": _id,
    name,
    "slug": slug.current,
    "imageUrl": image.asset->url,
    tagline,
    bio,
  }
`

export async function getAllArtists(): Promise<Artist[]> {
  return sanityClient.fetch(allArtistsQuery)
}

export async function getArtist(slug: string): Promise<Artist> {
  return sanityClient.fetch(artistQuery, { slug })
}
