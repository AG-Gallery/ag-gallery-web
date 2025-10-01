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
    dimensionsImperial,
    dimensionsMetric,
    "gid": store.gid,
    medium,
    "previewImageUrl": store.previewImageUrl,
    "currencyCode": "USD",
    "category": null,
    "price": store.priceRange.maxVariantPrice,
    "slug": store.slug.current,
    "style": artMovement,
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
    "description": store.descriptionHtml,
    dimensionsImperial,
    dimensionsMetric,
    "gid": store.gid,
    medium,
    "previewImageUrl": store.previewImageUrl,
    "currencyCode": "USD",
    "category": null,
    "price": store.priceRange.maxVariantPrice,
    "slug": store.slug.current,
    "style": artMovement,
    theme,
    "title": store.title
  }
`

const allArtworksQuery = `
  *[_type == "allArtworks" && slug.current == "all-artworks-page"][0]{
    selectedArtworks[]->{
      "id": _id,
      artist->{ name, "slug": slug.current },
      "description": store.descriptionHtml,
      dimensionsImperial,
      dimensionsMetric,
      "gid": store.gid,
      medium,
      "previewImageUrl": store.previewImageUrl,
      "currencyCode": "USD",
      "category": null,
      "price": store.priceRange.maxVariantPrice,
      "slug": store.slug.current,
      "style": artMovement,
      theme,
      "title": store.title
    },
  }
`

export async function getProduct(slug: string): Promise<Artwork> {
  return sanityClient.fetch(productQuery, { slug })
}

export async function getProductsByArtist(
  slug: string,
  start = 0,
  end?: number,
): Promise<Artwork[]> {
  return sanityClient.fetch(productsByArtistQuery, { slug, start, end })
}

export async function getAllArtworks(): Promise<Artwork[]> {
  return sanityClient.fetch(allArtworksQuery)
}
