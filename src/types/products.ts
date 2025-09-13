export interface Product {
  cursor: string
  id: string
  title: string
  handle: string
  descriptionHtml: string
  artist?: string | null
  category?: string | null
  genre?: string | null
  medium?: string | null
  style?: string | null
  type?: string | null
  dimensions?: string | null
  price: string
  currencyCode: string
  createdAt: string
  images: Array<{
    id: string
    url: string
    altText?: string | null
    width?: number | null
    height?: number | null
  }>
}
