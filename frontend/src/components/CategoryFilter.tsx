'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { FC } from 'react'

import type { Category } from '@/services/api'

type CategoryFilterProps = {
  categories: Category[]
  active: string
}

const CategoryFilter: FC<CategoryFilterProps> = ({ categories, active }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const navigateToCategory = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (categoryId) {
      params.set('categoria', categoryId)
    } else {
      params.delete('categoria')
    }

    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  return (
    <nav className="category-rail" aria-label="Categorias em destaque">
      <button
        type="button"
        onClick={() => navigateToCategory('')}
        className="category-pill"
        data-active={active === ''}
      >
        <span className="category-pill__icon">⭐</span>
        <span className="category-pill__label">Todas</span>
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => navigateToCategory(category.id)}
          className="category-pill"
          data-active={active === category.id}
        >
          <span className="category-pill__icon">🔥</span>
          <span className="category-pill__label">{category.name}</span>
        </button>
      ))}
    </nav>
  )
}

export default CategoryFilter
