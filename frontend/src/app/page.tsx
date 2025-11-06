import Hero from '@/components/Hero'
import ProductCard from '@/components/ProductCard'
import CategoryFilter from '@/components/CategoryFilter'
import { fetchCategories, fetchProducts } from '@/services/api'
import type { Category, Product } from '@/services/api'

type HomePageProps = {
  searchParams?: { [key: string]: string | string[] | undefined }
}

const HomePage = async ({ searchParams }: HomePageProps): Promise<JSX.Element> => {
  const activeCategoryParam = searchParams?.categoria
  const activeCategory = typeof activeCategoryParam === 'string' ? activeCategoryParam : ''

  let categories: Category[] = []
  let products: Product[] = []
  let errorMessage = ''

  try {
    ;[categories, products] = await Promise.all([
      fetchCategories(),
      fetchProducts(activeCategory ? { categoria: activeCategory } : {})
    ])
  } catch (error) {
    console.error('Erro ao carregar a vitrine SSR da David Store:', error)
    errorMessage = 'Não foi possível carregar nossa vitrine inteligente no momento.'
  }

  return (
    <>
      <Hero />
      <section className="container" style={{ padding: '2rem 0 4rem' }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            <h2 className="section-title">Coleções em destaque</h2>
            <p style={{ color: '#64748b', maxWidth: '540px' }}>
              Curadoria inspirada nas Casas Bahia com uma camada David Experience: serviços premium, garantia estendida e
              integração com assistentes virtuais.
            </p>
          </div>
        </header>
        <CategoryFilter categories={categories} active={activeCategory} />
        {errorMessage ? (
          <p>{errorMessage}</p>
        ) : products.length ? (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p>Atualizando nossa vitrine exclusiva para você...</p>
        )}
      </section>
    </>
  )
}

export default HomePage
