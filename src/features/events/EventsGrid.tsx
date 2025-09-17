import type { Exhibition } from '@/types/exhibitions'
import type { Fair } from '@/types/fairs'

import { Link } from '@tanstack/react-router'

import { formatDateRange } from '@/lib/utils'

type EventsGridProps = {
  events: Exhibition[] | undefined
}

export default function EventsGrid({ events }: EventsGridProps) {
  return (
    events &&
    events.length !== 0 && (
      <div className="featured-grid-container">
        <div className="featured-grid">
          {events.map((event) => {
            const eventDates = formatDateRange(event.startDate, event.endDate)
            const artist = event.isGroup === false && event.artist

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

                    {artist ? (
                      <Link
                        to="/artists/$slug"
                        params={{ slug: artist.slug }}
                        className="hover:text-accent w-fit transition-colors duration-200"
                      >
                        {artist.name}
                      </Link>
                    ) : (
                      <span>Group Event</span>
                    )}
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    )
  )
}
