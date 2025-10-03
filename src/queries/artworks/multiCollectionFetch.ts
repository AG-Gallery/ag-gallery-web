import type { ArtworksPage, ArtworksPageParam } from './types'
import type { ArtworksSortOption } from '@/types/filters'
import type { Artwork } from '@/types/products'

import { collectionHandleToTitle } from './collections'
import { FILTER_COLLECTION_PREFIXES } from './constants'
import { fetchCollectionProductsPage } from './fetchers'
import { applyCollectionMetadataToArtworks } from './utils'

export async function fetchArtworksForCollectionHandles(
  handles: string[],
  pageParam: ArtworksPageParam,
  pageSize: number,
  sortOption: ArtworksSortOption,
): Promise<ArtworksPage> {
  const uniqueHandles = Array.from(new Set(handles.filter(Boolean)))
  if (uniqueHandles.length === 0) {
    return {
      source: 'shopify',
      items: [],
      pageInfo: { hasNextPage: false, endCursor: undefined },
      collectionHandles: [],
      cursorsByHandle: {},
      bufferedByHandle: undefined,
    }
  }

  const previousCursors = pageParam.cursorsByHandle ?? {}
  const previousBuffers = pageParam.bufferedByHandle ?? {}

  const cursors = new Map<string, string | null | undefined>()
  const buffers = new Map<string, Artwork[]>(
    uniqueHandles.map((handle) => [
      handle,
      Array.isArray(previousBuffers[handle])
        ? [...previousBuffers[handle]]
        : [],
    ]),
  )

  uniqueHandles.forEach((handle) => {
    if (Object.prototype.hasOwnProperty.call(previousCursors, handle)) {
      cursors.set(handle, previousCursors[handle])
    } else {
      cursors.set(handle, undefined)
    }
  })

  const delivered: Artwork[] = []
  const seen = new Set<string>()

  const perHandleFetchSize = Math.max(
    Math.ceil(pageSize / uniqueHandles.length),
    6,
  )

  async function loadBuffer(handle: string) {
    const cursor = cursors.get(handle)
    if (cursor === null) return
    const existingBuffer = buffers.get(handle)
    if (existingBuffer && existingBuffer.length > 0) return

    const page = await fetchCollectionProductsPage(
      handle,
      cursor ?? undefined,
      perHandleFetchSize,
      sortOption,
    )

    if (handle.startsWith(FILTER_COLLECTION_PREFIXES.categories)) {
      console.log('[category-collection:page]', {
        handle,
        after: cursor ?? undefined,
        received: page.items.length,
        hasNextPage: page.pageInfo.hasNextPage,
        titles: page.items.map((item) => item.title),
      })
    }

    const adjusted = applyCollectionMetadataToArtworks(
      handle,
      page.items,
      collectionHandleToTitle,
    )
    const existing = buffers.get(handle)
    buffers.set(handle, existing ? existing.concat(adjusted) : [...adjusted])

    const nextCursor = page.pageInfo.hasNextPage
      ? (page.pageInfo.endCursor ?? null)
      : null
    cursors.set(handle, nextCursor)
  }

  const activeHandles = new Set(uniqueHandles)

  const compareArtworks = (a: Artwork, b: Artwork): number => {
    // Shopify API already sorted results by sortOption
    // When merging multiple collections, just pick in round-robin fashion
    // to maintain relative order from each collection
    return 0
  }

  while (delivered.length < pageSize && activeHandles.size > 0) {
    for (const handle of Array.from(activeHandles)) {
      const buffer = buffers.get(handle)
      if (buffer && buffer.length > 0) continue
      const cursor = cursors.get(handle)
      if (cursor === null) {
        activeHandles.delete(handle)
        continue
      }
      try {
        await loadBuffer(handle)
        const updated = buffers.get(handle)
        if (!updated || updated.length === 0) {
          const nextCursor = cursors.get(handle)
          if (nextCursor === null) {
            activeHandles.delete(handle)
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            'Failed to load collection products for handle',
            handle,
            error,
          )
        }
        activeHandles.delete(handle)
      }
    }

    const candidates: Array<{ handle: string; artwork: Artwork }> = []
    for (const handle of activeHandles) {
      const buffer = buffers.get(handle)
      if (buffer && buffer.length > 0) {
        candidates.push({ handle, artwork: buffer[0] })
      }
    }

    if (candidates.length === 0) break

    let selected = candidates[0]
    for (let i = 1; i < candidates.length; i += 1) {
      const candidate = candidates[i]
      if (compareArtworks(candidate.artwork, selected.artwork) < 0) {
        selected = candidate
      }
    }

    const key = selected.artwork.gid || selected.artwork.id
    const buffer = buffers.get(selected.handle) ?? []
    buffer.shift()
    buffers.set(selected.handle, buffer)

    if (!key || seen.has(key)) {
      if (buffer.length === 0 && cursors.get(selected.handle) === null) {
        activeHandles.delete(selected.handle)
      }
      continue
    }

    seen.add(key)
    delivered.push(selected.artwork)

    if (buffer.length === 0 && cursors.get(selected.handle) === null) {
      activeHandles.delete(selected.handle)
    }
  }

  const nextCursors: Record<string, string | null | undefined> = {}
  const nextBuffers: Record<string, Artwork[]> = {}

  uniqueHandles.forEach((handle) => {
    const buffer = buffers.get(handle) ?? []
    const cursor = cursors.get(handle)
    nextCursors[handle] = cursor
    if (buffer.length > 0) {
      nextBuffers[handle] = buffer
    }
  })

  const hasMore = uniqueHandles.some((handle) => {
    if (handle in nextBuffers) return true // buffer only exists if length > 0
    const cursor = nextCursors[handle]
    return cursor !== null && cursor !== undefined
  })

  return {
    source: 'shopify',
    items: delivered,
    pageInfo: { hasNextPage: hasMore, endCursor: undefined },
    collectionHandles: uniqueHandles,
    cursorsByHandle: nextCursors,
    bufferedByHandle:
      Object.keys(nextBuffers).length > 0 ? nextBuffers : undefined,
  }
}
