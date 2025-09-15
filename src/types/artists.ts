import type { PortableTextBlock } from '@portabletext/types'

// Sanity response type
export type Artist = {
  _id: string
  name: string
  slug: {
    _type: 'slug'
    current: string
  }
  image: {
    _type: 'image'
    asset: {
      _ref: string
      _type: 'reference'
    }
  }
  bio: PortableTextBlock[]
}
