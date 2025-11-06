import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import type { ReactNode } from 'react'

import ProductCard from '@/components/ProductCard'
import { CartProvider } from '@/contexts/CartContext'
import type { Product } from '@/services/api'

const renderWithCart = (ui: ReactNode) => render(<CartProvider>{ui}</CartProvider>)

describe('ProductCard', () => {
  const product: Product = {
    id: '1',
    name: 'Smart TV 55" 4K',
    description: 'Tela QLED, assistente virtual e experiência imersiva.',
    brand: 'David Tech',
    price: 5999.9,
    finalPrice: 4999.9,
    categoryId: 'tv',
    rating: 4.8,
    images: ['https://example.com/tv.jpg'],
    highlights: ['4K', 'Assistente virtual']
  }

  it('não apresenta violações de acessibilidade', async () => {
    const { container } = renderWithCart(<ProductCard product={product} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
