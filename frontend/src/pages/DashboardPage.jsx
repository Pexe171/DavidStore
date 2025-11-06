import { useEffect, useState } from 'react'
import {
  authenticate,
  fetchDashboard,
  fetchPaymentOverview,
  fetchPaymentTransactions
} from '../services/api.js'

const DashboardPage = () => {
  const [metrics, setMetrics] = useState(null)
  const [paymentOverview, setPaymentOverview] = useState(null)
  const [paymentTransactions, setPaymentTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        await authenticate({ email: 'admin@davidstore.com', password: 'admin123' })
        const [dashboardResponse, paymentResponse, transactionsResponse] = await Promise.all([
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
          transactionsResponse.transactions ?? paymentResponse.transacoesRecentes ?? []
        setPaymentTransactions(fallbackTransactions)
      } catch (err) {
        console.error('Erro ao buscar painel:', err)
        setError('Não foi possível carregar o painel administrativo.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <section className="container" style={{ padding: '2rem 0 4rem' }}>
        <p>Carregando painel inteligente da David Store...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="container" style={{ padding: '2rem 0 4rem' }}>
        <div className="card" style={{ background: '#fee2e2', color: '#b91c1c' }}>{error}</div>
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
    <section className="container" style={{ padding: '2rem 0 4rem', display: 'grid', gap: '2rem' }}>
      <header>
        <h1>Painel David Store Pro</h1>
        <p style={{ color: '#64748b', maxWidth: '600px' }}>
          Acompanhe indicadores inspirados no padrão Casas Bahia, com foco em experiência, entrega relâmpago e estoque inteligente.
        </p>
      </header>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="card">
          <p style={{ color: '#94a3b8', margin: 0 }}>Receita acumulada</p>
          <strong style={{ fontSize: '2rem' }}>
            {metrics.metrics.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </strong>
        </div>
        <div className="card">
          <p style={{ color: '#94a3b8', margin: 0 }}>Pedidos</p>
          <strong style={{ fontSize: '2rem' }}>{metrics.metrics.totalOrders}</strong>
        </div>
        <div className="card">
          <p style={{ color: '#94a3b8', margin: 0 }}>Ticket médio</p>
          <strong style={{ fontSize: '2rem' }}>
            {metrics.metrics.averageTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </strong>
        </div>
        <div className="card">
          <p style={{ color: '#94a3b8', margin: 0 }}>Em preparação</p>
          <strong style={{ fontSize: '2rem' }}>{metrics.metrics.processingOrders}</strong>
        </div>
        <div className="card">
          <p style={{ color: '#94a3b8', margin: 0 }}>Pedidos entregues</p>
          <strong style={{ fontSize: '2rem' }}>{metrics.metrics.deliveredOrders}</strong>
        </div>
        <div className="card">
          <p style={{ color: '#94a3b8', margin: 0 }}>Aprovação David Pay</p>
          <strong style={{ fontSize: '2rem' }}>
            {approvalRate.toFixed(1)}%
          </strong>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: 0 }}>
            Volume bruto de {gatewayVolume.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
          </p>
        </div>
      </div>
      {paymentOverview && (
        <div className="card" style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div className="badge">Gateway de pagamento David Pay</div>
            <h2>Operação financeira em tempo real</h2>
            <p style={{ color: '#64748b', maxWidth: '720px' }}>
              Monitore aprovação, liquidação e risco das transações processadas pela David Store com insights dignos de grandes varejistas.
            </p>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
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
              value={paymentOverview.kpis.volumeLiquido.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
              helper="Após taxas do gateway"
            />
            <KpiCard
              title="Taxa de aprovação"
              value={`${paymentOverview.kpis.taxaAprovacao.toFixed(1)}%`}
              helper="Meta mensal: &gt; 92%"
              highlight={paymentOverview.kpis.taxaAprovacao < 90 ? 'negativo' : 'positivo'}
            />
            <KpiCard
              title="Chargeback"
              value={`${paymentOverview.kpis.taxaChargeback.toFixed(2)}%`}
              helper="Índice de contestação"
              highlight={paymentOverview.kpis.taxaChargeback > 1.5 ? 'negativo' : 'neutro'}
            />
            <KpiCard
              title="Ticket médio aprovado"
              value={paymentOverview.kpis.ticketMedioAprovado.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
              helper="Pedidos autorizados"
            />
            <KpiCard
              title="Liquidação média"
              value={`${paymentOverview.kpis.tempoMedioLiquidacao.toFixed(1)} dias`}
              helper="Tempo da captura ao recebimento"
            />
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            <div className="card" style={{ boxShadow: 'none', border: '1px solid #e2e8f0' }}>
              <h3>Mix de métodos</h3>
              <p style={{ color: '#64748b' }}>Entenda o peso de cada forma de pagamento.</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.75rem' }}>
                {paymentOverview.metodos.map((method) => (
                  <li key={method.method} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{formatMethod(method.method)}</strong>
                      <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
                        {method.count} transações • {method.percentual.toFixed(1)}%
                      </p>
                    </div>
                    <span style={{ fontWeight: 600 }}>
                      {method.volume.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card" style={{ boxShadow: 'none', border: '1px solid #e2e8f0' }}>
              <h3>Status operacional</h3>
              <p style={{ color: '#64748b' }}>Fluxo completo do gateway nas últimas horas.</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.75rem' }}>
                {Object.entries(paymentOverview.distribuicaoStatus).map(([status, total]) => (
                  <li key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>{formatStatus(status)}</span>
                    <span style={{ color: '#64748b' }}>{total} registros</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card" style={{ boxShadow: 'none', border: '1px solid #e2e8f0' }}>
              <h3>Alertas de risco</h3>
              <p style={{ color: '#64748b' }}>
                Monitoramento de chargeback, revisões manuais e fraudes emergentes.
              </p>
              {paymentOverview.alertas.length === 0 ? (
                <p style={{ color: '#16a34a', fontWeight: 600 }}>Nenhum alerta crítico ativo.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.75rem' }}>
                  {paymentOverview.alertas.map((alert) => (
                    <li key={alert.id} style={{ borderLeft: '4px solid #f97316', paddingLeft: '0.75rem' }}>
                      <strong>{alert.customerName}</strong>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#f97316' }}>{alert.mensagem}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
                        Pedido {alert.orderId} • Score {alert.riskScore.toFixed(2)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            <div className="card" style={{ boxShadow: 'none', border: '1px solid #e2e8f0' }}>
              <h3>Agenda de liquidações</h3>
              <p style={{ color: '#64748b' }}>Previsão de recebimento por transação.</p>
              {paymentOverview.agendaLiquidacoes.length === 0 ? (
                <p style={{ color: '#16a34a', fontWeight: 600 }}>Nenhuma liquidação pendente para os próximos dias.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.75rem' }}>
                  {paymentOverview.agendaLiquidacoes.map((entry) => (
                    <li key={entry.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>{entry.orderId}</strong>
                        <span style={{ fontWeight: 600 }}>
                          {entry.expectedAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                        Liquidação prevista para {formatDate(entry.settlementDate)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="card" style={{ boxShadow: 'none', border: '1px solid #e2e8f0' }}>
              <h3>Tempo de autorização</h3>
              <p style={{ color: '#64748b' }}>Velocidade do gateway por pedido aprovado.</p>
              {paymentOverview.temposProcessamento.length === 0 ? (
                <p style={{ color: '#94a3b8' }}>Sem dados de desempenho disponíveis no momento.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.75rem' }}>
                  {paymentOverview.temposProcessamento.map((tempo) => (
                    <li key={tempo.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <strong>{tempo.orderId}</strong>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                        Autorização em {tempo.authorizationSeconds?.toFixed(0) ?? '—'}s • Captura em{' '}
                        {tempo.captureSeconds?.toFixed(0) ?? '—'}s
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="card" style={{ boxShadow: 'none', border: '1px solid #e2e8f0' }}>
              <h3>Transações recentes</h3>
              <p style={{ color: '#64748b' }}>Últimos pagamentos processados com status atualizado.</p>
              {paymentTransactions.length === 0 ? (
                <p style={{ color: '#94a3b8' }}>Nenhuma transação encontrada para o filtro selecionado.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.75rem' }}>
                  {paymentTransactions.map((transaction) => (
                    <li key={transaction.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>{formatMethod(transaction.method)}</strong>
                        <span style={{ fontWeight: 600 }}>
                          {transaction.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                        Pedido {transaction.orderId} • {formatStatus(transaction.status)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="card">
        <h2>Estoque crítico</h2>
        <p style={{ color: '#64748b' }}>Produtos que precisam de reposição imediata.</p>
        <table className="table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Estoque</th>
            </tr>
          </thead>
          <tbody>
            {metrics.lowStock.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.stock} unidades</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

const KpiCard = ({ title, value, helper, highlight = 'neutro' }) => {
  const highlightColor =
    highlight === 'positivo' ? '#0f766e' : highlight === 'negativo' ? '#b91c1c' : '#475569'
  return (
    <div className="card" style={{ boxShadow: 'none', border: '1px solid #e2e8f0' }}>
      <p style={{ color: '#94a3b8', marginBottom: '0.25rem' }}>{title}</p>
      <strong style={{ fontSize: '1.75rem', color: highlightColor }}>{value}</strong>
      <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: 0 }}>{helper}</p>
    </div>
  )
}

const formatMethod = (method) => {
  const map = {
    cartao_credito: 'Cartão de crédito',
    pix: 'PIX',
    boleto: 'Boleto bancário',
    carteira_digital: 'Carteira digital'
  }
  return map[method] || method
}

const formatStatus = (status) => {
  const map = {
    capturado: 'Capturado',
    recusado: 'Recusado',
    em_analise: 'Em análise',
    estornado: 'Estornado',
    aguardando_pagamento: 'Aguardando pagamento',
    sem_liquidacao: 'Sem liquidação',
    previsto: 'Previsto',
    liquidado: 'Liquidado',
    pendente: 'Pendente'
  }
  return map[status] || status
}

const formatDate = (value) => {
  if (!value) return 'Data a confirmar'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Data a confirmar' : date.toLocaleDateString('pt-BR')
}

export default DashboardPage
