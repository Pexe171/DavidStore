'use client'

import type { FC } from 'react'

import { useCart } from '@/contexts/CartContext'
import type { Product } from '@/services/api'

type ProductDetailContentProps = {
  product: Product
}

const ProductDetailContent: FC<ProductDetailContentProps> = ({ product }) => {
  const { addItem } = useCart()

  const finalPriceValue = product.finalPrice ?? product.price

  const finalPrice = finalPriceValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })

  const originalPrice = product.price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })

  return (
    <section className="container" style={{ padding: '2rem 0 4rem' }}>
      <div
        className="card"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {product.images?.map((image) => (
            <img
              key={image}
              src={image}
              alt={product.name}
              style={{ width: '100%', borderRadius: '24px' }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <span className="badge">{product.brand}</span>
          <h1 style={{ margin: 0 }}>{product.name}</h1>
          <p style={{ color: '#64748b', fontSize: '1.125rem' }}>
            {product.description}
          </p>
          <div>
            <strong style={{ fontSize: '2.5rem' }}>{finalPrice}</strong>
            <p style={{ margin: 0, color: '#94a3b8' }}>
              De {originalPrice} por {finalPrice}
            </p>
          </div>
          <ul
            style={{
              listStyle: 'disc',
              paddingLeft: '1.5rem',
              color: '#334155'
            }}
          >
            {product.highlights?.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
          <button className="btn-primary" onClick={() => addItem(product, 1)}>
            Adicionar ao carrinho
          </button>
        </div>
      </div>
    </section>
  )
}

export default ProductDetailContent
