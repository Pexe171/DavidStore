import { Route, Routes } from 'react-router-dom'
import StoreLayout from './layouts/StoreLayout.jsx'
import HomePage from './pages/HomePage.jsx'
import ProductDetailPage from './pages/ProductDetailPage.jsx'
import CartPage from './pages/CartPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'

function App () {
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
