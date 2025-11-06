import prisma from '../lib/prisma.js'
import { NotFoundError } from '../utils/errors.js'

const toReservationItems = (items = []) =>
  items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity
  }))

const runAtomic = async (tx, handler) => {
  if (tx) {
    return handler(tx)
  }
  return prisma.$transaction((transaction) => handler(transaction))
}

const getReservationByOrderId = async (orderId, tx = prisma) =>
  tx.inventoryReservation.findUnique({
    where: { orderId }
  })

const loadProductsForItems = async (tx, items) => {
  const productIds = items.map((item) => item.productId)
  const products = await tx.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      stock: true,
      reservedStock: true
    }
  })

  const map = new Map(products.map((product) => [product.id, product]))

  return items.map((item) => {
    const product = map.get(item.productId)
    if (!product) {
      throw new NotFoundError(`Produto ${item.productId} não encontrado para reserva de estoque.`)
    }
    return { ...product, quantity: item.quantity }
  })
}

export const reserveStockForOrder = async ({ orderId, items, tx }) =>
  runAtomic(tx, async (transaction) => {
    const products = await loadProductsForItems(transaction, items)

    products.forEach((product) => {
      const available = product.stock - product.reservedStock
      if (available < product.quantity) {
        const error = new Error(`Estoque insuficiente para o produto ${product.name}. Disponível: ${available}`)
        error.statusCode = 409
        throw error
      }
    })

    await Promise.all(
      products.map((product) =>
        transaction.product.update({
          where: { id: product.id },
          data: {
            reservedStock: {
              increment: product.quantity
            }
          }
        })
      )
    )

    const reservation = await transaction.inventoryReservation.upsert({
      where: { orderId },
      create: {
        orderId,
        status: 'reservado',
        items: toReservationItems(items)
      },
      update: {
        status: 'reservado',
        items: toReservationItems(items),
        reservedAt: new Date(),
        confirmedAt: null,
        releasedAt: null,
        revertedAt: null
      }
    })

    return reservation
  })


export const confirmReservedStock = async (orderId, tx) =>
  runAtomic(tx, async (transaction) => {
    const reservation = await getReservationByOrderId(orderId, transaction)
    if (!reservation) {
      return null
    }

    if (reservation.status === 'confirmado') {
      return reservation
    }

    const items = Array.isArray(reservation.items) ? reservation.items : []

    await Promise.all(
      items.map((item) =>
        transaction.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            },
            reservedStock: {
              decrement: item.quantity
            }
          }
        })
      )
    )

    return transaction.inventoryReservation.update({
      where: { orderId },
      data: {
        status: 'confirmado',
        confirmedAt: new Date(),
        releasedAt: null,
        revertedAt: null
      }
    })
  })


export const releaseReservedStock = async (orderId, tx) =>
  runAtomic(tx, async (transaction) => {
    const reservation = await getReservationByOrderId(orderId, transaction)
    if (!reservation) {
      return null
    }

    if (reservation.status === 'liberado' || reservation.status === 'revertido') {
      return reservation
    }

    if (reservation.status === 'confirmado') {
      return null
    }

    const items = Array.isArray(reservation.items) ? reservation.items : []

    await Promise.all(
      items.map((item) =>
        transaction.product.update({
          where: { id: item.productId },
          data: {
            reservedStock: {
              decrement: item.quantity
            }
          }
        })
      )
    )

    return transaction.inventoryReservation.update({
      where: { orderId },
      data: {
        status: 'liberado',
        releasedAt: new Date()
      }
    })
  })


export const revertConfirmedStock = async (orderId, tx) =>
  runAtomic(tx, async (transaction) => {
    const reservation = await getReservationByOrderId(orderId, transaction)
    if (!reservation || reservation.status !== 'confirmado') {
      return null
    }

    const items = Array.isArray(reservation.items) ? reservation.items : []

    await Promise.all(
      items.map((item) =>
        transaction.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        })
      )
    )

    return transaction.inventoryReservation.update({
      where: { orderId },
      data: {
        status: 'revertido',
        revertedAt: new Date()
      }
    })
  })


export const getReservationSnapshot = async (orderId) => getReservationByOrderId(orderId)
