// Shopify image URL transformation utilities
// Shopify CDN supports size transformations via URL parameters

/**
 * Transform a Shopify image URL to a specific size
 * @param url - Original Shopify image URL
 * @param size - Desired width in pixels
 * @returns Transformed URL with width parameter
 */
export function transformShopifyImage(url: string, size: number): string {
  if (!url) return url

  try {
    const urlObj = new URL(url)
    urlObj.searchParams.set('width', size.toString())
    return urlObj.toString()
  } catch {
    // If URL parsing fails, append query string manually
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}width=${size}`
  }
}

/**
 * Generate srcset for responsive images from Shopify
 * @param url - Original Shopify image URL
 * @param sizes - Array of desired widths
 * @returns srcset string for responsive images
 */
export function generateShopifySrcSet(
  url: string,
  sizes: number[] = [300, 400, 600, 700],
): string {
  return sizes
    .map((size) => `${transformShopifyImage(url, size)} ${size}w`)
    .join(', ')
}

/**
 * Generate srcset optimized for grid thumbnails (smaller sizes)
 */
export function generateShopifyGridSrcSet(url: string): string {
  return generateShopifySrcSet(url, [200, 300])
}

/**
 * Get optimal sizes attribute for image based on display context
 */
export const SHOPIFY_IMAGE_SIZES = {
  // Account for 2x retina displays
  grid: '(min-width: 1536px) 280px, (min-width: 1280px) 250px, (min-width: 1024px) 230px, (min-width: 768px) 320px, 90vw',
  // Detail page carousel
  detail: '(min-width: 1024px) 50vw, 100vw',
  // Thumbnails
  thumbnail: '150px',
} as const
