# David Store

Aplicação completa de e-commerce inspirada no padrão Casas Bahia, com vitrine digital moderna, carrinho, checkout humanizado e painel administrativo inteligente.

## Visão geral

O projeto é composto por duas aplicações:

- **Backend (Node.js + Express):** expõe APIs para produtos, categorias, pedidos, autenticação JWT e métricas do painel.
- **Frontend (React + Vite):** oferece a experiência David Store para clientes e administradores, incluindo vitrine, carrinho, checkout e dashboard.

## Estrutura de pastas

```
DavidStore/
├── backend/          # API REST com autenticação e painel administrativo
└── frontend/         # SPA em React consumindo a API e exibindo a loja
```

## Como executar localmente

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Backend

```bash
cd backend
npm install
npm run dev
```

A API ficará disponível em `http://localhost:4000`.

Credenciais padrão para o painel:

- E-mail: `admin@davidstore.com`
- Senha: `admin123`

#### Endpoints de destaque

- `GET /dashboard`: KPIs de vendas, estoque crítico e resumo financeiro do gateway.
- `GET /gateway/overview`: visão 360º do David Pay com volume bruto, líquido, métodos e alertas.
- `GET /gateway/transacoes`: lista transacional com filtros por status e método (`?status=capturado&method=pix`).

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

O aplicativo web ficará disponível em `http://localhost:5173`.

## Recursos principais

- **Vitrine responsiva** com filtros por categoria, destaques e cards ricos.
- **Detalhes completos do produto** com galerias, benefícios e preços promocionais.
- **Carrinho inteligente** com resumo, remoção de itens e total dinâmico.
- **Checkout humanizado** com formulário validado e envio de pedido para a API.
- **Painel administrativo** com autenticação automática, KPIs e monitoramento de estoque crítico.
- **Dashboard financeiro David Pay** com visão completa do gateway de pagamento, taxa de aprovação, agenda de liquidação e alertas de risco.

### Painel financeiro em detalhes

- KPIs de volume bruto, líquido, ticket médio aprovado e tempo médio de liquidação.
- Mix de métodos (cartão, PIX, boleto e carteira digital) com percentuais e montantes.
- Alertas inteligentes de risco, chargeback e revisão antifraude com contexto do cliente.
- Agenda de liquidações futuras e acompanhamento do tempo de autorização/captura.
- Lista de transações recentes com filtros por método e status via API dedicada.
- **API estruturada** por camadas (controllers, services, middleware) com dados mockados e prontos para expansão.

## Próximos passos sugeridos

- Persistência real em banco de dados (PostgreSQL ou MongoDB).
- Integração com provedores de pagamento e logística.
- Testes automatizados end-to-end com Playwright ou Cypress.
- Internacionalização e acessibilidade aprimoradas.

## Licença

Este projeto é distribuído sob a licença MIT.
