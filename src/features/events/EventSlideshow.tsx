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
  const delayMs = 250 // wait before starting on hover
  const intervalMs = 2000 // time each image stays on screen
  const fadeMs = 300 // cross-fade duration

  const hoverCapable = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia?.('(hover: hover)').matches,
    [],
  )
  const reduceMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
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

  function preloadAndDecode(src: string) {
    return new Promise<void>((resolve) => {
      if (!src) return resolve()
      const img = new Image()
      img.decoding = 'async'
      img.src = src

      const finish = () => resolve()
      const tryDecode = () => {
        // Some browsers lack decode(); resolve after load
        // @ts-expect-error - decode may not exist on type
        const d = img.decode?.()
        if (d && typeof d.then === 'function') d.then(finish).catch(finish)
        else finish()
      }

      if (img.complete) tryDecode()
      else {
        img.onload = tryDecode
        img.onerror = finish
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

    await preloadAndDecode(nextSrc)
    if (!activeRef.current) {
      switchingRef.current = false
      return
    }

    // Load into hidden buffer
    if (frontRef.current) setBSrc(nextSrc)
    else setASrc(nextSrc)

    // Preload one ahead (optional)
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

      // Gate the FIRST fade on decode of slides[0]
      await preloadAndDecode(slides[0])
      if (!activeRef.current) return

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
          transition: reduceMotion ? 'none' : `opacity ${fadeMs}ms ease-in-out`,
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
            transition: reduceMotion
              ? 'none'
              : `opacity ${fadeMs}ms ease-in-out`,
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
            transition: reduceMotion
              ? 'none'
              : `opacity ${fadeMs}ms ease-in-out`,
            willChange: 'opacity',
          }}
        />
      )}
    </div>
  )
}
