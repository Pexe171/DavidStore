'use client'

import type { PropsWithChildren } from 'react'

import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'

const Providers = ({ children }: PropsWithChildren): JSX.Element => {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  )
}

export default Providers
