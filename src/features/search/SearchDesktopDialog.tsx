import type { UseSearchLogicReturn } from '../../hooks/useSearch'

import { Search } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import SearchContent from './SearchContent'

type SearchDesktopDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  searchLogic: UseSearchLogicReturn
  onLinkClick: () => void
}

export default function SearchDesktopDialog({
  open,
  onOpenChange,
  searchLogic,
  onLinkClick,
}: SearchDesktopDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
        <SearchContent
          searchTerm={searchLogic.searchTerm}
          onSearchChange={searchLogic.setSearchTerm}
          sanityResults={searchLogic.sanityResults}
          shopifyResults={searchLogic.shopifyResults}
          isLoading={searchLogic.isLoading}
          debouncedSearch={searchLogic.debouncedSearch}
          onLinkClick={onLinkClick}
          isDesktop
        />
      </DialogContent>
    </Dialog>
  )
}
