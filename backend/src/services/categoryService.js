import prisma from '../lib/prisma.js'
import { NotFoundError } from '../utils/errors.js'

export const listCategories = async () => {
  return prisma.category.findMany({
    orderBy: { name: 'asc' }
  })
}

export const getCategoryById = async (id) => {
  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) {
    throw new NotFoundError('Categoria não encontrada.')
  }
  return category
}
