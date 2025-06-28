"use client";

import { useState } from "react";
import Link from "next/link";

import SearchIcon from "./icons/search-icon";
import { NavLink } from "./navlink";
import { Button } from "./ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";

const navPages = [
  { title: "Home", link: "/" },
  { title: "Artists", link: "/artists" },
  { title: "Exhibitions", link: "/exhibitions?filter=current" },
  { title: "News", link: "/news" },
  { title: "About", link: "/about" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  const navLinks = (
    <ul className="flex flex-col gap-5 tracking-wide md:flex-row md:gap-10 md:text-sm">
      {navPages.map((page) => {
        return (
          <li key={page.title}>
            <NavLink href={page.link}>{page.title}</NavLink>
          </li>
        );
      })}
    </ul>
  );

  return (
    <header className="bg-background fixed top-0 right-0 left-0 z-50 w-full px-3 py-4 md:px-10">
      <nav className="flex items-center justify-between">
        <Link
          href="/"
          aria-label="Home"
          className="tracking flex flex-col items-start justify-center tracking-tight"
        >
          <h1 className="text-xl md:text-2xl">AG Gallery</h1>
          <span className="text-xs font-light tracking-wider md:text-sm md:tracking-wide">
            Glendale
          </span>
        </Link>

        <div className="flex items-center">
          <div className="hidden md:flex">{navLinks}</div>

          <button className="mr-4 ml-10 cursor-pointer text-neutral-700 transition-colors duration-200 hover:text-black md:mr-0">
            <SearchIcon />
          </button>

          <Drawer direction="top" open={open} onOpenChange={setOpen}>
            <DrawerTrigger className="md:hidden">Menu</DrawerTrigger>
            <DrawerContent className="md:hidden">
              <DrawerHeader>
                <DrawerTitle className="mr-auto">Menu</DrawerTitle>
                <DrawerDescription className="sr-only">
                  Navigation menu for mobile devices
                </DrawerDescription>
              </DrawerHeader>

              <div className="mt-2 px-4" onClick={() => setOpen(false)}>
                {navLinks}
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
  );
}
