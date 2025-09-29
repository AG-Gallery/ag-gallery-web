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
            <div className="flex w-full flex-col items-center justify-center rounded border border-neutral-200/80 bg-neutral-50 p-2 lg:p-4 2xl:p-6">
              <Skeleton className="aspect-[5/4] size-full rounded bg-neutral-50" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
