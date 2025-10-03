import type { Exhibition } from '@/types/exhibitions'
import type { Fair } from '@/types/fairs'

export type Event = Exhibition | Fair

export type EventTimeFilter = 'all' | 'current' | 'past'

/**
 * Determines if an event is upcoming (starts in the future)
 */
export function isUpcoming(event: Event): boolean {
  const now = new Date()
  const startDate = new Date(event.startDate)
  return startDate > now
}

/**
 * Determines if an event is current (currently ongoing)
 */
export function isCurrent(event: Event): boolean {
  const now = new Date()
  const startDate = new Date(event.startDate)
  const endDate = new Date(event.endDate)
  return startDate <= now && endDate >= now
}

/**
 * Determines if an event is past (already ended)
 */
export function isPast(event: Event): boolean {
  const now = new Date()
  const endDate = new Date(event.endDate)
  return endDate < now
}

/**
 * Sorts events by: upcoming (soonest first), current (ending soonest first), past (most recent first)
 */
export function sortEventsByTime(events: Event[]): Event[] {
  const upcoming = events.filter(isUpcoming)
  const current = events.filter(isCurrent)
  const past = events.filter(isPast)

  // Upcoming: sort by start date ascending (soonest first)
  upcoming.sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  )

  // Current: sort by end date ascending (ending soonest first)
  current.sort(
    (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
  )

  // Past: sort by end date descending (most recent first)
  past.sort(
    (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime(),
  )

  return [...upcoming, ...current, ...past]
}

/**
 * Filters events based on time period
 * - 'current': upcoming + current events
 * - 'past': past events only
 * - 'all': all events
 */
export function filterEventsByTime(
  events: Event[],
  filter: EventTimeFilter,
): Event[] {
  switch (filter) {
    case 'current':
      return events.filter((event) => isUpcoming(event) || isCurrent(event))
    case 'past':
      return events.filter(isPast)
    case 'all':
      return events
    default:
      return events
  }
}
