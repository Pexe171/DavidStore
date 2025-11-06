import { listCategories, getCategoryById } from '../services/categoryService.js'

export const getCategories = async (req, res, next) => {
  try {
    const categories = await listCategories()
    res.json(categories)
  } catch (error) {
    next(error)
  }
}

export const getCategory = async (req, res, next) => {
  try {
    const category = await getCategoryById(req.params.id)
    res.json(category)
  } catch (error) {
    next(error)
  }
}
