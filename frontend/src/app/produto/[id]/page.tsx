import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import ProductDetailContent from '@/components/ProductDetailContent'
import { fetchProduct } from '@/services/api'

type ProductPageProps = {
  params: { id: string }
}

export const generateMetadata = async ({ params }: ProductPageProps): Promise<Metadata> => {
  try {
    const product = await fetchProduct(params.id)
    return {
      title: `${product.name} - David Store`,
      description: product.description
    }
  } catch (error) {
    console.error('Erro ao gerar metadata para produto:', error)
    return {
      title: 'Produto - David Store'
    }
  }
}

const ProductDetailPage = async ({ params }: ProductPageProps): Promise<JSX.Element> => {
  try {
    const product = await fetchProduct(params.id)
    return <ProductDetailContent product={product} />
  } catch (error) {
    console.error('Erro ao carregar produto para SSR:', error)
    notFound()
  }

  return notFound()
}

export default ProductDetailPage
