export type Artwork = {
  artist: {
    name: string
    slug: string
  }
  style: string
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

export type LabeledMetaobject = {
  id: string
  handle: string
  label: string | null
}
