import Link from 'next/link'
import type { FC } from 'react'

const Hero: FC = () => {
  return (
    <section
      className="container"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem',
        alignItems: 'center',
        padding: '3rem 0'
      }}
    >
      <div>
        <span className="badge">Lançamento exclusivo</span>
        <h1 style={{ fontSize: '3rem', margin: '1rem 0', lineHeight: 1.1 }}>
          David Store
          <br />
          Tecnologia, casa e experiência premium em um só lugar.
        </h1>
        <p
          style={{
            fontSize: '1.125rem',
            color: '#475569',
            marginBottom: '2rem'
          }}
        >
          Descubra ofertas inteligentes com IA, frete relâmpago e atendimento
          humanizado 24/7.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/" className="btn-primary">
            Explorar ofertas
          </Link>
          <Link
            href="/painel"
            className="btn-primary"
            style={{ background: '#1f2937' }}
          >
            Acessar Painel Pro
          </Link>
        </div>
      </div>
      <div
        style={{
          background:
            'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))',
          borderRadius: '32px',
          padding: '2rem',
          boxShadow: '0 60px 120px -60px rgba(37, 99, 235, 0.6)'
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1618005198919-d3d4b5a92eee"
          alt="Showroom David Store"
          style={{ width: '100%', borderRadius: '24px' }}
        />
      </div>
    </section>
  )
}

export default Hero
