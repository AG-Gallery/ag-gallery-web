import type { Public_GetAllProductsQuery } from '@/queries/graphql/generated/react-query'
import type { Artwork, LabeledMetaobject, Product } from '@/types/products'

type ProductNode = NonNullable<
  NonNullable<Public_GetAllProductsQuery['products']>['edges'][number]
>['node']

// Normalize a single product-like node into our Product shape
type ProductLike = Pick<
  ProductNode,
  | 'id'
  | 'title'
  | 'handle'
  | 'createdAt'
  | 'descriptionHtml'
  | 'images'
  | 'priceRange'
  | 'artist'
  | 'category'
  | 'dimensionsImperial'
  | 'dimensionsMetric'
  | 'medium'
  | 'style'
  | 'theme'
>

const isNonNull = <T>(v: T | null | undefined): v is T => v != null

// Narrow Metaobject nodes inside list.metaobject_reference fields
function isMetaobjectNode(n: { __typename?: string } | null | undefined): n is {
  __typename: 'Metaobject'
  id: string
  handle: string
  label?: { value?: string | null } | null
} {
  return n?.__typename === 'Metaobject'
}

function formatImages(images: ProductNode['images']) {
  const nodes = images.edges
    .map((e) => e.node)
    .filter(isNonNull)
    .filter((n): n is typeof n & { id: string; url: unknown } =>
      Boolean(n.id && n.url),
    )

  return nodes.map((n) => ({
    id: n.id, // guaranteed by filter above
    url: String(n.url), // URL scalar may be typed as any → coerce to string
    altText: n.altText ?? null,
    width: n.width ?? null,
    height: n.height ?? null,
  }))
}

// Reusable for metaobject-list metafields (style/theme)
function formatLabeledMetaobjects(
  field: ProductNode['style'] | ProductNode['theme'] | null | undefined,
): LabeledMetaobject[] {
  const nodes = field?.references?.nodes ?? []
  return nodes.filter(isMetaobjectNode).map((n) => ({
    id: n.id,
    handle: n.handle,
    label: n.label?.value ?? null,
  }))
}

export function formatProduct(node: ProductLike, cursor?: string): Product {
  return {
    cursor: cursor ?? '',
    id: node.id,
    title: node.title,
    handle: node.handle,
    descriptionHtml: String(node.descriptionHtml),
    artist: node.artist?.value ?? null,
    category: node.category?.value ?? null,
    dimensionsImperial: node.dimensionsImperial?.value ?? null,
    dimensionsMetric: node.dimensionsMetric?.value ?? null,
    medium: node.medium?.value ?? null,
    price: String(node.priceRange.maxVariantPrice.amount),
    currencyCode: String(node.priceRange.maxVariantPrice.currencyCode),
    createdAt: String(node.createdAt),
    images: formatImages(node.images),
    style: formatLabeledMetaobjects(node.style),
    theme: formatLabeledMetaobjects(node.theme),
  }
}

export function formatProducts(
  conn: NonNullable<Public_GetAllProductsQuery['products']> | null | undefined,
): Product[] | undefined {
  const edges = conn?.edges
  if (!edges) return undefined

  const items = edges
    .map((e) => ({ cursor: e.cursor, node: e.node }))
    .filter((x): x is { cursor: string; node: ProductNode } => Boolean(x))

  return items.map(({ cursor, node }) => formatProduct(node, cursor))
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export function productsToArtworks(products: Product[]): Artwork[] {
  const firstLabel = (list: LabeledMetaobject[]) =>
    list[0]?.label ?? list[0]?.handle

  return products.map((p) => {
    const artistName = p.artist ?? 'Unknown'
    return {
      id: p.id,
      gid: p.id,
      title: p.title,
      slug: p.handle,
      previewImageUrl: p.images[0]?.url ?? '',
      artist: { name: artistName, slug: slugify(artistName) },
      style: firstLabel(p.style),
      medium: p.medium ?? '',
      theme: firstLabel(p.theme),
      dimensionsImperial: p.dimensionsImperial ?? '',
      dimensionsMetric: p.dimensionsMetric ?? '',
    }
  })
}

export function productToArtwork(p: Product): Artwork {
  const firstLabel = (list: LabeledMetaobject[]) =>
    list[0]?.label ?? list[0]?.handle
  const artistName = p.artist ?? 'Unknown'
  return {
    id: p.id,
    gid: p.id,
    title: p.title,
    slug: p.handle,
    previewImageUrl: p.images[0]?.url ?? '',
    artist: { name: artistName, slug: slugify(artistName) },
    style: firstLabel(p.style),
    medium: p.medium ?? '',
    theme: firstLabel(p.theme),
    dimensionsImperial: p.dimensionsImperial ?? '',
    dimensionsMetric: p.dimensionsMetric ?? '',
  }
}

// Price normalization/formatting helper for UI
export function formatMoney(
  currencyCode: string | null | undefined,
  amount: string | number | null | undefined,
  locale = 'en-US',
  minimumFractionDigits = 0,
  maximumFractionDigits = 0,
): string {
  if (!currencyCode || amount == null) return ''
  const num = typeof amount === 'string' ? Number(amount) : amount
  if (typeof num !== 'number' || !isFinite(num)) return ''
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(num)
  } catch {
    return String(amount)
  }
}
