import type { Event } from '@/lib/events/utils'

import { Link } from '@tanstack/react-router'

import { formatDateRange } from '@/lib/utils'

import HoverSlideshow from '@/components/HoverSlideshow'

type EventsGridProps = {
  events: Event[]
}

export default function EventsGrid({ events }: EventsGridProps) {
  return (
    <div className="featured-grid-container">
      <div className="featured-grid">
        {events.map((event) => {
          const eventDates = formatDateRange(event.startDate, event.endDate)

          let exhibitionSubtitle: string | undefined
          let fairSubtitle: string | undefined
          let slug: string

          if (event.type === 'exhibition') {
            if (event.artists.length === 1) {
              exhibitionSubtitle = event.artists[0].name
              slug = event.artists[0].slug
            } else {
              exhibitionSubtitle = 'Group Event'
              slug = event.slug
            }
          } else {
            fairSubtitle = event.location
            slug = event.slug
          }

          return (
            <div key={event.id} className="flex flex-col">
              <Link
                to={`/events/${event.type}s/$slug`}
                params={{ slug: event.slug }}
              >
                <HoverSlideshow
                  cover={event.coverImageUrl}
                  images={event.images}
                  alt={`An image of the event ${event.title}`}
                />
                <div className="mt-4 flex flex-col gap-1">
                  <h3 className="hover:text-accent text-lg font-medium transition-colors duration-200">
                    {event.title}
                  </h3>

                  <p className="text-sm">{eventDates}</p>
                </div>
              </Link>

              <Link
                to="/artists/$slug"
                params={{ slug: slug }}
                className={`${event.type === 'exhibition' && event.artists.length === 1 && 'hover:text-accent'} w-fit text-sm text-neutral-500 transition-colors duration-200`}
                disabled={
                  event.type !== 'exhibition' || event.artists.length > 1
                }
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
