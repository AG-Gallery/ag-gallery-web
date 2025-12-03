import { cn } from '@/lib/utils'

type CarouselThumbnailProps = {
  images?: string[]
  selected: boolean
  index: number
  onClick: () => void
}

export default function CarouselThumbnail({
  images,
  selected,
  index,
  onClick,
}: CarouselThumbnailProps) {
  if (!images || images.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'mx-auto w-full rounded border-2 bg-transparent p-2 shadow-2xs',
        selected ? 'border-accent' : 'border-neutral-200/70',
      )}
    >
      <img
        src={images[index]}
        width="1920"
        height="1080"
        onClick={onClick}
        className="animate-fade-in aspect-[5/4] w-full rounded object-contain"
      />
    </div>
  )
}
