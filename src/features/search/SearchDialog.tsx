import { useState } from 'react'

import { useSearchLogic } from '../../hooks/useSearch'

import { useMediaQuery } from '@/hooks/useMediaQuery'

import SearchDesktopDialog from './SearchDesktopDialog'
import SearchMobileDrawer from './SearchMobileDrawer'

type SearchDialogProps = {
  isMagazineRoute: boolean
}

export default function SearchDialog({ isMagazineRoute }: SearchDialogProps) {
  const [open, setOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const searchLogic = useSearchLogic()

  const handleLinkClick = () => {
    setOpen(false)
    searchLogic.setSearchTerm('')
  }

  if (isDesktop) {
    return (
      <SearchDesktopDialog
        open={open}
        onOpenChange={setOpen}
        searchLogic={searchLogic}
        onLinkClick={handleLinkClick}
      />
    )
  }

  return (
    <SearchMobileDrawer
      open={open}
      onOpenChange={setOpen}
      searchLogic={searchLogic}
      onLinkClick={handleLinkClick}
      isMagazineRoute={isMagazineRoute}
    />
  )
}
