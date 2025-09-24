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
    return
  }

  return (
    <div
      className={`${selected ? 'border-accent' : 'border-neutral-200/70'} w-full rounded border-2 bg-neutral-50 p-2 shadow-2xs`}
    >
      <img
        src={images[index]}
        alt=""
        width="1920"
        height="1080"
        onClick={onClick}
        className="animate-fade-in aspect-[5/4] w-full rounded object-contain"
      />
    </div>
  )
}
