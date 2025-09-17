import type { HomeData } from '@/types/home-data'

import { sanityClient } from '@/lib/sanity-client'

const homeDataQuery = `
  *[_type == "home"][0]{
    curatorsPicks[]->{
      "id": _id,
      "gid": store.gid,
      "title": store.title,
      artist->{
            name,
            "slug": slug.current,
          },
      "slug": store.slug.current,
      "previewImageUrl": store.previewImageUrl,
    },
    featuredExhibitions[]->{
      "id": _id,
      title,
      "slug": slug.current,
      "coverImageUrl": coverImage.asset->url,
      "images": images[].asset->url,
      startDate,
      endDate,
      body
    },
    featuredFairs[]->{
      "id": _id,
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
