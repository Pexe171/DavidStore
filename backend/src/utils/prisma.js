import { Prisma } from '@prisma/client'

export const decimalToNumber = (value) => {
  if (value === null || value === undefined) {
    return null
  }
  if (typeof value === 'number') {
    return value
  }
  return Number(value)
}

export const decimalToNumberOrZero = (value) => {
  const parsed = decimalToNumber(value)
  return parsed === null ? 0 : parsed
}

export const toDecimal = (value) => {
  if (value === null || value === undefined) {
    return undefined
  }
  if (value instanceof Prisma.Decimal) {
    return value
  }
  return new Prisma.Decimal(value)
}
