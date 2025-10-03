import { useEffect, useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

import { Loader2, Search } from 'lucide-react'

import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'
import { performSearch, useSearchProductsQuery } from '@/queries/search'

import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './ui/drawer'

type SearchDialogProps = {
  isMagazineRoute: boolean
}

export default function SearchDialog({ isMagazineRoute }: SearchDialogProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const isDesktop = useMediaQuery('(min-width: 768px)')

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Sanity search (artists, exhibitions, fairs)
  const { data: sanityResults, isLoading: sanityLoading } = useQuery({
    queryKey: ['search-sanity', debouncedSearch],
    queryFn: () => performSearch(debouncedSearch),
    enabled: debouncedSearch.length > 0,
  })

  // Shopify search (products)
  const { data: shopifyResults, isLoading: shopifyLoading } =
    useSearchProductsQuery(
      {
        query: `title:*${debouncedSearch}*`,
        first: 5,
      },
      {
        enabled: debouncedSearch.length > 0,
      },
    )

  const isLoading = sanityLoading || shopifyLoading
  const hasResults =
    (sanityResults?.artists.length ?? 0) > 0 ||
    (sanityResults?.exhibitions.length ?? 0) > 0 ||
    (sanityResults?.fairs.length ?? 0) > 0 ||
    (shopifyResults?.products.edges.length ?? 0) > 0

  const handleLinkClick = () => {
    setOpen(false)
    setSearchTerm('')
  }

  const SearchContent = () => (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="absolute top-3 left-3 h-4 w-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Search artworks, artists, exhibitions, fairs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 py-2 pr-4 pl-10 focus:border-neutral-400 focus:outline-none"
          autoFocus
        />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
        </div>
      )}

      {!isLoading && debouncedSearch && !hasResults && (
        <div className="py-8 text-center text-sm text-neutral-500">
          No results found for "{debouncedSearch}"
        </div>
      )}

      {!isLoading && hasResults && (
        <div className="max-h-[60vh] space-y-6 overflow-y-auto">
          {/* Artists */}
          {sanityResults?.artists && sanityResults.artists.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-medium text-neutral-500">
                Artists
              </h3>
              <div className="space-y-2">
                {sanityResults.artists.map((artist) => (
                  <Link
                    key={artist.id}
                    to="/artists/$slug"
                    params={{ slug: artist.slug }}
                    onClick={handleLinkClick}
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
              </div>
            </div>
          )}

          {/* Products */}
          {shopifyResults?.products.edges &&
            shopifyResults.products.edges.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-medium text-neutral-500">
                  Artworks
                </h3>
                <div className="space-y-2">
                  {shopifyResults.products.edges.map(({ node: product }) => (
                    <Link
                      key={product.id}
                      to="/artworks/$slug"
                      params={{ slug: product.handle }}
                      onClick={handleLinkClick}
                      className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-neutral-100"
                    >
                      {product.images.edges[0] && (
                        <img
                          src={product.images.edges[0].node.url}
                          alt={product.title}
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
                      <span className="text-sm font-medium">
                        ${product.priceRange.maxVariantPrice.amount}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          {/* Exhibitions */}
          {sanityResults?.exhibitions &&
            sanityResults.exhibitions.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-medium text-neutral-500">
                  Exhibitions
                </h3>
                <div className="space-y-2">
                  {sanityResults.exhibitions.map((exhibition) => (
                    <Link
                      key={exhibition.id}
                      to="/events/exhibitions/$slug"
                      params={{ slug: exhibition.slug }}
                      onClick={handleLinkClick}
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
                </div>
              </div>
            )}

          {/* Fairs */}
          {sanityResults?.fairs && sanityResults.fairs.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-medium text-neutral-500">
                Fairs
              </h3>
              <div className="space-y-2">
                {sanityResults.fairs.map((fair) => (
                  <Link
                    key={fair.id}
                    to="/events/fairs/$slug"
                    params={{ slug: fair.slug }}
                    onClick={handleLinkClick}
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
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="cursor-pointer p-2 transition-colors duration-200 focus:outline-none">
            <Search className="w-5" />
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Search</DialogTitle>
            <DialogDescription className="sr-only">
              Search for artworks, artists, exhibitions, and fairs
            </DialogDescription>
          </DialogHeader>
          <SearchContent />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button className="cursor-pointer p-2 transition-colors duration-200 focus:outline-none">
          <Search className="w-5" />
        </button>
      </DrawerTrigger>
      <DrawerContent
        className={cn(
          isMagazineRoute ? 'bg-black text-white' : 'bg-white text-black',
        )}
      >
        <DrawerHeader>
          <DrawerTitle
            className={isMagazineRoute ? 'text-white' : 'text-black'}
          >
            Search
          </DrawerTitle>
          <DrawerDescription className="sr-only">
            Search for artworks, artists, exhibitions, and fairs
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4">
          <SearchContent />
        </div>
        <DrawerClose className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="sm"
            className={isMagazineRoute ? 'text-white' : ''}
          >
            Close
          </Button>
        </DrawerClose>
      </DrawerContent>
    </Drawer>
  )
}
