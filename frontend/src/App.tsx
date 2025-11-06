import { Route, Routes } from 'react-router-dom'
import type { FC } from 'react'

import StoreLayout from './layouts/StoreLayout'
import HomePage from './pages/HomePage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import DashboardPage from './pages/DashboardPage'

const App: FC = () => {
  return (
    <Routes>
      <Route element={<StoreLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/produto/:id" element={<ProductDetailPage />} />
        <Route path="/carrinho" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Route>
      <Route path="/painel" element={<DashboardPage />} />
    </Routes>
  )
}

export default App
