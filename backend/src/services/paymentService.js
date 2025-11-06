import prisma from '../lib/prisma.js'
import { decimalToNumber, decimalToNumberOrZero } from '../utils/prisma.js'

const toNumber = (value) => decimalToNumberOrZero(value)
const toNullableNumber = (value) => {
  const parsed = decimalToNumber(value)
  return parsed === null ? null : parsed
}
const toIso = (value) => (value ? value.toISOString() : null)

const computeBaseStats = (payments) => {
  const totalVolume = payments.reduce((acc, payment) => acc + toNumber(payment.amount), 0)
  const totalNet = payments.reduce((acc, payment) => acc + toNumber(payment.netAmount), 0)
  const approved = payments.filter((payment) => payment.status === 'capturado')
  const chargebacks = payments.filter((payment) => payment.chargeback)

  const approvalRate = payments.length ? (approved.length / payments.length) * 100 : 0
  const chargebackRate = approved.length ? (chargebacks.length / approved.length) * 100 : 0
  const averageTicket = approved.length
    ? approved.reduce((acc, payment) => acc + toNumber(payment.amount), 0) / approved.length
    : 0

  const settlementDurations = approved
    .map((payment) => {
      if (!payment.capturedAt || !payment.settlementDate) return null
      const diffMs = new Date(payment.settlementDate).getTime() - new Date(payment.capturedAt).getTime()
      return diffMs > 0 ? diffMs / (1000 * 60 * 60 * 24) : 0
    })
    .filter((value) => value !== null)
  const averageSettlement = settlementDurations.length
    ? settlementDurations.reduce((acc, days) => acc + days, 0) / settlementDurations.length
    : 0

  const methodBreakdown = payments.reduce((acc, payment) => {
    const key = payment.method
    if (!acc[key]) {
      acc[key] = {
        method: key,
        volume: 0,
        count: 0
      }
    }
    acc[key].volume += toNumber(payment.amount)
    acc[key].count += 1
    return acc
  }, {})

  const statusDistribution = payments.reduce((acc, payment) => {
    acc[payment.status] = (acc[payment.status] || 0) + 1
    return acc
  }, {})

  const riskAlerts = payments
    .filter((payment) => payment.chargeback || payment.status === 'em_analise' || (payment.riskScore ?? 0) >= 0.6)
    .map((payment) => ({
      id: payment.id,
      orderId: payment.orderId,
      customerName: payment.customerName,
      status: payment.status,
      riskScore: payment.riskScore,
      chargeback: payment.chargeback,
      mensagem:
        payment.chargeback
          ? 'Chargeback em andamento: necessário contato com adquirente.'
          : payment.status === 'em_analise'
            ? 'Transação em análise manual pela equipe antifraude.'
            : 'Pontuação de risco alta detectada pelo motor antifraude.'
    }))

  const settlementPipeline = approved
    .filter((payment) => payment.settlementStatus !== 'liquidado')
    .map((payment) => ({
      id: payment.id,
      orderId: payment.orderId,
      expectedAmount: toNumber(payment.netAmount),
      settlementDate: payment.settlementDate,
      settlementStatus: payment.settlementStatus
    }))
    .sort((a, b) => new Date(a.settlementDate) - new Date(b.settlementDate))

  const processingTimeline = approved.map((payment) => ({
    id: payment.id,
    orderId: payment.orderId,
    authorizationSeconds:
      payment.authorizedAt && payment.createdAt
        ? (new Date(payment.authorizedAt).getTime() - new Date(payment.createdAt).getTime()) / 1000
        : null,
    captureSeconds:
      payment.capturedAt && payment.authorizedAt
        ? (new Date(payment.capturedAt).getTime() - new Date(payment.authorizedAt).getTime()) / 1000
        : null
  }))

  return {
    totalVolume,
    totalNet,
    approvalRate,
    chargebackRate,
    averageTicket,
    averageSettlement,
    methodBreakdown,
    statusDistribution,
    riskAlerts,
    settlementPipeline,
    processingTimeline
  }
}

const mapPayment = (payment) => ({
  id: payment.id,
  orderId: payment.orderId,
  method: payment.method,
  cardBrand: payment.cardBrand,
  status: payment.status,
  amount: toNumber(payment.amount),
  netAmount: toNullableNumber(payment.netAmount),
  installments: payment.installments,
  gatewayFees: toNullableNumber(payment.gatewayFees),
  riskScore: toNullableNumber(payment.riskScore),
  chargeback: payment.chargeback,
  settlementDate: toIso(payment.settlementDate),
  settlementStatus: payment.settlementStatus,
  customerName: payment.customerName,
  createdAt: toIso(payment.createdAt),
  authorizedAt: toIso(payment.authorizedAt),
  capturedAt: toIso(payment.capturedAt)
})

const fetchPayments = async ({ status, method, limit } = {}) => {
  const where = {}
  if (status) where.status = status
  if (method) where.method = method

  const payments = await prisma.payment.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit ? Number(limit) : undefined
  })

  return payments.map(mapPayment)
}

export const listPayments = async (filters = {}) => fetchPayments(filters)

export const getPaymentOverview = async () => {
  const payments = await fetchPayments()
  const stats = computeBaseStats(payments)
  const recent = await fetchPayments({ limit: 8 })

  return {
    kpis: {
      volumeBruto: stats.totalVolume,
      volumeLiquido: stats.totalNet,
      taxaAprovacao: stats.approvalRate,
      taxaChargeback: stats.chargebackRate,
      ticketMedioAprovado: stats.averageTicket,
      tempoMedioLiquidacao: stats.averageSettlement
    },
    metodos: Object.values(stats.methodBreakdown)
      .map((entry) => ({
        ...entry,
        percentual: stats.totalVolume ? (entry.volume / stats.totalVolume) * 100 : 0
      }))
      .sort((a, b) => b.volume - a.volume),
    distribuicaoStatus: stats.statusDistribution,
    alertas: stats.riskAlerts,
    agendaLiquidacoes: stats.settlementPipeline,
    temposProcessamento: stats.processingTimeline,
    transacoesRecentes: recent
  }
}

export const getPaymentSummary = async () => {
  const payments = await fetchPayments()
  const stats = computeBaseStats(payments)
  return {
    volumeBruto: stats.totalVolume,
    taxaAprovacao: stats.approvalRate,
    taxaChargeback: stats.chargebackRate,
    liquidacoesPendentes: stats.settlementPipeline.length,
    alertasCriticos: stats.riskAlerts.length
  }
}
