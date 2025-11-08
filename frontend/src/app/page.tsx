import AppDownloadBanner from '@/components/AppDownloadBanner'
import CategoryFilter from '@/components/CategoryFilter'
import CepLookup from '@/components/CepLookup'
import FlashDeals from '@/components/FlashDeals'
import Hero from '@/components/Hero'
import ProductCard from '@/components/ProductCard'
import PromoMarquee from '@/components/PromoMarquee'
import { fetchCategories, fetchProducts } from '@/services/api'
import type { Category, Product } from '@/services/api'

type HomePageProps = {
  searchParams?: { [key: string]: string | string[] | undefined }
}

const HomePage = async ({
  searchParams
}: HomePageProps): Promise<JSX.Element> => {
  const activeCategoryParam = searchParams?.categoria
  const activeCategory =
    typeof activeCategoryParam === 'string' ? activeCategoryParam : ''
  const searchTermParam = searchParams?.busca
  const searchTerm = typeof searchTermParam === 'string' ? searchTermParam : ''

  let categories: Category[] = []
  let products: Product[] = []
  let errorMessage = ''

  try {
    const productFilters: Record<string, string> = {}

    if (activeCategory) {
      productFilters.categoria = activeCategory
    }

    if (searchTerm) {
      productFilters.busca = searchTerm
    }

    ;[categories, products] = await Promise.all([
      fetchCategories(),
      fetchProducts(productFilters)
    ])
  } catch (error) {
    console.error('Erro ao carregar a vitrine SSR da David Store:', error)
    errorMessage =
      'Não foi possível carregar nossa vitrine inteligente no momento.'
  }

  return (
    <>
      <Hero />
      <PromoMarquee />
      <section className="container showcase-section">
        <header className="showcase-section__header">
          <div>
            <span className="badge badge--highlight">Coleções em destaque</span>
            <h2 className="section-title">Curadoria premium para hoje</h2>
            <p>
              Ofertas que unem o DNA Casas Bahia com o toque futurista David
              Store: logística inteligente, montagem assistida e pós-venda
              humano.
            </p>
          </div>
          {searchTerm ? (
            <p className="showcase-section__search-feedback">
              Resultados para <strong>“{searchTerm}”</strong>
            </p>
          ) : null}
        </header>
        <CategoryFilter categories={categories} active={activeCategory} />
        {errorMessage ? (
          <p className="showcase-section__error">{errorMessage}</p>
        ) : products.length ? (
          <div className="grid showcase-section__grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="showcase-section__empty">
            Atualizando nossa vitrine exclusiva para você...
          </p>
        )}
      </section>
      <FlashDeals products={products} />
      <AppDownloadBanner />
      <CepLookup />
    </>
  )
}

export default HomePage
