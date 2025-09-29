import type { Artist } from './artists'
import type { Exhibition } from './exhibitions'
import type { Fair } from './fairs'
import type { Artwork } from './products'

export type HomeData = {
  curatorsPicks: Artwork[]
  featuredArtists: Artist[]
  featuredExhibitions: Exhibition[]
  featuredFairs: Fair[]
}
