export type Fair = {
  type: 'fair'
  id: string
  title: string
  slug: string
  coverImageUrl: string
  images: string[]
  artists: {
    id: string
    name: string
    slug: string
    artistImage: string
    backgroundImage: string
    tagline: string
  }[]
  location: string
  startDate: string // ISO string
  endDate: string // ISO string
  // Issue with PortableTextBlock[] type in route loader
  body: any[]
}
