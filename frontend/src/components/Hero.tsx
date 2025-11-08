import Link from 'next/link'
import type { FC } from 'react'

const Hero: FC = () => {
  return (
    <section className="hero">
      <div className="container hero__content">
        <div className="hero__copy">
          <span className="badge badge--highlight">
            Liquidação de inauguração
          </span>
          <h1>
            Tecnologia, casa e bem-estar com preço de atacado.
            <span>Do seu jeito, 24/7.</span>
          </h1>
          <p>
            Experimente o padrão David Store inspirado na Casas Bahia: ofertas
            agressivas, entregas em ritmo de app, consultoria humana e um
            ecossistema que entende a sua rotina.
          </p>
          <div className="hero__actions">
            <Link href="/ofertas" className="btn-primary btn-primary--contrast">
              Ver ofertas imperdíveis
            </Link>
            <Link href="/painel" className="btn-primary btn-primary--dark">
              Acessar Painel Pro
            </Link>
          </div>
          <ul className="hero__benefits">
            <li>🚚 Frete grátis Brasil em produtos selecionados</li>
            <li>💳 Até 24x sem juros no Cartão David</li>
            <li>🤝 Atendimento consultivo com especialistas</li>
          </ul>
        </div>
        <div className="hero__showcase">
          <div className="hero__showcase-card">
            <span className="badge badge--light">Smart Week</span>
            <strong>TVs 4K e Smart Homes</strong>
            <p>Até 30% OFF + montagem inteligente inclusa.</p>
            <Link href="/categorias/tv" className="hero__showcase-link">
              Quero aproveitar
            </Link>
          </div>
          <div className="hero__showcase-grid">
            <article className="hero__mini-card">
              <span>Casa inteligente</span>
              <strong>Kit Alexa + Lâmpadas</strong>
              <p>Instalação em 48h e suporte remoto.</p>
            </article>
            <article className="hero__mini-card">
              <span>Mobilidade</span>
              <strong>E-bikes e patinetes</strong>
              <p>Planos sem juros e seguro incluso.</p>
            </article>
            <article className="hero__mini-card">
              <span>Casa &amp; conforto</span>
              <strong>Lavanderia eficiente</strong>
              <p>Lavadoras com cashback e instalação express.</p>
            </article>
            <article className="hero__mini-card">
              <span>David Care</span>
              <strong>Garantia estendida</strong>
              <p>Proteção total e suporte humanizado 24/7.</p>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
