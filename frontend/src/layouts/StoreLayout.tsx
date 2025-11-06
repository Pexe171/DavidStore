import { Outlet } from 'react-router-dom'
import type { FC } from 'react'

import Header from '../components/Header'
import Footer from '../components/Footer'

const StoreLayout: FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default StoreLayout
