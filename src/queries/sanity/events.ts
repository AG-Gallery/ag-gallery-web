import type { Exhibition } from '@/types/exhibitions'
import type { Fair } from '@/types/fairs'

import { sanityClient } from '@/lib/sanity-client'

const exhibitionQuery = `
  *[
  _type == "exhibition"
  && slug.current == $slug
  ][0]{
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

const exhibitionsWithArtistQuery = `
  *[
    _type == "exhibition" &&
    !(_id in path("drafts.**")) &&
    (
      // solo exhibition case
      (!groupToggle && artist->slug.current == $slug) ||

      // group exhibition case
      (groupToggle && $slug in artists[]->slug.current)
    )
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

const fairQuery = `
  *[
  _type == "fair"
  && slug.current == $slug
  ][0]{
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
      "imageUrl": image.asset->url,
      tagline,
    },
    artists[]->{
      name,
      "slug": slug.current,
      "imageUrl": image.asset->url,
      tagline,
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
    artists[]->{
      name,
      "slug": slug.current,
    },
    location,
    startDate,
    endDate,
    body,
  }
`

const fairsWithArtistQuery = `
  *[
    _type == "fair" &&
    !(_id in path("drafts.**")) &&
    $slug in artists[]->slug.current
  ]{
    "type": _type,
    "id": _id,
    title,
    "slug": slug.current,
    "coverImageUrl": coverImage.asset->url,
    "images": images[].asset->url,
    artists[]->{
      name,
      "slug": slug.current,
    },
    location,
    startDate,
    endDate,
    body,
  }
`

export async function getExhibition(slug: string): Promise<Exhibition> {
  return sanityClient.fetch(exhibitionQuery, { slug })
}

export async function getAllExhibitions(): Promise<Exhibition[]> {
  return sanityClient.fetch(allExhibitionsQuery)
}

export async function getExhibitionsWithArtist(
  slug: string,
): Promise<Exhibition[]> {
  return sanityClient.fetch(exhibitionsWithArtistQuery, { slug })
}

export async function getFair(slug: string): Promise<Fair> {
  return sanityClient.fetch(fairQuery, { slug })
}

export async function getAllFairs(): Promise<Fair[]> {
  return sanityClient.fetch(allFairsQuery)
}

export async function getFairsWithArtist(slug: string): Promise<Fair[]> {
  return sanityClient.fetch(fairsWithArtistQuery, { slug })
}
