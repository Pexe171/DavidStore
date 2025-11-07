'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { FC } from 'react'

import { useCart } from '@/contexts/CartContext'

const Header: FC = () => {
  const { items } = useCart()
  const pathname = usePathname()
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0)

  const isActive = (href: string): boolean => pathname === href

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
      <div
        className="container"
        style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}
      >
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          David Store
        </Link>
        <nav style={{ display: 'flex', gap: '1.5rem' }}>
          <Link href="/" style={{ color: isActive('/') ? '#38bdf8' : '#fff' }}>
            Início
          </Link>
          <Link
            href="/painel"
            style={{ color: isActive('/painel') ? '#38bdf8' : '#fff' }}
          >
            Painel Administrativo
          </Link>
          <Link
            href="/carrinho"
            style={{ color: isActive('/carrinho') ? '#38bdf8' : '#fff' }}
          >
            Meu Carrinho ({cartCount})
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default Header
