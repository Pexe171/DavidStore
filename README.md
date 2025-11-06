# David Store

Aplicação completa de e-commerce inspirada no padrão Casas Bahia, com vitrine digital moderna, carrinho, checkout humanizado e painel administrativo inteligente.

## Visão geral

O projeto é composto por duas aplicações:

- **Backend (Node.js + Express + Prisma/PostgreSQL):** expõe APIs para produtos, categorias, pedidos, autenticação JWT e métricas do painel, agora com persistência real e migrations versionadas.
- **Frontend (Next.js + SSR/SSG + TypeScript):** entrega HTML pré-renderizado para homepage e detalhes de produto, garantindo vitrine veloz, carrinho, checkout e dashboard em uma experiência David Store completa.

### Arquitetura orientada a eventos e pronta para escalar

- **Pedidos e David Pay desacoplados:** `createOrder` publica um evento `order.created` em uma fila em memória que simula RabbitMQ/Kafka. O serviço de pagamentos consome esse evento para abrir a intenção de pagamento de forma assíncrona.
- **Fluxo de estoque transacional:** a criação do pedido reserva o estoque (sem baixar do saldo real). Apenas após o evento `payment.captured` o estoque é consumido definitivamente. Em caso de falha (`payment.failed`) a reserva é liberada automaticamente.
- **Read model dedicado para o dashboard:** métricas e alertas agora são servidos a partir da tabela `DashboardSnapshot`, regenerada em background sempre que pedidos ou pagamentos mudam de status. O painel passa a responder instantaneamente mesmo com alto volume de dados.
- **Fila plugável:** a implementação atual usa Node EventEmitter como broker em memória, facilitando o swap por RabbitMQ/Kafka/Redis Streams em produção sem alterar o domínio.

### Observabilidade, DX e resiliência de nível sênior

- **Monorepo com tipos compartilhados:** backend, frontend e o pacote `@davidstore/types` vivem no mesmo workspace. Os esquemas Zod usados pela API são publicados e reutilizados no React, eliminando divergências de contrato.
- **Logs estruturados com Pino:** cada requisição ganha contexto (trace/span ID) e logs padronizados, prontos para ferramentas como ELK ou Datadog.
- **Tracing distribuído com OpenTelemetry:** a API exporta spans automaticamente (HTTP, Express, fila de eventos) com opção de envio para um collector OTLP. Assim fica simples rastrear uma compra do clique até a captura financeira.
- **Fila instrumentada e resiliente:** o broker em memória agora gera spans e logs próprios, facilitando a troca por RabbitMQ/Kafka sem perder observabilidade.
- **Dashboard rebuild assíncrono monitorado:** snapshots de métricas são reconstruídos via eventos e registrados em logs/traços, garantindo diagnósticos rápidos em incidentes.

## Estrutura de pastas

```
DavidStore/
├── backend/          # API REST com autenticação e painel administrativo
├── frontend/         # Frontend em Next.js com SSR/SSG e testes de acessibilidade
└── shared/types/     # Pacote de esquemas Zod compartilhados (workspace)
```

## Como executar localmente

> Execute `npm install` na raiz do repositório para instalar todas as dependências do workspace antes de seguir qualquer opção abaixo.

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Docker + Docker Compose (opcional, mas recomendado para um onboarding turbo)
- PostgreSQL 16+ (apenas se você preferir rodar tudo manualmente)

### Opção 1 — stack completa com Docker Compose

1. Copie as variáveis de ambiente base: `cp backend/.env.example backend/.env` (ajuste os segredos `JWT_SECRET_PRIMARY`/`JWT_SECRET_SECONDARY` para reforçar a rotação de chaves).
2. Suba toda a stack: `docker compose up --build`.
3. Popular o banco com os dados de demonstração: `docker compose exec backend npm run --workspace backend db:seed`.

Pronto! A API responde em `http://localhost:4000` e o frontend em `http://localhost:3000`.

Credenciais padrão para explorar o painel administrativo:

- E-mail: `admin@davidstore.com`
- Senha: `admin123`

### Opção 2 — rodando manualmente (sem Docker)

1. Garanta um PostgreSQL rodando e crie um banco chamado `davidstore`.
2. Copie o `.env` do backend e ajuste o `DATABASE_URL` se necessário:

   ```bash
   cp backend/.env.example backend/.env
   npm run --workspace backend prisma:generate
   npm run --workspace backend migrate:deploy
   npm run --workspace backend db:seed
   npm run --workspace backend dev
   ```

   A API ficará disponível em `http://localhost:4000`.

3. Em outro terminal, suba o frontend:

   ```bash
   npm run --workspace frontend dev
   ```

   O Next.js atenderá em `http://localhost:3000`. Ajuste `NEXT_PUBLIC_API_URL` se quiser apontar para outra origem da API.

> 💡 Para criar novas migrations durante o desenvolvimento, utilize `npm run migrate:dev -- --name <descricao>` no diretório `backend`.

### Segurança aplicada na API

A camada de backend recebeu reforços de segurança completos:

- **Validação de entrada com Zod** em todos os fluxos sensíveis, garantindo mensagens humanizadas.
- **Proteções HTTP** com Helmet, políticas CORS configuráveis via variáveis de ambiente e limitação de payloads JSON.
- **Rate limiting inteligente** com janelas específicas para autenticação e uso geral, agora distribuído com Redis para manter proteção consistente em múltiplas réplicas.
- **Autenticação robusta** com refresh tokens persistidos e hashed no banco, detectando reutilização indevida e permitindo logout seguro.
- **Rotação automática de chaves JWT** com identificação (`kid`) embutida no token e intervalo configurável.
- **Cookies HttpOnly** para o refresh token (com fallback via corpo da requisição), facilitando aplicações SPA e mobile.

> Configure `CORS_ALLOWED_ORIGINS`, `RATE_LIMIT_*`, `JWT_ROTATION_INTERVAL_MINUTES` e `JWT_REFRESH_EXPIRES_IN_MS` para ajustar o comportamento em produção.
> Para observabilidade, ajuste `LOG_LEVEL`, `OTEL_TRACING_ENABLED`, `OTEL_SERVICE_NAME` e `OTEL_EXPORTER_OTLP_*` conforme o provedor de monitoramento escolhido.


### Gestão de dados e DevOps

- **Cache de produtos com Redis:** o catálogo responde mais rápido graças ao cache distribuído com TTL configurável via `PRODUCT_CACHE_TTL_SECONDS`. O backend invalida automaticamente as chaves sempre que um produto é criado, editado ou removido.
- **Rate limiting centralizado:** o middleware agora usa Redis como store principal (com fallback em memória), garantindo limites consistentes mesmo em um cluster de múltiplas instâncias.
- **Stack IaC completa com Terraform:** em `infrastructure/terraform` você encontra um template AWS que provisiona VPC, EC2 para o backend, RDS PostgreSQL, ElastiCache Redis, SQS e parâmetros SSM. Execute `terraform init && terraform apply -var-file=terraform.tfvars` após ajustar o `terraform.tfvars.example`.
- **Docker Compose com Redis pronto:** o ambiente local ganhou um contêiner Redis dedicado e variáveis de ambiente já configuradas para aproveitar cache e rate limiting distribuído durante o desenvolvimento.

### Qualidade de código e testes

O frontend agora conta com uma esteira completa de qualidade:

- TypeScript com `npm run typecheck` e ESLint + Prettier (`npm run lint` / `npm run format`).
- Testes unitários com Jest + Testing Library e auditoria de acessibilidade via jest-axe (`npm test`).
- Testes end-to-end com Playwright (`npm run test:e2e`).
- Workflow de CI (`.github/workflows/ci.yml`) que automatiza lint, type-check, unit tests e E2E.

> ⚙️ Antes de rodar os testes E2E localmente execute `npx playwright install --with-deps` dentro de `frontend` para instalar os navegadores.

### Dev Container (VS Code)

Há um `.devcontainer/devcontainer.json` configurado. Abra a pasta no VS Code, aceite a sugestão "Reopen in Container" e aguarde o provisioning: Docker, banco, dependências e scripts já sobem prontos para você focar no código.

#### Endpoints de destaque

- `GET /dashboard`: KPIs de vendas, estoque crítico e resumo financeiro do gateway. (Requer role: admin)
- `GET /gateway/overview`: visão 360º do David Pay com volume bruto, líquido, métodos e alertas. (Requer role: admin)
- `GET /gateway/transacoes`: lista transacional com filtros por status e método (`?status=capturado&method=pix`). (Requer role: admin)
- `PATCH /gateway/transacoes/:orderId/capturar`: confirma a captura financeira de um pedido e libera o consumo definitivo do estoque reservado. (Requer role: admin)
- `PATCH /gateway/transacoes/:orderId/recusar`: registra falha/chargeback do pagamento e devolve automaticamente as reservas de estoque. (Requer role: admin)

## Recursos principais

- **Vitrine responsiva** com filtros por categoria, destaques e cards ricos.
- **SSR/SSG com Next.js** garantindo TTFB baixo na Home e páginas de produto, favorecendo SEO e performance.
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
