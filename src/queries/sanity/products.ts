import type { Artwork } from '@/types/products'

import { sanityClient } from '@/lib/sanity-client'

const productQuery = `
  *[
    _type == "product" &&
    !(_id in path("drafts.**")) &&
    store.isDeleted != true &&
    store.slug.current == $slug
  ][0]{
    "id": _id,
    artist->{ name, "slug": slug.current },
    artMovement,
    dimensionsImperial,
    dimensionsMetric,
    "gid": store.gid,
    medium,
    "previewImageUrl": store.previewImageUrl,
    "price": store.priceRange.maxVariantPrice,
    "slug": store.slug.current,
    theme,
    "title": store.title
  }
`

const productsByArtistQuery = `
  *[
    _type == "product" &&
    !(_id in path("drafts.**")) &&
    store.isDeleted != true &&
    artist->slug.current == $slug
  ]
  | order(lower(store.title) asc, _id asc)
  [$start..$end]{
    "id": _id,
    artist->{ name, "slug": slug.current },
    artMovement,
    dimensionsImperial,
    dimensionsMetric,
    "gid": store.gid,
    medium,
    "previewImageUrl": store.previewImageUrl,
    "price": store.priceRange.maxVariantPrice,
    "slug": store.slug.current,
    theme,
    "title": store.title
  }
`

export async function getProduct(slug: string) {
  return sanityClient.fetch(productQuery, { slug })
}

export async function getProductsByArtist(
  slug: string,
  start = 0,
  end?: number,
): Promise<Artwork[]> {
  return sanityClient.fetch(productsByArtistQuery, { slug, start, end })
}
