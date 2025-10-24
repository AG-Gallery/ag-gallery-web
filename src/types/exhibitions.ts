import type { Artist } from './artists'

type BaseExhibition = {
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
}

// Solo exhibition
type SoloExhibition = BaseExhibition & {
  isGroup: false
  artist: Omit<Artist, 'bio'>
  artists?: undefined
}

// Group exhibition
export type GroupExhibition = BaseExhibition & {
  isGroup: true
  artist?: undefined
  artists: Omit<Artist, 'bio'>[]
}

export type Exhibition = SoloExhibition | GroupExhibition
