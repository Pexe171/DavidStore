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

  const finalPrice = product.finalPrice ?? product.price
  const hasDiscount = finalPrice < product.price
  const price = finalPrice.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
  const originalPrice = product.price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
  const installmentValue = (finalPrice / 10).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
  const discountPercentage = hasDiscount
    ? Math.round(100 - (finalPrice / product.price) * 100)
    : null

  return (
    <article className="card product-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={product.images?.[0]}
        alt={product.name}
        style={{
          width: '100%',
          borderRadius: '20px',
          objectFit: 'cover',
          aspectRatio: '4/3'
        }}
      />
      <div className="product-card__content">
        <div className="product-card__header">
          <span className="badge badge--brand">{product.brand}</span>
          {discountPercentage ? (
            <span className="badge badge--discount">
              -{discountPercentage}% OFF
            </span>
          ) : null}
        </div>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="product-card__pricing">
          <strong>{price}</strong>
          {hasDiscount ? <span>{originalPrice}</span> : null}
        </div>
        <p className="product-card__installments">
          ou 10x de <strong>{installmentValue}</strong> sem juros no cartão
        </p>
        <div className="product-card__highlights">
          <span className="badge badge--light">Frete grátis Brasil</span>
          <span className="badge badge--light">Retira hoje</span>
          {product.highlights?.map((highlight) => (
            <span key={highlight} className="badge badge--light">
              {highlight}
            </span>
          ))}
        </div>
      </div>
      <div className="product-card__actions">
        <button className="btn-primary" onClick={handleAddToCart}>
          Comprar agora
        </button>
        <Link
          href={`/produto/${product.id}`}
          className="btn-primary btn-primary--dark"
        >
          Ver detalhes
        </Link>
      </div>
    </article>
  )
}

export default ProductCard
