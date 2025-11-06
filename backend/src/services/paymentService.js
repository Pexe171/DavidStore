import { payments } from '../data/payments.js'

const toNumber = (value) => Number(value ?? 0)
const parseDate = (value) => (value ? new Date(value) : null)
const daysBetween = (start, end) => {
  if (!start || !end) return null
  const diffMs = end.getTime() - start.getTime()
  return diffMs > 0 ? diffMs / (1000 * 60 * 60 * 24) : 0
}

const computeBaseStats = () => {
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
    .map((payment) => daysBetween(parseDate(payment.capturedAt), parseDate(payment.settlementDate)))
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
    .filter((payment) => payment.chargeback || payment.status === 'em_analise' || payment.riskScore >= 0.6)
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
    authorizationSeconds: payment.authorizedAt
      ? (parseDate(payment.authorizedAt).getTime() - parseDate(payment.createdAt).getTime()) / 1000
      : null,
    captureSeconds: payment.capturedAt && payment.authorizedAt
      ? (parseDate(payment.capturedAt).getTime() - parseDate(payment.authorizedAt).getTime()) / 1000
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

export const listPayments = ({ status, method, limit } = {}) => {
  let result = [...payments]
  if (status) {
    result = result.filter((payment) => payment.status === status)
  }
  if (method) {
    result = result.filter((payment) => payment.method === method)
  }
  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  if (limit) {
    result = result.slice(0, Number(limit))
  }
  return result
}

export const getPaymentById = (id) => payments.find((payment) => payment.id === id)

export const getPaymentOverview = () => {
  const stats = computeBaseStats()
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
    transacoesRecentes: listPayments({ limit: 8 })
  }
}

export const getPaymentSummary = () => {
  const stats = computeBaseStats()
  return {
    volumeBruto: stats.totalVolume,
    taxaAprovacao: stats.approvalRate,
    taxaChargeback: stats.chargebackRate,
    liquidacoesPendentes: stats.settlementPipeline.length,
    alertasCriticos: stats.riskAlerts.length
  }
}
