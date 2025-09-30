import { useEffect, useRef, useState } from 'react'

import { Link, useLocation } from '@tanstack/react-router'

import { Search } from 'lucide-react'

import Bag from '@/features/bag/bag'
import { cn } from '@/lib/utils'

import { Button } from './ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './ui/drawer'

type HeaderProps = {
  isFloating?: boolean
}

export default function Header({ isFloating = false }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const headerRef = useRef<HTMLElement | null>(null)
  const pathname = useLocation({
    select: (location) => location.pathname,
  })

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement
      const scrollable = Math.max(0, doc.scrollHeight - window.innerHeight)
      const threshold = scrollable * 0.1
      setScrolled(window.scrollY > threshold)
    }
    const onResize = () => {
      const h = headerRef.current?.getBoundingClientRect().height
      if (typeof h === 'number' && !Number.isNaN(h)) {
        document.documentElement.style.setProperty('--header-height', `${h}px`)
      }
      onScroll()
    }

    onResize()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const navLinks = [
    { title: 'Home', path: '/' },
    { title: 'Artists', path: '/artists' },
    { title: 'Artworks', path: '/artworks' },
    { title: 'Exhibitions & Fairs', path: '/events?filter=current' },
    { title: 'Magazine', path: '/magazine' },
    { title: 'About', path: '/about' },
  ]

  // When not floating, we want solid header styling immediately (as if scrolled)
  const solidMode = !isFloating || scrolled
  const isMagazineRoute = pathname.startsWith('/magazine')

  return (
    <header
      ref={headerRef}
      className={cn(
        'fixed inset-x-0 top-0 z-50 w-full p-4 transition-colors duration-200 md:p-8 xl:p-10',
        isMagazineRoute
          ? 'bg-black text-white'
          : solidMode
            ? 'bg-white text-black'
            : 'bg-transparent text-white',
      )}
    >
      <nav className="flex items-center justify-between">
        <Link
          to="/"
          aria-label="Home"
          className="tracking flex flex-col items-start justify-center tracking-tight"
        >
          <h1 className="font-playfair text-lg font-medium md:text-2xl md:text-[1.75rem]">
            AG Gallery
          </h1>
          <p className="text-xs tracking-wider md:text-sm md:tracking-wide">
            Glendale
          </p>
        </Link>

        <div className="flex items-center">
          <nav className="hidden md:flex">
            <ul className="flex flex-col gap-5 tracking-wide md:flex-row md:gap-10">
              {navLinks.map((navLink) => (
                <li key={navLink.path}>
                  <Link
                    to={navLink.path}
                    className={cn(
                      'relative font-medium transition-all duration-200',
                      'after:absolute after:-bottom-px after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:transition-transform after:duration-200 hover:after:scale-x-100',
                      isMagazineRoute
                        ? 'after:bg-white'
                        : solidMode
                          ? 'after:bg-black'
                          : 'after:bg-white',
                    )}
                  >
                    {navLink.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mr-4 ml-10 flex gap-4 md:mr-0 md:gap-4">
            <button className="cursor-pointer p-2 transition-colors duration-200">
              <Search className="w-5" />
            </button>

            <Bag />
          </div>

          <Drawer direction="top">
            <DrawerTrigger className="md:hidden">Menu</DrawerTrigger>
            <DrawerContent
              className={cn(
                'md:hidden',
                isMagazineRoute ? 'bg-black text-white' : 'bg-white text-black',
              )}
            >
              <DrawerHeader>
                <DrawerTitle
                  className={`mr-auto ${isMagazineRoute ? 'text-white' : 'text-black'}`}
                >
                  Menu
                </DrawerTitle>
                <DrawerDescription className="sr-only">
                  Navigation menu for mobile devices
                </DrawerDescription>
              </DrawerHeader>

              <div className="mt-2 px-4">
                <nav>
                  <ul>
                    {navLinks.map((navLink) => (
                      <li key={navLink.path} className="mb-5">
                        <Link to={navLink.path} className="text-lg font-medium">
                          {navLink.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>

              <DrawerFooter>
                <DrawerClose className="ml-auto">
                  <Button
                    variant="ghost"
                    className={isMagazineRoute ? 'text-white' : 'text-black'}
                  >
                    Close
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </nav>
    </header>
  )
}
