import type { GetAllProductsQuery } from '@/graphql/generated/react-query'
import type { Product } from '@/types/products'

function formatImages(
  edges: NonNullable<
    NonNullable<
      GetAllProductsQuery['products']
    >['edges'][number]['node']['images']
  >['edges'],
) {
  return edges
    .map((edge) => edge.node)
    .filter((node): node is NonNullable<typeof node> => Boolean(node))
    .map((node) => ({
      id: node.id!,
      url: node.url!,
      altText: node.altText,
      width: node.width,
      height: node.height,
    }))
}

export function formatProducts(
  data: GetAllProductsQuery | null | undefined,
): Product[] | undefined {
  if (!data?.products.edges) return undefined

  return data.products.edges.map((edge) => {
    const product = edge.node

    const images = formatImages(product.images.edges)

    return {
      cursor: edge.cursor,
      id: product.id,
      title: product.title,
      handle: product.handle,
      descriptionHtml: product.descriptionHtml,
      artist: product.artist?.value,
      category: product.category?.value,
      genre: product.genre?.value,
      medium: product.medium?.value,
      style: product.style?.value,
      type: product.type?.value,
      dimensions: product.dimensions?.value,
      price: product.priceRange.minVariantPrice.amount,
      currencyCode: product.priceRange.minVariantPrice.currencyCode,
      createdAt: product.createdAt,
      images,
    }
  })
}
