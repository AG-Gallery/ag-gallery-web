import { createFileRoute } from '@tanstack/react-router'

import HeroVideo from '@/components/HeroVideo'

export const Route = createFileRoute('/')({
  component: IndexPage,
})

function IndexPage() {
  return (
    <main>
      <HeroVideo
        posterSrc="/hero/hero-image.png"
        videoSrc="/hero/hero-video.webm"
      />
    </main>
  )
}
