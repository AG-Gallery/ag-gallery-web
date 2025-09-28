import type { PortableTextBlock } from '@portabletext/types'

export type Article = {
  id: string
  title: string
  subtitle: PortableTextBlock[]
  date: string
  slug: string
  coverImage: string
  body: PortableTextBlock[]
}
