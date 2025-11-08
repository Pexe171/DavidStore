import Link from 'next/link'
import type { FC } from 'react'

const AppDownloadBanner: FC = () => {
  return (
    <section className="container app-banner">
      <div className="app-banner__content">
        <span className="badge badge--highlight">Baixe o app e ganhe mais</span>
        <h2>Experiência completa no app David Store</h2>
        <p>
          Faça compras com atendimento humano, receba notificações de ofertas
          relâmpago e acompanhe entregas em tempo real. Tudo com cupom
          exclusivo.
        </p>
        <div className="app-banner__actions">
          <Link href="/app" className="btn-primary">
            Baixar agora
          </Link>
          <Link href="/clube" className="btn-primary btn-primary--ghost">
            Conhecer Clube David
          </Link>
        </div>
      </div>
      <div className="app-banner__media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://davidstore.app"
          alt="QR Code para baixar o app David Store"
        />
        <p>Escaneie e receba 11% OFF no app agora.</p>
      </div>
    </section>
  )
}

export default AppDownloadBanner
