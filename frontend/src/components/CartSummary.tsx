import { Link } from 'react-router-dom'
import type { FC } from 'react'

import { useCart } from '../contexts/CartContext'

const CartSummary: FC = () => {
  const { items, total, removeItem, clearCart } = useCart()

  if (!items.length) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <h2>Seu carrinho está vazio</h2>
        <p>Que tal explorar nossas ofertas inteligentes e montar sua lista de desejos?</p>
        <Link to="/" className="btn-primary" style={{ marginTop: '1rem' }}>
          Ver ofertas
        </Link>
      </div>
    )
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2>Resumo do carrinho</h2>
        <p style={{ color: '#64748b' }}>Produtos selecionados para uma experiência completa.</p>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {items.map((item) => (
          <li key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <img src={item.image} alt={item.name} style={{ width: '72px', height: '72px', borderRadius: '16px', objectFit: 'cover' }} />
            <div style={{ flex: 1 }}>
              <strong>{item.name}</strong>
              <p style={{ color: '#94a3b8', margin: '0.25rem 0' }}>Quantidade: {item.quantity}</p>
            </div>
            <span style={{ fontWeight: 600 }}>
              {(item.finalPrice * item.quantity).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </span>
            <button
              onClick={() => removeItem(item.id)}
              style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}
            >
              Remover
            </button>
          </li>
        ))}
      </ul>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ margin: 0, color: '#94a3b8' }}>Total David Prime</p>
          <strong style={{ fontSize: '1.75rem' }}>
            {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </strong>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={clearCart} className="btn-primary" style={{ background: '#1f2937' }}>
            Limpar carrinho
          </button>
          <Link to="/checkout" className="btn-primary">
            Finalizar compra
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CartSummary
