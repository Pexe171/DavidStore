# David Store

Aplicação completa de e-commerce inspirada no padrão Casas Bahia, com vitrine digital moderna, carrinho, checkout humanizado e painel administrativo inteligente.

## Visão geral

O projeto é composto por duas aplicações:

- **Backend (Node.js + Express + Prisma/PostgreSQL):** expõe APIs para produtos, categorias, pedidos, autenticação JWT e métricas do painel, agora com persistência real e migrations versionadas.
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
- Docker + Docker Compose (opcional, mas recomendado para um onboarding turbo)
- PostgreSQL 16+ (apenas se você preferir rodar tudo manualmente)

### Opção 1 — stack completa com Docker Compose

1. Copie as variáveis de ambiente base: `cp backend/.env.example backend/.env` (ajuste o `JWT_SECRET` se quiser algo mais forte).
2. Suba toda a stack: `docker compose up --build`.
3. Popular o banco com os dados de demonstração: `docker compose exec backend npm run db:seed`.

Pronto! A API responde em `http://localhost:4000` e o frontend em `http://localhost:5173`.

Credenciais padrão para explorar o painel administrativo:

- E-mail: `admin@davidstore.com`
- Senha: `admin123`

### Opção 2 — rodando manualmente (sem Docker)

1. Garanta um PostgreSQL rodando e crie um banco chamado `davidstore`.
2. Copie o `.env` do backend e ajuste o `DATABASE_URL` se necessário:

   ```bash
   cd backend
   cp .env.example .env
   npm install
   npm run migrate:deploy
   npm run db:seed
   npm run dev
   ```

   A API ficará disponível em `http://localhost:4000`.

3. Em outro terminal, suba o frontend:

   ```bash
   cd frontend
   npm install
   cp .env.example .env
   npm run dev
   ```

> 💡 Para criar novas migrations durante o desenvolvimento, utilize `npm run migrate:dev -- --name <descricao>` no diretório `backend`.

### Dev Container (VS Code)

Há um `.devcontainer/devcontainer.json` configurado. Abra a pasta no VS Code, aceite a sugestão "Reopen in Container" e aguarde o provisioning: Docker, banco, dependências e scripts já sobem prontos para você focar no código.

#### Endpoints de destaque

- `GET /dashboard`: KPIs de vendas, estoque crítico e resumo financeiro do gateway.
- `GET /gateway/overview`: visão 360º do David Pay com volume bruto, líquido, métodos e alertas.
- `GET /gateway/transacoes`: lista transacional com filtros por status e método (`?status=capturado&method=pix`).

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
- **API estruturada** por camadas (controllers, services, middleware) com persistência real em PostgreSQL/Prisma e pronta para escalar.

## Próximos passos sugeridos

- Pipeline de CI com testes, lint e checagem de migrations automatizada.
- Integração com provedores de pagamento e logística.
- Testes automatizados end-to-end com Playwright ou Cypress.
- Internacionalização e acessibilidade aprimoradas.

## Licença

Este projeto é distribuído sob a licença MIT.
