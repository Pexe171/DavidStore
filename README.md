# David Store

Aplicação completa de e-commerce inspirada no padrão Casas Bahia, com vitrine digital moderna, carrinho, checkout humanizado e painel administrativo inteligente.

## Visão geral

O projeto é composto por duas aplicações:

- **Backend (Node.js + Express + Prisma/PostgreSQL):** expõe APIs para produtos, categorias, pedidos, autenticação JWT e métricas do painel, agora com persistência real e migrations versionadas.
- **Frontend (React + Vite + TypeScript):** oferece a experiência David Store para clientes e administradores, incluindo vitrine, carrinho, checkout e dashboard.

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

1. Copie as variáveis de ambiente base: `cp backend/.env.example backend/.env` (ajuste os segredos `JWT_SECRET_PRIMARY`/`JWT_SECRET_SECONDARY` para reforçar a rotação de chaves).
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

### Segurança aplicada na API

A camada de backend recebeu reforços de segurança completos:

- **Validação de entrada com Zod** em todos os fluxos sensíveis, garantindo mensagens humanizadas.
- **Proteções HTTP** com Helmet, políticas CORS configuráveis via variáveis de ambiente e limitação de payloads JSON.
- **Rate limiting inteligente** com janelas específicas para autenticação e uso geral.
- **Autenticação robusta** com refresh tokens persistidos e hashed no banco, detectando reutilização indevida e permitindo logout seguro.
- **Rotação automática de chaves JWT** com identificação (`kid`) embutida no token e intervalo configurável.
- **Cookies HttpOnly** para o refresh token (com fallback via corpo da requisição), facilitando aplicações SPA e mobile.

> Configure `CORS_ALLOWED_ORIGINS`, `RATE_LIMIT_*`, `JWT_ROTATION_INTERVAL_MINUTES` e `JWT_REFRESH_EXPIRES_IN_MS` para ajustar o comportamento em produção.


### Qualidade de código e testes

O frontend agora conta com uma esteira completa de qualidade:

- TypeScript com `npm run typecheck` e ESLint + Prettier (`npm run lint` / `npm run format`).
- Testes unitários com Vitest + Testing Library (`npm test`).
- Testes end-to-end com Playwright (`npm run test:e2e`).
- Workflow de CI (`.github/workflows/ci.yml`) que automatiza lint, type-check, unit tests e E2E.

> ⚙️ Antes de rodar os testes E2E localmente execute `npx playwright install --with-deps` dentro de `frontend` para instalar os navegadores.

### Dev Container (VS Code)

Há um `.devcontainer/devcontainer.json` configurado. Abra a pasta no VS Code, aceite a sugestão "Reopen in Container" e aguarde o provisioning: Docker, banco, dependências e scripts já sobem prontos para você focar no código.

#### Endpoints de destaque

- `GET /dashboard`: KPIs de vendas, estoque crítico e resumo financeiro do gateway. (Requer role: admin)
- `GET /gateway/overview`: visão 360º do David Pay com volume bruto, líquido, métodos e alertas. (Requer role: admin)
- `GET /gateway/transacoes`: lista transacional com filtros por status e método (`?status=capturado&method=pix`). (Requer role: admin)

## Recursos principais

- **Vitrine responsiva** com filtros por categoria, destaques e cards ricos.
- **Detalhes completos do produto** com galerias, benefícios e preços promocionais.
- **Carrinho inteligente** com resumo, remoção de itens e total dinâmico.
- **Checkout humanizado** com formulário validado e envio de pedido para a API.
- **Painel administrativo** com autenticação automática, KPIs e monitoramento de estoque crítico.
- **Contexto global de autenticação** no frontend, facilitando a proteção de rotas e o gerenciamento da sessão JWT.
- **Dashboard financeiro David Pay** com visão completa do gateway de pagamento, taxa de aprovação, agenda de liquidação e alertas de risco.

### Painel financeiro em detalhes

- KPIs de volume bruto, líquido, ticket médio aprovado e tempo médio de liquidação.
- Mix de métodos (cartão, PIX, boleto e carteira digital) com percentuais e montantes.
- Alertas inteligentes de risco, chargeback e revisão antifraude com contexto do cliente.
- Agenda de liquidações futuras e acompanhamento do tempo de autorização/captura.
- Lista de transações recentes com filtros por método e status via API dedicada.
- **API estruturada** por camadas (controllers, services, middleware) com persistência real em PostgreSQL/Prisma e pronta para escalar.

## Próximos passos sugeridos

- Expandir a cobertura de testes (unitários e E2E) e adicionar testes de contrato da API.
- Integração com provedores de pagamento e logística.
- Internacionalização e acessibilidade aprimoradas.

## Licença

Este projeto é distribuído sob a licença MIT.
