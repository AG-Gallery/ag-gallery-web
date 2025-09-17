export type FeaturedArt = {
  artist: {
    name: string
    slug: string
  }
  artMovement: string
  dimensionsImperial: string
  dimensionsMetric: string
  gid: string
  id: string
  medium: string
  previewImageUrl: string
  slug: string
  title: string
  theme: string
}

export interface Product {
  cursor: string
  id: string
  title: string
  handle: string
  descriptionHtml: string
  artMovements: LabeledMetaobject[]
  frameStyle: LabeledMetaobject[]
  medium: LabeledMetaobject[]
  theme: LabeledMetaobject[]
  artist?: string | null
  category?: string | null
  dimensions?: string | null
  price: string
  currencyCode: string
  createdAt: string
  images: Array<{
    id: string
    url: string
    altText?: string | null
    width?: number | null
    height?: number | null
  }>
}

export type LabeledMetaobject = {
  id: string
  handle: string
  label: string | null
}
