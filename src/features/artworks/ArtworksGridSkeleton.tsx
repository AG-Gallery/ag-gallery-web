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
          <div
            key={idx}
            className="animate-fade-in mb-2 flex w-full flex-col items-start justify-start"
          >
            <div className="relative flex aspect-[5/4] w-full items-center justify-center overflow-hidden rounded border border-neutral-200/80 bg-neutral-50 p-2 lg:p-5">
              <Skeleton
                aria-hidden
                className="pointer-events-none absolute inset-2 animate-pulse rounded bg-neutral-200/80 lg:inset-4 2xl:inset-6"
              />
            </div>
            <div className="mt-2 md:mt-4">
              <Skeleton className="mb-1 h-5 w-3/4 rounded bg-neutral-200/80" />
              <Skeleton className="mb-2 h-4 w-1/2 rounded bg-neutral-200/80" />
              <Skeleton className="h-3 w-2/3 rounded bg-neutral-200/80" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
