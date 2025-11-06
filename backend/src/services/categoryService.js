import prisma from '../lib/prisma.js'

export const listCategories = async () => {
  return prisma.category.findMany({
    orderBy: { name: 'asc' }
  })
}

export const getCategoryById = async (id) => {
  return prisma.category.findUnique({ where: { id } })
}
