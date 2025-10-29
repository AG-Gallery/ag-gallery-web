import type { Artist } from './artists'

export type Exhibition = {
  type: 'exhibition'
  id: string
  title: string
  slug: string
  coverImageUrl: string
  images: string[]
  // Issue with PortableTextBlock[] type in route loader
  body: any[]
  startDate: string // ISO string
  endDate: string // ISO string
  artists: Omit<Artist, 'bio'>[]
}
