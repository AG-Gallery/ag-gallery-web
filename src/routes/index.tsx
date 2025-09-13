import { createFileRoute } from '@tanstack/react-router'

import HeroVideo from '@/components/HeroVideo'
import ProductsGrid from '@/components/ProductsGrid'
import { usePublic_GetAllProductsQuery } from '@/graphql/generated/react-query'
import { formatProducts } from '@/lib/normalizers/products'

export const Route = createFileRoute('/')({
  component: IndexPage,
})

function IndexPage() {
  const { data, isLoading, error } = usePublic_GetAllProductsQuery({
    variables: { first: 12 },
  })

  const products = formatProducts(data)

  return (
    <main>
      <HeroVideo
        posterSrc="/hero/hero-image.png"
        videoSrc="/hero/hero-video.webm"
      />
      <ProductsGrid products={products} />
    </main>
  )
}
