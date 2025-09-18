type HeroVideoProps = {
  posterSrc: string
  videoSrc: string
  fallbackSrc?: string
}

/**
 *
 * @description
 * A background video intended for the hero section of a page.
 */
export default function HeroVideo({ posterSrc, videoSrc }: HeroVideoProps) {
  return (
    <section className="relative -z-50 -mx-3 -mt-[var(--header-height)] h-[85vh] overflow-hidden md:-mx-10 md:h-[90vh]">
      <video
        autoPlay
        muted
        loop
        playsInline
        poster={posterSrc}
        className="size-full object-cover"
      >
        <source src={videoSrc} type="video/webm" />
      </video>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent md:from-black/30" />
    </section>
  )
}
