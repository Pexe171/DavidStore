'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, type FC, type FormEvent } from 'react'

import { useCart } from '@/contexts/CartContext'

const Header: FC = () => {
  const { items } = useCart()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0)

  useEffect(() => {
    setSearchTerm(searchParams.get('busca') ?? '')
  }, [searchParams])

  const isActive = (href: string): boolean => pathname === href

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const query = searchTerm.trim()

    if (!query) {
      router.push('/')
      return
    }

    router.push(`/?busca=${encodeURIComponent(query)}`)
  }

  return (
    <header className="store-header">
      <div className="store-header__announcement">
        <span>
          🎉 Ganhe <strong>11% de desconto</strong> usando o cupom{' '}
          <code>DAVID11</code> na primeira compra pelo app.
        </span>
        <Link href="/" aria-label="Ver regulamento do cupom DAVID11">
          Ver regulamento
        </Link>
      </div>
      <div className="container store-header__content">
        <Link href="/" className="store-header__brand">
          David Store
        </Link>
        <form
          className="store-header__search"
          onSubmit={handleSearch}
          role="search"
        >
          <label className="sr-only" htmlFor="store-search">
            Buscar por produtos na David Store
          </label>
          <input
            id="store-search"
            type="search"
            placeholder="Busque por TVs, geladeiras, smartphones..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            autoComplete="off"
          />
          <button type="submit">Buscar</button>
        </form>
        <div className="store-header__actions">
          <Link href="/pedidos" className="store-header__action-link">
            📦 Pedidos
          </Link>
          <Link href="/login" className="store-header__action-link">
            👤 Entrar
          </Link>
          <Link
            href="/carrinho"
            className="store-header__action-link store-header__cart"
            aria-label={`Abrir o carrinho com ${cartCount} itens`}
          >
            🛒 Carrinho
            <span>{cartCount}</span>
          </Link>
        </div>
      </div>
      <nav className="store-header__nav" aria-label="Navegação principal">
        <div className="container store-header__nav-links">
          <Link
            href="/"
            data-active={isActive('/')}
            className="store-header__nav-link"
          >
            Início
          </Link>
          <Link
            href="/ofertas"
            data-active={isActive('/ofertas')}
            className="store-header__nav-link"
          >
            Ofertas do dia
          </Link>
          <Link
            href="/categorias"
            data-active={isActive('/categorias')}
            className="store-header__nav-link"
          >
            Todas as categorias
          </Link>
          <Link
            href="/servicos"
            data-active={isActive('/servicos')}
            className="store-header__nav-link"
          >
            Serviços &amp; Garantia
          </Link>
          <Link
            href="/painel"
            data-active={isActive('/painel')}
            className="store-header__nav-link"
          >
            Painel Administrativo
          </Link>
        </div>
      </nav>
    </header>
  )
}

export default Header
