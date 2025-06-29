import Image from "next/image";
import Link from "next/link";

import { NavLink } from "@/components/navlink";

export default function ExhibitionsPage() {
  return (
    <>
      <h2 className="text-2xl tracking-tight md:text-[28px]">Exhibitions</h2>

      <div className="animate-fade-in mt-6 grid grid-cols-1 md:mt-14 md:grid-cols-[150px_1fr]">
        <aside className="mb-2 md:mb-0">
          <nav
            aria-label="Filter exhibitions"
            className="flex gap-2 text-neutral-700 md:flex-col md:gap-0 md:text-sm"
          >
            <NavLink
              href="/exhibitions?filter=current"
              className="w-fit py-1 pr-3 text-neutral-400 transition-colors duration-200 hover:text-black md:pr-0"
            >
              Current
            </NavLink>
            <NavLink
              href="/exhibitions?filter=past"
              className="w-fit py-1 text-neutral-400 transition-colors duration-200 hover:text-black"
            >
              Past
            </NavLink>
          </nav>
        </aside>

        <section className="grid gap-3 lg:grid-cols-3 lg:gap-4 2xl:gap-5">
          {Array.from({ length: 9 }).map((_, i) => {
            return (
              <Link key={i} href="/exhibitions/test" className="flex flex-col">
                <Image
                  src="/images/exhibit-1.jpg"
                  alt="Artist's exhibit"
                  width="1920"
                  height="1080"
                  className="aspect-[5/4] object-cover"
                />

                <div className="mt-2 font-light md:text-sm">
                  <h3>
                    <em className="font-normal">Title</em>
                  </h3>
                  <p>Artist</p>
                  <time className="text-sm tracking-wide md:text-xs">Date</time>
                </div>
              </Link>
            );
          })}
        </section>
      </div>
    </>
  );
}
