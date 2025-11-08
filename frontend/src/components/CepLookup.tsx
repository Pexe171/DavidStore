'use client'

import { useState, type FC, type FormEvent } from 'react'

type CepResult = {
  cep: string
  endereco?: string
  bairro?: string
  cidade?: string
  estado?: string
}

const sanitizeCep = (value: string): string => value.replace(/\D/g, '')

const normalizeCepResponse = (payload: Record<string, unknown>): CepResult => {
  const getString = (...keys: string[]): string | undefined => {
    for (const key of keys) {
      const value = payload[key]
      if (typeof value === 'string' && value.trim().length > 0) {
        return value
      }
    }
    return undefined
  }

  return {
    cep: getString('cep', 'code') ?? '',
    endereco: getString('logradouro', 'address', 'street'),
    bairro: getString('bairro', 'district', 'neighborhood'),
    cidade: getString('localidade', 'city'),
    estado: getString('uf', 'state')
  }
}

const CepLookup: FC = () => {
  const [cep, setCep] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CepResult | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const sanitizedCep = sanitizeCep(cep)

    if (sanitizedCep.length !== 8) {
      setError('Digite um CEP válido com 8 dígitos.')
      setResult(null)
      return
    }

    try {
      setLoading(true)
      setError('')
      setResult(null)

      const response = await fetch('https://api.cep.rest/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cep: sanitizedCep })
      })

      if (!response.ok) {
        throw new Error('Resposta inválida do serviço de CEP.')
      }

      const payload = (await response.json()) as Record<string, unknown>
      const normalized = normalizeCepResponse(payload)

      if (!normalized.cep) {
        throw new Error('Não foi possível normalizar o CEP informado.')
      }

      setResult(normalized)
    } catch (lookupError) {
      console.error('Erro ao consultar CEP na David Store', lookupError)
      setError('Não encontramos esse CEP. Revise o número ou tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="container cep-lookup">
      <div className="cep-lookup__content">
        <span className="badge badge--highlight">Frete inteligente</span>
        <h2 className="section-title">Veja o que chega hoje na sua região</h2>
        <p>
          Consulte a disponibilidade de entrega relâmpago, retirada em loja e
          instalação assistida informando o CEP. Tudo com dados em tempo real.
        </p>
        <form className="cep-lookup__form" onSubmit={handleSubmit}>
          <label htmlFor="cep-input">Digite seu CEP</label>
          <div className="cep-lookup__input-group">
            <input
              id="cep-input"
              inputMode="numeric"
              maxLength={9}
              placeholder="00000-000"
              value={cep}
              onChange={(event) => setCep(event.target.value)}
              aria-describedby="cep-feedback"
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Consultando...' : 'Consultar'}
            </button>
          </div>
          <span
            id="cep-feedback"
            className="cep-lookup__feedback"
            aria-live="polite"
          >
            {error}
          </span>
        </form>
        {result ? (
          <div className="cep-lookup__result" role="status">
            <p>
              <strong>CEP:</strong> {result.cep}
            </p>
            {result.endereco ? (
              <p>
                <strong>Endereço:</strong> {result.endereco}
              </p>
            ) : null}
            {result.bairro ? (
              <p>
                <strong>Bairro:</strong> {result.bairro}
              </p>
            ) : null}
            <p>
              <strong>Cidade:</strong> {result.cidade ?? '—'} /{' '}
              {result.estado ?? '—'}
            </p>
          </div>
        ) : null}
      </div>
      <div className="cep-lookup__media">
        <div className="cep-lookup__badge">Entrega em 2h</div>
        <p>
          Os CEPs atendidos recebem entregas em até 2h com acompanhamento em
          tempo real pelo app David Store.
        </p>
      </div>
    </section>
  )
}

export default CepLookup
