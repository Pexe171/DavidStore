import type { FC } from 'react'
import type { Category } from '../services/api'

type CategoryFilterProps = {
  categories: Category[]
  active: string
  onSelect: (categoryId: string) => void
}

const CategoryFilter: FC<CategoryFilterProps> = ({ categories, active, onSelect }) => {
  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
      <button
        onClick={() => onSelect('')}
        className="btn-primary"
        style={{ background: active === '' ? '#0070f3' : '#1f2937' }}
      >
        Todas
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
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
