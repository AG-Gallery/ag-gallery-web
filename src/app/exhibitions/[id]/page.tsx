import Image from "next/image";
import Link from "next/link";

import Grid from "@/components/grid";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function ExhibitionPage() {
  return (
    <>
      <div>
        <h2 className="text-2xl tracking-tight md:text-[28px]">
          Exhibition Title
        </h2>
        <span className="text-sm tracking-wide text-neutral-600">Artist</span>
      </div>

      <section className="animate-fade-in my-6 flex items-center justify-between">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-neutral-400">Now Open</p>
            <time>June 20 – July 14, 2025</time>
          </div>

          <div>
            <p className="text-neutral-400">Opening Reception</p>
            <time>Friday, June 20, 2025, 6-8pm</time>
          </div>
        </div>

        <button className="m-0 size-fit cursor-pointer rounded-md border border-neutral-200 bg-gradient-to-b from-neutral-50 to-transparent px-4 py-2 md:px-8 md:py-4">
          Request Information
        </button>
      </section>

      <section className="my-5 md:my-14">
        <Carousel
          opts={{ align: "center", skipSnaps: true }}
          className="animate-fade-in group relative mx-auto mb-6 w-full select-none"
        >
          <CarouselContent className="relative">
            {Array.from({ length: 4 }).map((_, i) => {
              return (
                <CarouselItem key={i} className="basis-[75%]">
                  <Image
                    src="/images/exhibit-2.webp"
                    alt="Artist's exhibit"
                    width="1920"
                    height="1080"
                    className="aspect-[5/4] object-cover"
                  />
                </CarouselItem>
              );
            })}
          </CarouselContent>

          <CarouselPrevious className="absolute left-1 hidden md:left-2 lg:group-hover:flex" />

          <CarouselNext className="absolute right-1 hidden md:right-2 lg:group-hover:flex" />
        </Carousel>
      </section>

      {/* Exhibit Description */}
      <section className="mx-auto my-8 flex max-w-xl justify-center font-light md:my-10">
        <p className="tracking-wide text-pretty">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis,
          tempora. Dicta, earum ut itaque corrupti officiis blanditiis provident
          eveniet sint. Facilis ab blanditiis obcaecati deleniti nisi debitis
          fugiat pariatur ratione elit amet. Lorem ipsum, dolor sit amet
          consectetur adipisicing elit. Saepe nulla praesentium ut cum nobis
          dolorum aut magni ab sit ullam eaque qui quisquam veritatis, nihil,
          libero quaerat voluptatum commodi iusto.
        </p>
      </section>

      <section className="my-8 md:my-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl">Selected Works</h2>
          <Link
            href="/"
            className="hover:text-foreground text-sm text-neutral-500 transition-colors duration-200"
          >
            View all
          </Link>
        </div>

        <Grid type="artwork" />
      </section>
    </>
  );
}
