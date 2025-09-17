import type { Exhibition } from '@/types/exhibitions'
import type { Fair } from '@/types/fairs'

import { Link, useLocation } from '@tanstack/react-router'

import { formatDateRange } from '@/lib/utils'
import { MinimalArtist } from '@/types/artists'

type EventsGridProps = {
  events: Exhibition[] | Fair[]
}

export default function EventsGrid({ events }: EventsGridProps) {
  const pathname = useLocation({
    select: (location) => location.pathname,
  })

  return (
    <div className="featured-grid-container">
      <div className="featured-grid">
        {events.map((event) => {
          const eventDates = formatDateRange(event.startDate, event.endDate)

          let exhibitionSubtitle: string | undefined
          let fairSubtitle: string | undefined
          let slug: string

          if (event.type === 'exhibition') {
            console.log(event)
            if (event.isGroup === false) {
              exhibitionSubtitle = event.artist.name
              slug = event.artist.slug
            } else {
              exhibitionSubtitle = 'Group Event'
              slug = event.slug
            }
          } else {
            fairSubtitle = 'Some Location'
            slug = event.slug
          }

          return (
            <div key={event.id} className="flex flex-col">
              <Link to="/events/$slug" params={{ slug: event.slug }}>
                <img
                  src={event.coverImageUrl}
                  alt={`An image of the event ${event.title}`}
                  width={1920}
                  height={1080}
                  className="aspect-[5/4] rounded object-cover"
                />
                <div className="mt-4 flex flex-col gap-1">
                  <h3 className="hover:text-accent text-lg font-medium transition-colors duration-200">
                    {event.title}
                  </h3>

                  <span>{eventDates}</span>
                </div>
              </Link>

              <Link
                to="/artists/$slug"
                params={{ slug: slug }}
                className={` ${event.type === 'exhibition' && !event.isGroup && 'hover:text-accent'} w-fit transition-colors duration-200`}
                disabled={event.type !== 'exhibition' || event.isGroup}
              >
                {exhibitionSubtitle ?? fairSubtitle}
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
