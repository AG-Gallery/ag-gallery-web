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
    <section className="-z-50 -mx-3 h-screen overflow-hidden md:-mx-10">
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
    </section>
  )
}
