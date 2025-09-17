import type { Exhibition } from '@/types/exhibitions'
import type { Fair } from '@/types/fairs'

import { Link } from '@tanstack/react-router'

type EventGridProps = {
  events: Exhibition[] | Fair[] | undefined
}

export default function EventGrid({ events }: EventGridProps) {
  return (
    events &&
    events.length !== 0 && (
      <div className="featured-grid-container">
        <div className="featured-grid">
          {events.map((event) => {
            return (
              <div key={event.id}>
                <Link to="/events/$slug" params={{ slug: event.slug }}>
                  <img
                    src={event.coverImageUrl}
                    alt={`An image of the event ${event.title}`}
                    width={1920}
                    height={1080}
                    className="aspect-[5/4] rounded object-cover"
                  />
                  <div className="mt-5 flex flex-col">
                    <h3 className="hover:text-accent text-lg font-medium transition-colors duration-200">
                      {event.title}
                    </h3>
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
