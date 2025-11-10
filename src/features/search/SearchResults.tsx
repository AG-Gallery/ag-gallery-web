import type { SearchProductsQuery } from '@/queries/graphql/generated/react-query'
import type { SearchResult } from '@/queries/search'

import { Link } from '@tanstack/react-router'

import { Loader2 } from 'lucide-react'

type SearchResultsProps = {
  sanityResults: Omit<SearchResult, 'products'> | undefined
  shopifyResults: SearchProductsQuery | undefined
  isLoading: boolean
  debouncedSearch: string
  onLinkClick: () => void
}

export default function SearchResultsComponent({
  sanityResults,
  shopifyResults,
  isLoading,
  debouncedSearch,
  onLinkClick,
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    )
  }

  const hasResults =
    (sanityResults?.artists.length ?? 0) > 0 ||
    (sanityResults?.exhibitions.length ?? 0) > 0 ||
    (sanityResults?.fairs.length ?? 0) > 0 ||
    (shopifyResults?.products.edges.length ?? 0) > 0

  if (debouncedSearch && !hasResults) {
    return (
      <div className="py-8 text-center text-sm text-neutral-500">
        No results found for "{debouncedSearch}"
      </div>
    )
  }

  if (!hasResults) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Artists */}
      {sanityResults?.artists && sanityResults.artists.length > 0 && (
        <ResultSection title="Artists">
          {sanityResults.artists.map((artist) => (
            <Link
              key={artist.id}
              to="/artists/$slug"
              params={{ slug: artist.slug }}
              onClick={onLinkClick}
              className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-neutral-100"
            >
              {artist.artistImage && (
                <img
                  src={artist.artistImage}
                  alt={artist.name}
                  className="h-10 w-10 rounded-full object-cover grayscale"
                />
              )}
              <span className="font-medium">{artist.name}</span>
            </Link>
          ))}
        </ResultSection>
      )}

      {/* Products */}
      {shopifyResults?.products.edges &&
        shopifyResults.products.edges.length > 0 && (
          <ResultSection title="Artworks">
            {shopifyResults.products.edges.map(({ node: product }) => (
              <Link
                key={product.id}
                to="/artworks/$slug"
                params={{ slug: product.handle }}
                onClick={onLinkClick}
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-neutral-100"
              >
                {product.images.edges[0] && (
                  <img
                    src={product.images.edges[0].node.url}
                    alt={`${product.title} by ${product.artist?.value}`}
                    className="h-10 w-10 rounded object-cover"
                  />
                )}
                <div className="flex flex-1 flex-col">
                  <span className="font-medium">{product.title}</span>
                  {product.artist?.value && (
                    <span className="text-sm text-neutral-500">
                      {product.artist.value}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </ResultSection>
        )}

      {/* Exhibitions */}
      {sanityResults?.exhibitions && sanityResults.exhibitions.length > 0 && (
        <ResultSection title="Exhibitions">
          {sanityResults.exhibitions.map((exhibition) => (
            <Link
              key={exhibition.id}
              to="/events/exhibitions/$slug"
              params={{ slug: exhibition.slug }}
              onClick={onLinkClick}
              className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-neutral-100"
            >
              {exhibition.coverImageUrl && (
                <img
                  src={exhibition.coverImageUrl}
                  alt={exhibition.title}
                  className="h-10 w-10 rounded object-cover"
                />
              )}
              <div className="flex flex-1 flex-col">
                <span className="font-medium">{exhibition.title}</span>
                {!exhibition.isGroup && exhibition.artist && (
                  <span className="text-sm text-neutral-500">
                    {exhibition.artist.name}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </ResultSection>
      )}

      {/* Fairs */}
      {sanityResults?.fairs && sanityResults.fairs.length > 0 && (
        <ResultSection title="Fairs">
          {sanityResults.fairs.map((fair) => (
            <Link
              key={fair.id}
              to="/events/fairs/$slug"
              params={{ slug: fair.slug }}
              onClick={onLinkClick}
              className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-neutral-100"
            >
              {fair.coverImageUrl && (
                <img
                  src={fair.coverImageUrl}
                  alt={fair.title}
                  className="h-10 w-10 rounded object-cover"
                />
              )}
              <div className="flex flex-1 flex-col">
                <span className="font-medium">{fair.title}</span>
                <span className="text-sm text-neutral-500">
                  {fair.location}
                </span>
              </div>
            </Link>
          ))}
        </ResultSection>
      )}
    </div>
  )
}

type ResultSectionProps = {
  title: string
  children: React.ReactNode
}

function ResultSection({ title, children }: ResultSectionProps) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-medium text-neutral-500">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  )
}
