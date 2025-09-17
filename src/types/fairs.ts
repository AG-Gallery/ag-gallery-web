import type { PortableTextBlock } from '@portabletext/types'

export type Fair = {
  type: 'fair'
  id: string
  title: string
  slug: string
  coverImageUrl: string
  images: string[]
  body: PortableTextBlock[]
  startDate: string // ISO string
  endDate: string // ISO string
}
