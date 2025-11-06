import CartSummary from '@/components/CartSummary'

export const metadata = {
  title: 'Carrinho - David Store'
}

const CartPage = (): JSX.Element => {
  return (
    <section className="container" style={{ padding: '2rem 0 4rem' }}>
      <CartSummary />
    </section>
  )
}

export default CartPage
