import type { CarouselApi } from '@/components/ui/carousel'

import { useEffect, useState } from 'react'

import useEmblaCarousel from 'embla-carousel-react'

import {
  CarouselContent,
  CarouselItem,
  Carousel as CarouselRoot,
} from '@/components/ui/carousel'

import CarouselThumbnail from './CarouselThumbnail'

type CarouselProps = {
  images: string[]
}

export default function Carousel({ images }: CarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [thumbsRef, thumbsApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true,
  })

  useEffect(() => {
    if (!carouselApi) return

    const update = () => {
      const idx = carouselApi.selectedScrollSnap()
      setCurrentSlide(idx)
      // Keep the selected thumbnail in view, scrolling the thumbs by 1 when needed
      thumbsApi?.scrollTo(idx)
    }
    update()

    carouselApi.on('select', update).on('reInit', update)
  }, [carouselApi, thumbsApi])

  return (
    <div className="flex flex-col items-center place-self-start self-start">
      <CarouselRoot
        setApi={setCarouselApi}
        opts={{ loop: true }}
        className="aspect-[5/4] max-w-[700px]"
      >
        <CarouselContent>
          {images.map((image, index) => {
            return (
              <CarouselItem key={image}>
                <div className="bg-neutral-100">
                  <img
                    src={image}
                    alt=""
                    width="1920"
                    height="1080"
                    className="animate-fade-in mx-auto aspect-[5/4] rounded-md object-contain"
                    fetchPriority={index === 0 ? 'high' : 'low'}
                  />
                </div>
              </CarouselItem>
            )
          })}
        </CarouselContent>
      </CarouselRoot>

      <div className="mt-3 w-full max-w-[700px]">
        <div ref={thumbsRef} className="overflow-hidden">
          <div className="-ml-2 flex">
            {images.map((_, index) => (
              <div
                key={index}
                className="min-w-0 shrink-0 basis-[calc(100%/5.5)] pl-2"
              >
                <CarouselThumbnail
                  images={images}
                  selected={index === currentSlide}
                  index={index}
                  onClick={() => {
                    setCurrentSlide(index)
                    carouselApi?.scrollTo(index)
                    thumbsApi?.scrollTo(index)
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
