'use client'

import { useEffect, useState } from 'react'

import {
  fetchDashboard,
  fetchPaymentOverview,
  fetchPaymentTransactions
} from '@/services/api'
import type {
  DashboardMetrics,
  PaymentOverview,
  PaymentTransaction
} from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'

type HighlightState = 'positivo' | 'negativo' | 'neutro'

const PainelPage = (): JSX.Element => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [paymentOverview, setPaymentOverview] =
    useState<PaymentOverview | null>(null)
  const [paymentTransactions, setPaymentTransactions] = useState<
    PaymentTransaction[]
  >([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [authReady, setAuthReady] = useState<boolean>(false)
  const { isAdmin, login, isLoading: authLoading } = useAuth()

  useEffect(() => {
    if (authReady) {
      return
    }

    const ensureAdminSession = async (): Promise<void> => {
      try {
        if (!isAdmin) {
          await login({ email: 'admin@davidstore.com', password: 'admin123' })
        }
        setAuthReady(true)
      } catch (err) {
        console.error('Erro ao autenticar administrador:', err)
        setError('Não foi possível autenticar o administrador do painel.')
        setLoading(false)
      }
    }

    void ensureAdminSession()
  }, [authReady, isAdmin, login])

  useEffect(() => {
    if (!authReady || !isAdmin) {
      return
    }

    const loadDashboard = async (): Promise<void> => {
      setLoading(true)
      try {
        const [dashboardResponse, paymentResponse, transactionsResponse] =
          await Promise.all([
            fetchDashboard(),
            fetchPaymentOverview(),
            fetchPaymentTransactions({ limit: 6 })
          ])
        setMetrics(dashboardResponse)
        setPaymentOverview({
          ...paymentResponse,
          metodos: paymentResponse.metodos ?? [],
          distribuicaoStatus: paymentResponse.distribuicaoStatus ?? {},
          alertas: paymentResponse.alertas ?? [],
          agendaLiquidacoes: paymentResponse.agendaLiquidacoes ?? [],
          temposProcessamento: paymentResponse.temposProcessamento ?? [],
          transacoesRecentes: paymentResponse.transacoesRecentes ?? []
        })
        const fallbackTransactions =
          transactionsResponse.transactions ??
          paymentResponse.transacoesRecentes ??
          []
        setPaymentTransactions(fallbackTransactions)
      } catch (err) {
        console.error('Erro ao buscar painel:', err)
        setError('Não foi possível carregar o painel administrativo.')
      } finally {
        setLoading(false)
      }
    }

    void loadDashboard()
  }, [authReady, isAdmin])

  if (loading || authLoading) {
    return (
      <section className="container" style={{ padding: '2rem 0 4rem' }}>
        <p>Carregando painel inteligente da David Store...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="container" style={{ padding: '2rem 0 4rem' }}>
        <div
          className="card"
          style={{ background: '#fee2e2', color: '#b91c1c' }}
        >
          {error}
        </div>
      </section>
    )
  }

  if (!metrics) {
    return (
      <section className="container" style={{ padding: '2rem 0 4rem' }}>
        <p>Sem dados do painel disponíveis no momento.</p>
      </section>
    )
  }

  const approvalRate = metrics.paymentGateway?.taxaAprovacao ?? 0
  const gatewayVolume = metrics.paymentGateway?.volumeBruto ?? 0

  return (
    <section
      className="container"
      style={{ padding: '2rem 0 4rem', display: 'grid', gap: '2rem' }}
    >
      <header>
        <h1>Painel David Store Pro</h1>
        <p style={{ color: '#64748b', maxWidth: '600px' }}>
          Acompanhe indicadores inspirados no padrão Casas Bahia, com foco em
          experiência, entrega relâmpago e estoque inteligente.
        </p>
      </header>
      <div
        className="grid"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
      >
        <div className="card">
          <p style={{ color: '#94a3b8', margin: 0 }}>Receita acumulada</p>
          <strong style={{ fontSize: '2rem' }}>
            {metrics.metrics.totalRevenue.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
          </strong>
        </div>
        <div className="card">
          <p style={{ color: '#94a3b8', margin: 0 }}>Pedidos</p>
          <strong style={{ fontSize: '2rem' }}>
            {metrics.metrics.totalOrders}
          </strong>
        </div>
        <div className="card">
          <p style={{ color: '#94a3b8', margin: 0 }}>Ticket médio</p>
          <strong style={{ fontSize: '2rem' }}>
            {metrics.metrics.averageTicket.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
          </strong>
        </div>
        <div className="card">
          <p style={{ color: '#94a3b8', margin: 0 }}>Em preparação</p>
          <strong style={{ fontSize: '2rem' }}>
            {metrics.metrics.processingOrders}
          </strong>
        </div>
        <div className="card">
          <p style={{ color: '#94a3b8', margin: 0 }}>Pedidos entregues</p>
          <strong style={{ fontSize: '2rem' }}>
            {metrics.metrics.deliveredOrders}
          </strong>
        </div>
        <div className="card">
          <p style={{ color: '#94a3b8', margin: 0 }}>Aprovação David Pay</p>
          <strong style={{ fontSize: '2rem' }}>
            {approvalRate.toFixed(1)}%
          </strong>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: 0 }}>
            Volume bruto de{' '}
            {gatewayVolume.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
          </p>
        </div>
      </div>
      {paymentOverview && (
        <div className="card" style={{ display: 'grid', gap: '1.5rem' }}>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
          >
            <div className="badge">Gateway de pagamento David Pay</div>
            <h2>Operação financeira em tempo real</h2>
            <p style={{ color: '#64748b', maxWidth: '720px' }}>
              Monitore aprovação, liquidação e risco das transações processadas
              pela David Store com insights dignos de grandes varejistas.
            </p>
          </div>
          <div
            className="grid"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
            }}
          >
            <KpiCard
              title="Volume bruto"
              value={paymentOverview.kpis.volumeBruto.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
              helper="Receita processada em 24h"
            />
            <KpiCard
              title="Volume líquido"
              value={paymentOverview.kpis.volumeLiquido.toLocaleString(
                'pt-BR',
                { style: 'currency', currency: 'BRL' }
              )}
              helper="Após taxas do gateway"
            />
            <KpiCard
              title="Taxa de aprovação"
              value={`${paymentOverview.kpis.taxaAprovacao.toFixed(1)}%`}
              helper="Meta mensal: > 92%"
              highlight={
                paymentOverview.kpis.taxaAprovacao < 90
                  ? 'negativo'
                  : 'positivo'
              }
            />
            <KpiCard
              title="Chargeback"
              value={`${paymentOverview.kpis.taxaChargeback.toFixed(2)}%`}
              helper="Índice de contestação"
              highlight={
                paymentOverview.kpis.taxaChargeback > 1.5
                  ? 'negativo'
                  : 'neutro'
              }
            />
            <KpiCard
              title="Ticket médio aprovado"
              value={paymentOverview.kpis.ticketMedioAprovado.toLocaleString(
                'pt-BR',
                { style: 'currency', currency: 'BRL' }
              )}
              helper="Pedidos autorizados"
            />
            <KpiCard
              title="Liquidação média"
              value={`${paymentOverview.kpis.tempoMedioLiquidacao.toFixed(1)} dias`}
              helper="Tempo da captura ao recebimento"
            />
          </div>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <h3>Transações recentes</h3>
            <div className="table">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Valor</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{transaction.id}</td>
                      <td>
                        {transaction.customerName ?? 'Cliente não identificado'}
                      </td>
                      <td>
                        {transaction.amount.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
                      </td>
                      <td>{transaction.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

type KpiCardProps = {
  title: string
  value: string
  helper: string
  highlight?: HighlightState
}

const KpiCard = ({
  title,
  value,
  helper,
  highlight = 'neutro'
}: KpiCardProps): JSX.Element => {
  const highlightColor =
    highlight === 'positivo'
      ? '#22c55e'
      : highlight === 'negativo'
        ? '#ef4444'
        : '#64748b'

  return (
    <div className="card" style={{ display: 'grid', gap: '0.5rem' }}>
      <p style={{ color: '#94a3b8', margin: 0 }}>{helper}</p>
      <h3 style={{ margin: 0 }}>{title}</h3>
      <strong style={{ fontSize: '1.75rem', color: highlightColor }}>
        {value}
      </strong>
    </div>
  )
}

export default PainelPage
