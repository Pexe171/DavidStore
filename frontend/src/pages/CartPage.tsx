import type { FC } from 'react'

import CartSummary from '../components/CartSummary'

const CartPage: FC = () => {
  return (
    <section className="container" style={{ padding: '2rem 0 4rem' }}>
      <CartSummary />
    </section>
  )
}

export default CartPage
