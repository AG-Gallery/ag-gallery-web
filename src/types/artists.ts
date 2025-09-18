import type { PortableTextBlock } from '@portabletext/types'

export type MinimalArtist = {
  name: string
  slug: string
}

export type Artist = {
  id: string
  name: string
  slug: string
  imageUrl: string
  tagline: string
  bio: PortableTextBlock[]
}
