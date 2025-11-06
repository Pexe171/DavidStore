import { useEffect, useState } from 'react'
import Hero from '../components/Hero.jsx'
import ProductCard from '../components/ProductCard.jsx'
import CategoryFilter from '../components/CategoryFilter.jsx'
import { fetchProducts, fetchCategories } from '../services/api.js'

const HomePage = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [productResponse, categoryResponse] = await Promise.all([
          fetchProducts(category ? { categoria: category } : {}),
          fetchCategories()
        ])
        setProducts(productResponse)
        setCategories(categoryResponse)
      } catch (error) {
        console.error('Erro ao carregar dados da home:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [category])

  return (
    <>
      <Hero />
      <section className="container" style={{ padding: '2rem 0 4rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="section-title">Coleções em destaque</h2>
            <p style={{ color: '#64748b', maxWidth: '540px' }}>
              Curadoria inspirada nas Casas Bahia com uma camada David Experience: serviços premium, garantia estendida e integração com assistentes virtuais.
            </p>
          </div>
        </header>
        <CategoryFilter categories={categories} active={category} onSelect={setCategory} />
        {loading ? (
          <p>Carregando a vitrine David Store...</p>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}

export default HomePage
