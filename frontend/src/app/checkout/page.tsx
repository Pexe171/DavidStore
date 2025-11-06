'use client'

import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

import { useCart } from '@/contexts/CartContext'
import { submitOrder } from '@/services/api'

type CheckoutForm = {
  name: string
  email: string
  document: string
  address: string
  paymentMethod: string
}

type CheckoutStatus = {
  type: 'success' | 'error' | ''
  message: string
}

const initialForm: CheckoutForm = {
  name: '',
  email: '',
  document: '',
  address: '',
  paymentMethod: 'pix'
}

const CheckoutPage = (): JSX.Element => {
  const { items, total, clearCart } = useCart()
  const [form, setForm] = useState<CheckoutForm>(initialForm)
  const [status, setStatus] = useState<CheckoutStatus>({ type: '', message: '' })
  const [loading, setLoading] = useState<boolean>(false)
  const router = useRouter()

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setLoading(true)
    setStatus({ type: '', message: '' })

    try {
      await submitOrder({
        customer: {
          id: 'guest',
          name: form.name,
          email: form.email,
          document: form.document,
          address: form.address
        },
        items: items.map((item) => ({ productId: item.id, quantity: item.quantity }))
      })
      clearCart()
      setStatus({ type: 'success', message: 'Pedido confirmado! Você receberá atualizações no e-mail informado.' })
      setForm(initialForm)
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (error) {
      console.error('Erro ao finalizar compra:', error)
      setStatus({ type: 'error', message: 'Não foi possível concluir o pedido. Tente novamente mais tarde.' })
    } finally {
      setLoading(false)
    }
  }

  if (!items.length) {
    return (
      <section className="container" style={{ padding: '2rem 0 4rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h2>Você ainda não selecionou produtos</h2>
          <p>Adicione itens ao carrinho para seguir com o checkout humanizado da David Store.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="container" style={{ padding: '2rem 0 4rem' }}>
      <div className="card" style={{ display: 'grid', gap: '2rem' }}>
        <header>
          <h1>Checkout David Store</h1>
          <p style={{ color: '#64748b' }}>
            Atendimento consultivo, confirmação instantânea e personalização inspirada no varejo omnichannel.
          </p>
        </header>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <label style={{ display: 'grid', gap: '0.5rem' }}>
              Nome completo
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                style={{ padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5f5' }}
              />
            </label>
            <label style={{ display: 'grid', gap: '0.5rem' }}>
              E-mail
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                style={{ padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5f5' }}
              />
            </label>
            <label style={{ display: 'grid', gap: '0.5rem' }}>
              CPF/CNPJ
              <input
                name="document"
                value={form.document}
                onChange={handleChange}
                required
                style={{ padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5f5' }}
              />
            </label>
          </div>
          <label style={{ display: 'grid', gap: '0.5rem' }}>
            Endereço completo
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              style={{ padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5f5' }}
            />
          </label>
          <label style={{ display: 'grid', gap: '0.5rem' }}>
            Forma de pagamento
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              style={{ padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5f5' }}
            >
              <option value="pix">PIX David Pay</option>
              <option value="card">Cartão com David Shield</option>
              <option value="boleto">Boleto inteligente</option>
            </select>
          </label>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ margin: 0, color: '#94a3b8' }}>Total</p>
              <strong style={{ fontSize: '2rem' }}>
                {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </strong>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Confirmando pedido...' : 'Confirmar compra com David Pay'}
            </button>
          </div>
        </form>
        {status.message && (
          <div
            style={{
              padding: '1rem',
              borderRadius: '12px',
              background: status.type === 'success' ? '#dcfce7' : '#fee2e2',
              color: status.type === 'success' ? '#15803d' : '#b91c1c'
            }}
          >
            {status.message}
          </div>
        )}
      </div>
    </section>
  )
}

export default CheckoutPage
