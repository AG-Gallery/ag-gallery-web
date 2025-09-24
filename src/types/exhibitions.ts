import type { Artist } from './artists'
import type { PortableTextBlock } from '@portabletext/types'

type BaseExhibition = {
  type: 'exhibition'
  id: string
  title: string
  slug: string
  coverImageUrl: string
  images: string[]
  body: PortableTextBlock[]
  startDate: string // ISO string
  endDate: string // ISO string
}

// Solo exhibition
type SoloExhibition = BaseExhibition & {
  isGroup: false
  artist: Omit<Artist, 'bio'>
  artists?: undefined
}

// Group exhibition
type GroupExhibition = BaseExhibition & {
  isGroup: true
  artist?: undefined
  artists: Omit<Artist, 'bio'>[]
}

export type Exhibition = SoloExhibition | GroupExhibition
