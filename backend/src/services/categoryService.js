import { categories } from '../data/categories.js'

export const listCategories = () => categories

export const getCategoryById = (id) => categories.find((category) => category.id === id)
