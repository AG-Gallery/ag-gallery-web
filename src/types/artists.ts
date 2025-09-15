import type { PortableTextBlock } from '@portabletext/types'

export type Artist = {
  id: string
  name: string
  slug: string
  imageUrl: string
  bio: PortableTextBlock[]
}
