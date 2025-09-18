import type { MinimalArtist } from './artists'
import type { PortableTextBlock } from '@portabletext/types'

export type Fair = {
  type: 'fair'
  id: string
  title: string
  slug: string
  coverImageUrl: string
  images: string[]
  artists: MinimalArtist[]
  location: string
  startDate: string // ISO string
  endDate: string // ISO string
  body: PortableTextBlock[]
}
