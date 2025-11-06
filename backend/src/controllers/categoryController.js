import { listCategories, getCategoryById } from '../services/categoryService.js'

export const getCategories = (req, res) => {
  res.json(listCategories())
}

export const getCategory = (req, res) => {
  const category = getCategoryById(req.params.id)
  if (!category) {
    return res.status(404).json({ message: 'Categoria não encontrada.' })
  }
  res.json(category)
}
