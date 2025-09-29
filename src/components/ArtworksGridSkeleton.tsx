import { Skeleton } from '@/components/ui/skeleton'

type ArtworksGridSkeletonProps = {
  count?: number
}

export default function ArtworksGridSkeleton({
  count = 12,
}: ArtworksGridSkeletonProps) {
  const items = Array.from({ length: count })

  return (
    <div className="featured-grid-container">
      <div className="featured-grid">
        {items.map((_, idx) => (
          <div key={idx} className="animate-fade-in flex flex-col items-start">
            <div className="relative flex aspect-[5/4] w-full items-center justify-center overflow-hidden rounded border border-neutral-200/80 bg-neutral-50 p-2 lg:p-5">
              <Skeleton
                aria-hidden
                className="pointer-events-none absolute inset-2 rounded bg-neutral-200/80 animate-pulse lg:inset-4 2xl:inset-6"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
