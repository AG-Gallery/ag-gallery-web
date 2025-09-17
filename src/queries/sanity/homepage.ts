import type { HomeData } from '@/types/home-data'

import { sanityClient } from '@/lib/sanity-client'

const homeDataQuery = `
  *[_type == "home"][0]{
    curatorsPicks[]->{
      "id": _id,
      "gid": store.gid,
      artist->{
        name,
        "slug": slug.current,
      },
      artMovement,
      dimensionsImperial,
      dimensionsMetric,
      medium,
      "previewImageUrl": store.previewImageUrl,
      "slug": store.slug.current,
      "title": store.title,
      theme,
    },
    featuredExhibitions[]->{
      "id": _id,
      "type": _type,
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
    },
    featuredFairs[]->{
      "id": _id,
      "type": _type,
      title,
      "slug": slug.current,
      "coverImageUrl": coverImage.asset->url,
      "images": images[].asset->url,
      startDate,
      endDate,
      body
    },
    featuredArtists[]->{
      "id": _id,
      name,
      "slug": slug.current,
      "imageUrl": image.asset->url,
      bio,
    },
  }
`

export async function getHomeData(): Promise<HomeData> {
  return sanityClient.fetch(homeDataQuery)
}
