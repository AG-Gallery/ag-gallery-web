import { Link } from '@tanstack/react-router'

import { Search } from 'lucide-react'

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

export default function Header() {
  const navLinks = [
    { title: 'Home', path: '/' },
    { title: 'Artists', path: '/artists' },
    { title: 'Exhibitions', path: '/exhibitions?filter=current' },
    { title: 'News', path: '/news' },
    { title: 'About', path: '/about' },
  ]

  return (
    <header className="before:to-black-10 fixed top-0 right-0 left-0 z-50 w-full p-3 text-white before:absolute before:top-0 before:right-0 before:left-0 before:-z-10 before:h-20 before:w-full before:bg-gradient-to-b before:from-black/30 before:to-transparent md:px-10 md:py-10 md:before:h-28">
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
                      className="relative font-medium transition-all duration-200 after:absolute after:-bottom-px after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-white after:transition-transform after:duration-300 hover:after:scale-x-100"
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
