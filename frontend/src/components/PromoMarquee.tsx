import type { FC } from 'react'

const PromoMarquee: FC = () => {
  return (
    <section
      className="promo-marquee"
      aria-label="Alertas de promoções relâmpago"
    >
      <div className="promo-marquee__inner">
        <span>⚡ Corre, que acaba!</span>
        <span>Combos gamer com 20% OFF</span>
        <span>Frete grátis Brasil no app</span>
        <span>Cashback em eletroportáteis</span>
        <span>Garantia estendida David Care</span>
      </div>
    </section>
  )
}

export default PromoMarquee
