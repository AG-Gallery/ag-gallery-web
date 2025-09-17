import type { Exhibition } from '@/types/exhibitions'
import type { Fair } from '@/types/fairs'

import { sanityClient } from '@/lib/sanity-client'

const allExhibitionsQuery = `
  *[
  _type == "exhibition"
  ]{
    "type": _type,
    "id": _id,
    title,
    "slug": slug.current,
    "coverImageUrl": coverImage.asset->url,
    "images": images[].asset->url,
    "isGroup": groupToggle,
    artist->{
      name,
      "slug": slug.current,
    },
    artists[]->{
      name,
      "slug": slug.current,
    },
    body,
    startDate,
    endDate,
  }
`

const allFairsQuery = `
  *[
  _type == "fair"
  ]{
    "type": _type,
    "id": _id,
    title,
    "slug": slug.current,
    "coverImageUrl": coverImage.asset->url,
    "images": images[].asset->url,
    body,
    startDate,
    endDate,
  }
`

export async function getAllExhibitions(): Promise<Exhibition[]> {
  return sanityClient.fetch(allExhibitionsQuery)
}

export async function getAllFairs(): Promise<Fair[]> {
  return sanityClient.fetch(allFairsQuery)
}
