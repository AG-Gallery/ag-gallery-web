import type { ClassValue } from 'clsx'

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
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
