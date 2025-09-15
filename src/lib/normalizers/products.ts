import type { Public_GetAllProductsQuery } from '@/queries/graphql/generated/react-query'
import type { LabeledMetaobject, Product } from '@/types/products'

type ProductNode = NonNullable<
  NonNullable<Public_GetAllProductsQuery['products']>['edges'][number]
>['node']

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

// Reusable for any of the four metaobject-list metafields
function formatLabeledMetaobjects(
  field:
    | ProductNode['artMovements']
    | ProductNode['frameStyle']
    | ProductNode['medium']
    | ProductNode['theme']
    | null
    | undefined,
): LabeledMetaobject[] {
  const nodes = field?.references?.nodes ?? []
  return nodes.filter(isMetaobjectNode).map((n) => ({
    id: n.id,
    handle: n.handle,
    label: n.label?.value ?? null,
  }))
}

export function formatProducts(
  conn: NonNullable<Public_GetAllProductsQuery['products']> | null | undefined,
): Product[] | undefined {
  const edges = conn?.edges
  if (!edges) return undefined

  const items = edges
    .map((e) => ({ cursor: e.cursor, node: e.node }))
    .filter((x): x is { cursor: string; node: ProductNode } => Boolean(x))

  return items.map(({ cursor, node }) => ({
    cursor,
    id: node.id,
    title: node.title,
    handle: node.handle,
    descriptionHtml: String(node.descriptionHtml),
    artist: node.artist?.value ?? null,
    category: node.category?.value ?? null,
    dimensions: node.dimensions?.value ?? null,
    price: String(node.priceRange.minVariantPrice.amount),
    currencyCode: String(node.priceRange.minVariantPrice.currencyCode),
    createdAt: String(node.createdAt),
    images: formatImages(node.images),
    artMovements: formatLabeledMetaobjects(node.artMovements),
    frameStyle: formatLabeledMetaobjects(node.frameStyle),
    medium: formatLabeledMetaobjects(node.medium),
    theme: formatLabeledMetaobjects(node.theme),
  }))
}
