import type { Metadata } from 'next'
import { Suspense } from 'react'
import type { ReactNode } from 'react'

import Footer from '@/components/Footer'
import Header from '@/components/Header'

import './globals.css'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'David Store - Varejo inteligente com experiência premium',
  description:
    'Experiência omnichannel inspirada nas Casas Bahia com tecnologia David Store: catálogo atualizado, checkout humanizado e atendimento consultivo.'
}

type RootLayoutProps = {
  children: ReactNode
}

const RootLayout = ({ children }: RootLayoutProps): JSX.Element => {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          <div
            style={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Suspense
              fallback={
                <header className="store-header" aria-busy="true">
                  <div className="store-header__announcement">
                    Carregando navegação da David Store...
                  </div>
                </header>
              }
            >
              <Header />
            </Suspense>
            <main style={{ flex: 1 }}>{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}

export default RootLayout
