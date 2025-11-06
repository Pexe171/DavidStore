import { Link, NavLink } from 'react-router-dom'
import type { FC } from 'react'

import { useCart } from '../contexts/CartContext'

const Header: FC = () => {
  const { items } = useCart()
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <header
      style={{
        background: '#0f172a',
        color: '#fff',
        padding: '1rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 20px 40px -20px rgba(15, 23, 42, 0.6)'
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          David Store
        </Link>
        <nav style={{ display: 'flex', gap: '1.5rem' }}>
          <NavLink to="/" style={({ isActive }) => ({ color: isActive ? '#38bdf8' : '#fff' })}>
            Início
          </NavLink>
          <NavLink to="/painel" style={({ isActive }) => ({ color: isActive ? '#38bdf8' : '#fff' })}>
            Painel Administrativo
          </NavLink>
          <NavLink to="/carrinho" style={({ isActive }) => ({ color: isActive ? '#38bdf8' : '#fff' })}>
            Meu Carrinho ({cartCount})
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

export default Header
