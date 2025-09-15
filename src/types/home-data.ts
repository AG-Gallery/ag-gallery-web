import type { Artist } from './artists'
import type { Exhibition } from './exhibitions'
import type { Fair } from './fairs'
import type { FeaturedArt } from './products'

export type HomeData = {
  curatorsPicks: FeaturedArt[]
  featuredArtists: Artist[]
  featuredExhibitions: Exhibition[]
  featuredFairs: Fair[]
}
