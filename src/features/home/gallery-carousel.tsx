"use client";

import type { CarouselApi } from "@/components/ui/carousel";

import { useEffect, useState } from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const plugin = Autoplay({ delay: 4000, stopOnInteraction: true });
const imageLinks = ["/images/gallery-1.jpg", "/images/gallery-2.jpg"];

export default function GalleryCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!api) return;
    const localApi = api;

    function update() {
      setCurrentSlide(localApi.selectedScrollSnap());
    }

    update();

    localApi.on("select", update);
    localApi.on("reInit", update);

    return () => {
      localApi.off("select", update);
      localApi.off("reInit", update);
    };
  }, [api]);

  return (
    <Carousel
      setApi={setApi}
      plugins={[plugin]}
      opts={{ align: "start", loop: true }}
      onMouseEnter={plugin.stop}
      onMouseLeave={() => plugin.play()}
      className="animate-fade-in group relative mx-auto mb-6 w-full"
    >
      <CarouselContent>
        {imageLinks.map((link) => {
          return (
            <CarouselItem key={link}>
              <Image
                src={link}
                alt="AG Gallery floor"
                width="1920"
                height="1080"
                className="mx-auto aspect-[16/9] object-cover select-none md:aspect-[21/9]"
              />
            </CarouselItem>
          );
        })}
      </CarouselContent>

      <div className="z-50 mt-5 flex h-4 justify-center gap-2 lg:gap-1.5">
        {api &&
          api.scrollSnapList().map((_, i) => {
            return (
              <button
                key={i}
                aria-label={`Go to gallery image ${i + 1}.`}
                onClick={() => {
                  api?.scrollTo(i);
                  api?.plugins().autoplay.play();
                }}
                className={`${currentSlide === i ? "border-neutral-300 bg-neutral-200" : "border-neutral-200"} top-0 size-[18px] rounded-full border-3 bg-neutral-100 select-none hover:cursor-pointer md:size-4`}
              ></button>
            );
          })}
      </div>

      <CarouselPrevious
        variant="default"
        className="animate-fade-in absolute left-1 hidden md:left-2 lg:group-hover:flex"
      />

      <CarouselNext
        variant="default"
        className="animate-fade-in absolute right-1 hidden md:right-2 lg:group-hover:flex"
      />
    </Carousel>
  );
}
