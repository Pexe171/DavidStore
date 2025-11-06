import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { FC } from 'react'

import Hero from '../components/Hero'
import ProductCard from '../components/ProductCard'
import CategoryFilter from '../components/CategoryFilter'
import { fetchProducts, fetchCategories } from '../services/api'
import type { Category, Product } from '../services/api'

const HomePage: FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('categoria') ?? ''

  const handleSelectCategory = (categoryId: string) => {
    if (categoryId === category) {
      return
    }

    const nextParams = new URLSearchParams(searchParams)

    if (categoryId) {
      nextParams.set('categoria', categoryId)
    } else {
      nextParams.delete('categoria')
    }

    setSearchParams(nextParams)
  }

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoryResponse = await fetchCategories()
        setCategories(categoryResponse)
      } catch (error) {
        console.error('Erro ao carregar categorias:', error)
      }
    }

    loadCategories()
  }, [])

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        const productResponse = await fetchProducts(category ? { categoria: category } : {})
        setProducts(productResponse)
      } catch (error) {
        console.error('Erro ao carregar produtos:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
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
        <CategoryFilter categories={categories} active={category} onSelect={handleSelectCategory} />
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
