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
    <div
      style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        marginBottom: '2rem'
      }}
    >
      <button
        onClick={() => navigateToCategory('')}
        className="btn-primary"
        style={{ background: active === '' ? '#0070f3' : '#1f2937' }}
      >
        Todas
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => navigateToCategory(category.id)}
          className="btn-primary"
          style={{ background: active === category.id ? '#0070f3' : '#1f2937' }}
        >
          {category.name}
        </button>
      ))}
    </div>
  )
}

export default CategoryFilter
