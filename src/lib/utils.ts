import type { ClassValue } from 'clsx'

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a given date range into a readable string.
 *
 * @param start - Start date string in format YYYY-MM-DD
 * @param end - End date string in format YYYY-MM-DD
 * @returns A human-readable string for the date range.
 */
export function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)

  const startDay = startDate.getDate()
  const startMonth = startDate.toLocaleString('en-US', { month: 'long' })

  const endDay = endDate.getDate()
  const endMonth = endDate.toLocaleString('en-US', { month: 'long' })
  const endYear = endDate.getFullYear()

  return `${startDay} ${startMonth} – ${endDay} ${endMonth}, ${endYear}`
}

/**
 * Formats a string to be a URL slug. This function should only
 * be used for simple strings without special characters.
 * @param s - String to slugify
 * @returns The slugified string
 */
export function slugifyName(s: string | null | undefined) {
  if (!s) return ''

  const lowerCased = s.toLowerCase()
  const split = lowerCased.split(' ')
  const joined = split.join('-')

  return joined
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
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
