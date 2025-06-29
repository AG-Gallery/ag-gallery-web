import Image from "next/image";
import Link from "next/link";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type ExhibitionCarouselProps = {
  imageLink: string;
  title: string;
  artist: string;
  date: string;
  basis: string;
};

export default function ExhibitionCarousel({
  imageLink,
  title,
  artist,
  date,
  basis,
}: ExhibitionCarouselProps) {
  return (
    <Carousel
      opts={{ align: "center", skipSnaps: true }}
      className="animate-fade-in group relative mx-auto mb-6 w-full select-none"
    >
      <CarouselContent className="relative">
        {Array.from({ length: 6 }).map((_, i) => {
          return (
            <CarouselItem
              key={i}
              className={`${basis} basis-[75%] md:basis-[40%]`}
            >
              <Link href="/exhibitions/test">
                <Image
                  src={imageLink}
                  alt="Artist's exhibit"
                  width="1920"
                  height="1080"
                  className="object-cover md:aspect-[5/4]"
                />

                <div className="mt-2 text-sm font-light">
                  <h4>
                    <em className="font-normal">{title}</em>
                  </h4>
                  <p>{artist}</p>
                  <time className="text-xs tracking-wide">{date}</time>
                </div>
              </Link>
            </CarouselItem>
          );
        })}
      </CarouselContent>

      <CarouselPrevious className="absolute top-2/5 left-1 hidden md:left-2 lg:group-hover:flex" />

      <CarouselNext className="absolute top-2/5 right-1 hidden md:right-2 lg:group-hover:flex" />
    </Carousel>
  );
}
