import type { SearchProductsQuery } from '@/queries/graphql/generated/react-query'
import type { SearchResult } from '@/queries/search'

import SearchInput from './SearchInput'
import SearchResults from './SearchResults'

type SearchContentProps = {
  searchTerm: string
  onSearchChange: (value: string) => void
  sanityResults: Omit<SearchResult, 'products'> | undefined
  shopifyResults: SearchProductsQuery | undefined
  isLoading: boolean
  debouncedSearch: string
  onLinkClick: () => void
  isDesktop?: boolean
}

export default function SearchContent({
  searchTerm,
  onSearchChange,
  sanityResults,
  shopifyResults,
  isLoading,
  debouncedSearch,
  onLinkClick,
  isDesktop = true,
}: SearchContentProps) {
  return (
    <div className="flex flex-col gap-4">
      <SearchInput value={searchTerm} onChange={onSearchChange} />
      {isDesktop ? (
        <div className="max-h-[33vh] overflow-y-auto">
          <SearchResults
            sanityResults={sanityResults}
            shopifyResults={shopifyResults}
            isLoading={isLoading}
            debouncedSearch={debouncedSearch}
            onLinkClick={onLinkClick}
          />
        </div>
      ) : (
        <SearchResults
          sanityResults={sanityResults}
          shopifyResults={shopifyResults}
          isLoading={isLoading}
          debouncedSearch={debouncedSearch}
          onLinkClick={onLinkClick}
        />
      )}
    </div>
  )
}
