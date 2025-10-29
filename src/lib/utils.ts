import type { ClassValue } from 'clsx'

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

const DAY_FORMATTER = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  timeZone: 'UTC',
})

const MONTH_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  timeZone: 'UTC',
})

const YEAR_FORMATTER = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  timeZone: 'UTC',
})

const LONG_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
})

function toDate(value: string | Date): Date | null {
  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    console.warn(`Invalid date provided: ${value}`)
    return null
  }

  return date
}

export function formatDateLong(value: string | Date) {
  const date = toDate(value)

  if (!date) return ''

  return LONG_DATE_FORMATTER.format(date)
}

/**
 * Formats a given date range into a readable string.
 *
 * @param start - Start date string in format YYYY-MM-DD
 * @param end - End date string in format YYYY-MM-DD
 * @returns A human-readable string for the date range.
 */
export function formatDateRange(start: string, end: string): string {
  const startDate = toDate(start)
  const endDate = toDate(end)

  if (!startDate || !endDate) return ''

  return `${DAY_FORMATTER.format(startDate)} ${MONTH_FORMATTER.format(
    startDate,
  )} – ${DAY_FORMATTER.format(endDate)} ${MONTH_FORMATTER.format(
    endDate,
  )}, ${YEAR_FORMATTER.format(endDate)}`
}

/**
 * Formats a string to be a URL slug. This function should only
 * be used for simple strings without special characters.
 * @param s - String to slugify
 * @returns The slugified string
 */
export function slugifyName(s: string | null | undefined) {
  if (!s) return ''

  const normalized = s
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((segment) => segment.length > 0)
    .join('-')

  return normalized
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function toggleArrayValue(values: string[], value: string) {
  const set = new Set(values)
  if (set.has(value)) {
    set.delete(value)
  } else {
    set.add(value)
  }
  return Array.from(set)
}

/**
 * Formats a number with commas as thousands separators.
 *
 * @param value - The number to format.
 * @param locale - Optional: The locale to use for formatting (e.g., 'en-US').
 *                 Defaults to the user's default locale if not provided.
 * @returns A string representation of the formatted number, or an empty string
 *          if the input is not a valid number.
 */
export function formatNumber(
  value: number | string | undefined | null,
  locale?: string,
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value

  if (typeof num !== 'number' || isNaN(num)) {
    console.warn(
      `formatNumberWithCommas: Invalid input '${value}'. Expected a number or a string convertible to a number.`,
    )
    return ''
  }

  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  } catch (error) {
    console.error(
      `formatNumberWithCommas: Error formatting number '${num}' with locale '${locale}':`,
      error,
    )
    // Fallback in case of an unexpected Intl error
    return String(num)
  }
}
