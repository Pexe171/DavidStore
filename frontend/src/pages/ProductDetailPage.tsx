import { useEffect, useState } from 'react'
import type { FC } from 'react'
import { useParams } from 'react-router-dom'

import { fetchProduct } from '../services/api'
import type { Product } from '../services/api'
import { useCart } from '../contexts/CartContext'

const ProductDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const { addItem } = useCart()

  useEffect(() => {
    const load = async (): Promise<void> => {
      if (!id) {
        setProduct(null)
        setLoading(false)
        return
      }
      try {
        const response = await fetchProduct(id)
        setProduct(response)
      } catch (error) {
        console.error('Erro ao buscar produto:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <section className="container" style={{ padding: '2rem 0 4rem' }}>
        <p>Buscando detalhes desse produto exclusivo...</p>
      </section>
    )
  }

  if (!product) {
    return (
      <section className="container" style={{ padding: '2rem 0 4rem' }}>
        <p>Produto não encontrado. Talvez ele esteja em pré-venda.</p>
      </section>
    )
  }

  const finalPrice = product.finalPrice.toLocaleString('pt-BR', {
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
            <img key={image} src={image} alt={product.name} style={{ width: '100%', borderRadius: '24px' }} />
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <span className="badge">{product.brand}</span>
          <h1 style={{ margin: 0 }}>{product.name}</h1>
          <p style={{ color: '#64748b', fontSize: '1.125rem' }}>{product.description}</p>
          <div>
            <strong style={{ fontSize: '2.5rem' }}>{finalPrice}</strong>
            <p style={{ margin: 0, color: '#94a3b8' }}>De {originalPrice} por {finalPrice}</p>
          </div>
          <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', color: '#334155' }}>
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

export default ProductDetailPage
