import { useEffect, useRef, useState } from 'react'

import { Link } from '@tanstack/react-router'

import { Search } from 'lucide-react'

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

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement
      const scrollable = Math.max(0, doc.scrollHeight - window.innerHeight)
      const threshold = scrollable * 0.1 // 10% of page height
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
    { title: 'Exhibitions & Fairs', path: '/events?filter=current' },
    { title: 'News', path: '/news' },
    { title: 'About', path: '/about' },
  ]

  // When not floating, we want solid header styling immediately (as if scrolled)
  const solidMode = !isFloating || scrolled

  return (
    <header
      ref={headerRef}
      className={cn(
        // positioning + base spacing
        'fixed inset-x-0 top-0 z-50 w-full transition-colors duration-200 md:px-10 md:py-10',

        solidMode ? 'bg-white text-black' : 'bg-transparent text-white',
        // subtle gradient for readability only when not scrolled
        !solidMode &&
          'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:-z-10 before:h-20 before:w-full before:bg-gradient-to-b before:from-black/30 before:to-transparent md:before:h-28',
      )}
    >
      <nav className="flex items-center justify-between">
        <Link
          to="/"
          aria-label="Home"
          className="tracking flex flex-col items-start justify-center tracking-tight"
        >
          <h1 className="text-lg font-medium md:text-2xl">AG Gallery</h1>
          <span className="text-xs tracking-wider md:text-sm md:tracking-wide">
            Glendale
          </span>
        </Link>

        <div className="flex items-center">
          <nav className="hidden md:flex">
            <ul className="flex flex-col gap-5 tracking-wide md:flex-row md:gap-10">
              {navLinks.map((navLink) => {
                return (
                  <li key={navLink.path}>
                    <Link
                      to={navLink.path}
                      className={cn(
                        'relative font-medium transition-all duration-200',
                        'after:absolute after:-bottom-px after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:transition-transform after:duration-200 hover:after:scale-x-100',
                        solidMode ? 'after:bg-black' : 'after:bg-white',
                      )}
                    >
                      {navLink.title}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <button className="mr-4 ml-10 cursor-pointer transition-colors duration-200 md:mr-0">
            <Search className="w-5" />
          </button>

          <Drawer direction="top">
            <DrawerTrigger className="md:hidden">Menu</DrawerTrigger>
            <DrawerContent className="md:hidden">
              <DrawerHeader>
                <DrawerTitle className="mr-auto">Menu</DrawerTitle>
                <DrawerDescription className="sr-only">
                  Navigation menu for mobile devices
                </DrawerDescription>
              </DrawerHeader>

              <div className="mt-2 px-4">
                <nav>
                  <ul>
                    {navLinks.map((navLink) => {
                      return (
                        <li key={navLink.path}>
                          <a href={navLink.path} className="font-medium">
                            {navLink.title}
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                </nav>
              </div>

              <DrawerFooter>
                <DrawerClose className="ml-auto">
                  <Button variant="ghost">Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </nav>
    </header>
  )
}
