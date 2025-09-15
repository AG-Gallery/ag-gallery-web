import type { Public_GetFeaturedArtistsQuery } from '@/queries/graphql/generated/react-query'
import type { Artist } from '@/types/artists'

/**
 * Formats raw article data (represents artist) from Shopify
 * @param data - Blog object from Shopify API
 * @returns Formatted artists array
 */
export function formatArtists(
  data: Public_GetFeaturedArtistsQuery['blog'],
): Artist[] {
  const edges = data?.articles.edges ?? []
  return edges.map(({ node }) => ({
    id: node.id,
    name: node.title,
    handle: node.handle,
    imageUrl: node.image?.url as string,
    bio: node.contentHtml ?? null,
  }))
}
