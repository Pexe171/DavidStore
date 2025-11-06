'use client'

import Link from 'next/link'
import type { FC } from 'react'

import { useCart } from '@/contexts/CartContext'
import type { Product } from '@/services/api'

type ProductCardProps = {
  product: Product
}

const ProductCard: FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem(product, 1)
  }

  const price = product.finalPrice.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })

  const originalPrice = product.price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })

  return (
    <article className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <img
        src={product.images?.[0]}
        alt={product.name}
        style={{ width: '100%', borderRadius: '20px', objectFit: 'cover', aspectRatio: '4/3' }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <span className="badge">{product.brand}</span>
        <h3 style={{ margin: 0 }}>{product.name}</h3>
        <p style={{ color: '#64748b' }}>{product.description}</p>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <strong style={{ fontSize: '1.5rem' }}>{price}</strong>
          <span style={{ color: '#94a3b8', textDecoration: 'line-through' }}>{originalPrice}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {product.highlights?.map((highlight) => (
            <span key={highlight} className="badge" style={{ background: '#ecfeff' }}>
              {highlight}
            </span>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button className="btn-primary" onClick={handleAddToCart} style={{ flex: 1 }}>
          Comprar agora
        </button>
        <Link href={`/produto/${product.id}`} className="btn-primary" style={{ flex: 1, background: '#1f2937' }}>
          Ver detalhes
        </Link>
      </div>
    </article>
  )
}

export default ProductCard
