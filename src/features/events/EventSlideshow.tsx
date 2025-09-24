import { useEffect, useMemo, useRef, useState } from 'react'

export default function EventSlideshow({
  cover,
  images,
  alt,
}: {
  cover: string
  images: string[]
  alt: string
}) {
  const delayMs = 200
  const intervalMs = 2000
  const fadeMs = 200

  const hoverCapable = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: hover)').matches,
    [],
  )
  const reduceMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  // Clean input: drop falsy + duplicates of cover
  const slides = useMemo(
    () => images.filter(Boolean).filter((u) => u !== cover),
    [images, cover],
  )

  const [playing, setPlaying] = useState(false)

  // Double-buffered overlays for smooth cross-fades
  const [aSrc, setASrc] = useState<string | null>(null)
  const [bSrc, setBSrc] = useState<string | null>(null)
  const [frontIsA, setFrontIsA] = useState(true)
  const frontRef = useRef(true) // keep latest value inside timers

  const idxRef = useRef(0)
  const delayRef = useRef<number | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const switchingRef = useRef(false)
  const activeRef = useRef(false) // cancels async work on mouse out

  const clearTimers = () => {
    if (delayRef.current) {
      clearTimeout(delayRef.current)
      delayRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const stop = () => {
    activeRef.current = false
    clearTimers()
    setPlaying(false)
    setASrc(null)
    setBSrc(null)
    setFrontIsA(true)
    frontRef.current = true
    idxRef.current = 0
    switchingRef.current = false
  }

  // Decode helper with a tiny cache to avoid decoding the same URL repeatedly
  const decodedSetRef = useRef<Set<string>>(new Set())
  function decodeImage(src: string) {
    return new Promise<void>((resolve) => {
      if (!src) return resolve()
      const cache = decodedSetRef.current
      if (cache.has(src)) return resolve()

      const img = new Image()
      img.decoding = 'async'
      img.src = src

      const finalize = () => {
        cache.add(src)
        resolve()
      }
      const canDecode = typeof img.decode === 'function'
      if (img.complete) {
        if (canDecode) {
          img.decode().then(finalize).catch(finalize)
        } else finalize()
      } else {
        img.onload = () => {
          if (canDecode) {
            img.decode().then(finalize).catch(finalize)
          } else finalize()
        }
        img.onerror = finalize
      }
    })
  }

  const scheduleNext = () => {
    timeoutRef.current = window.setTimeout(
      runTick,
      Math.max(intervalMs, fadeMs + 50),
    )
  }

  const runTick = async () => {
    if (!activeRef.current || switchingRef.current || slides.length === 0)
      return
    switchingRef.current = true

    const nextIdx = (idxRef.current + 1) % slides.length
    const nextSrc = slides[nextIdx]

    await decodeImage(nextSrc)

    // Load into hidden buffer
    if (frontRef.current) setBSrc(nextSrc)
    else setASrc(nextSrc)

    // Preload one ahead
    const pre = new Image()
    pre.src = slides[(nextIdx + 1) % slides.length]

    // Ensure src commit lands before flipping opacity
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFrontIsA((wasA) => {
          const nowA = !wasA
          frontRef.current = nowA
          return nowA
        })
        idxRef.current = nextIdx
        switchingRef.current = false
        if (activeRef.current) scheduleNext()
      })
    })
  }

  const start = () => {
    if (!hoverCapable || reduceMotion || slides.length === 0) return
    if (delayRef.current) return // already queued
    activeRef.current = true

    delayRef.current = window.setTimeout(async () => {
      if (!activeRef.current) return
      idxRef.current = 0

      // Gate the first fade on decode of slides[0]
      await decodeImage(slides[0])

      // Put first slide into A, keep hidden, then flip visible after commit
      setASrc(slides[0])
      setFrontIsA(false)
      frontRef.current = false

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!activeRef.current) return
          setPlaying(true) // fades cover out
          setFrontIsA(true) // fades A in
          frontRef.current = true

          // Preload next
          if (slides.length > 1) {
            const pre = new Image()
            pre.src = slides[1]
          }

          scheduleNext()
        })
      })
    }, delayMs)
  }

  useEffect(() => stop, []) // cleanup on unmount

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={start}
      onMouseLeave={stop}
    >
      {/* Base cover image */}
      <img
        src={cover}
        alt={alt}
        loading="lazy"
        decoding="async"
        draggable={false}
        referrerPolicy="no-referrer"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transition: reduceMotion ? 'none' : `opacity ${fadeMs}ms ease-in`,
          opacity: playing ? 0 : 1,
        }}
      />

      {/* Overlay A */}
      {aSrc && (
        <img
          src={aSrc}
          alt=""
          aria-hidden="true"
          decoding="async"
          draggable={false}
          referrerPolicy="no-referrer"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: playing && frontIsA ? 1 : 0,
            transition: reduceMotion ? 'none' : `opacity ${fadeMs}ms ease-in`,
            willChange: 'opacity',
          }}
        />
      )}

      {/* Overlay B */}
      {bSrc && (
        <img
          src={bSrc}
          alt=""
          aria-hidden="true"
          decoding="async"
          draggable={false}
          referrerPolicy="no-referrer"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: playing && !frontIsA ? 1 : 0,
            transition: reduceMotion ? 'none' : `opacity ${fadeMs}ms ease-in`,
            willChange: 'opacity',
          }}
        />
      )}
    </div>
  )
}
