import Link from 'next/link'
import type { FC } from 'react'

import type { Product } from '@/services/api'

type FlashDealsProps = {
  products: Product[]
}

const FlashDeals: FC<FlashDealsProps> = ({ products }) => {
  if (!products.length) {
    return null
  }

  return (
    <section className="container flash-deals">
      <header className="flash-deals__header">
        <div>
          <span className="badge badge--highlight">Ofertas relâmpago</span>
          <h2 className="section-title">Corre que está voando</h2>
          <p>
            Estoque limitado com parcelamento em até 24x sem juros. Aproveite a
            seleção inspirada na Casas Bahia com curadoria premium David Store.
          </p>
        </div>
        <Link href="/ofertas" className="btn-primary btn-primary--ghost">
          Ver todas as ofertas
        </Link>
      </header>
      <div className="flash-deals__grid">
        {products.slice(0, 4).map((product) => {
          const finalPrice = product.finalPrice ?? product.price
          const price = finalPrice.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })

          return (
            <article key={product.id} className="flash-deals__card">
              <span className="flash-deals__tag">{product.brand}</span>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <strong>{price}</strong>
              <Link href={`/produto/${product.id}`}>Garanta já</Link>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default FlashDeals
