import type { Product } from '@/types/products'

import { sanityClient } from '@/lib/sanity-client'

const productsByArtistQuery = `
  *[
    _type == "product" &&
    !(_id in path("drafts.**")) &&
    store.isDeleted != true &&
    artist->slug.current == $slug
  ]{
    "id": _id,
    artist->{
      name,
      "slug": slug.current,
    },
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

export async function getProductsByArtist(slug: string): Promise<Product> {
  return sanityClient.fetch(productsByArtistQuery, { slug })
}
