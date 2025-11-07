# David Store

Bem-vindo à David Store, um ecossistema completo de e-commerce inspirado na experiência Casas Bahia — só que turbinado para o presente e o futuro. Aqui você encontra uma vitrine digital moderna, carrinho inteligente, checkout humanizado e um painel administrativo que entende o ritmo do seu negócio.

## 📚 Sumário
- [Visão Geral](#-visão-geral)
- [Tecnologias Principais](#-tecnologias-principais)
- [Arquitetura e Fluxos Principais](#-arquitetura-e-fluxos-principais)
- [Observabilidade e Resiliência](#-observabilidade-e-resiliência)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Guia de Execução](#-guia-de-execução)
  - [Pré-requisitos](#pré-requisitos)
  - [Checklist rápido](#checklist-rápido)
  - [Opção 1 — Stack completa com Docker Compose](#opção-1--stack-completa-com-docker-compose)
  - [Opção 2 — Execução manual](#opção-2--execução-manual)
  - [Scripts úteis do monorepo](#scripts-úteis-do-monorepo)
- [Configuração da Fila de Eventos (AWS SQS)](#-configuração-da-fila-de-eventos-aws-sqs)
- [Camada de Segurança da API](#-camada-de-segurança-da-api)
- [Gestão de Dados e DevOps](#-gestão-de-dados-e-devops)
- [Qualidade de Código e Testes](#-qualidade-de-código-e-testes)
- [Dev Container (VS Code)](#-dev-container-vs-code)
- [Endpoints em Destaque](#-endpoints-em-destaque)
- [Experiência do Usuário e Diferenciais](#-experiência-do-usuário-e-diferenciais)
- [Contribuição, Contato e Comunidade](#-contribuição-contato-e-comunidade)
- [Próximos Passos Sugeridos](#-próximos-passos-sugeridos)
- [Licença](#-licença)

## 🌟 Visão Geral
O projeto é um monorepo com duas aplicações principais trabalhando em harmonia:

- **Backend (Node.js + Express + Prisma/PostgreSQL):** expõe APIs para produtos, categorias, pedidos, autenticação JWT e métricas do painel, com persistência real, migrations versionadas e eventos distribuídos.
- **Frontend (Next.js + SSR/SSG + TypeScript):** entrega páginas pré-renderizadas para a vitrine, detalhes de produto, carrinho, checkout e dashboard, garantindo performance, SEO e uma experiência humana de ponta a ponta.

## 🧰 Tecnologias Principais
| Camada | Tecnologias | Por que usamos |
| --- | --- | --- |
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS, React Query, Playwright | Renderização híbrida (SSR/SSG), DX moderna, tipagem rígida e testes de ponta a ponta confiáveis. |
| **Backend** | Node.js 18, Express, Prisma ORM, Zod, Pino, OpenTelemetry | APIs performáticas, validações centralizadas e observabilidade pronta para produção. |
| **Dados** | PostgreSQL 16, Redis 7, Prisma Migrate | Persistência relacional com caching inteligente e versionamento de schema rastreável. |
| **Mensageria** | AWS SQS (ou fallback em memória), Worker Node | Fluxos assíncronos resilientes para pedidos, pagamentos e atualizações de dashboard. |
| **Infra/DevOps** | Docker, Docker Compose, Terraform, GitHub Actions, Dev Containers | Provisionamento reprodutível, pipelines automatizados e onboarding em minutos. |
| **Qualidade** | ESLint, Prettier, Jest, Testing Library, jest-axe | Código padronizado, cobertura de testes sólida e acessibilidade monitorada. |

## 🧠 Arquitetura e Fluxos Principais
- **Pedidos e David Pay desacoplados:** `createOrder` publica o evento `order.created` em uma fila AWS SQS provisionada via Terraform. O serviço de pagamentos consome esse evento para abrir a intenção de pagamento de forma assíncrona.
- **Fluxo de estoque transacional:** o pedido reserva o estoque sem abatê-lo. Após `payment.captured`, o saldo é consumido; se `payment.failed`, a reserva é liberada automaticamente.
- **Read model dedicado para o dashboard:** métricas e alertas são servidos a partir da tabela `DashboardSnapshot`, atualizada em background para respostas instantâneas mesmo em cenários de alto volume.
- **Fila plugável:** implementação padrão com AWS SQS, mantendo contrato estável para trocar por RabbitMQ/Kafka/Redis Streams quando necessário (`MESSAGE_QUEUE_DRIVER=in-memory` funciona como fallback local).

## 🔍 Observabilidade e Resiliência
- **Monorepo com tipos compartilhados:** o pacote `@davidstore/types` centraliza os esquemas Zod, garantindo contrato único entre API e React.
- **Logs estruturados com Pino:** toda requisição recebe contexto (trace/span ID) e sai pronta para ELK, Datadog ou similares.
- **Tracing distribuído com OpenTelemetry:** spans HTTP, Express e fila são gerados automaticamente com suporte OTLP.
- **Fila instrumentada:** producers e consumers SQS emitem logs/spans estruturados, mantendo rastreabilidade ponta a ponta.
- **Dashboard rebuild monitorado:** snapshots de métricas registram logs e traços, acelerando diagnósticos em incidentes.

## 🗂️ Estrutura de Pastas
```text
DavidStore/
├── backend/          # API REST com autenticação e painel administrativo
├── frontend/         # Frontend em Next.js com SSR/SSG e testes de acessibilidade
└── shared/types/     # Pacote de esquemas Zod compartilhados (workspace)
```

## 🚀 Guia de Execução
> Antes de tudo, rode `npm install` na raiz do repositório para instalar as dependências compartilhadas.

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Docker + Docker Compose (recomendado para onboarding rápido)
- PostgreSQL 16+ (apenas se optar por executar sem Docker)

### Checklist rápido
Antes de rodar qualquer comando, confirme:
1. `npm install` executado na raiz para instalar workspaces (`backend`, `frontend`, `shared`).
2. Arquivos `.env` clonados a partir dos exemplos (`backend/.env.example`, `frontend/.env.example`).
3. Docker em execução (caso use containers) e porta `3000`/`4000` livres.
4. Credenciais AWS válidas exportadas (se quiser usar SQS real e Terraform).

### Opção 1 — Stack completa com Docker Compose
1. Copie as variáveis de ambiente: `cp backend/.env.example backend/.env` (ajuste `JWT_SECRET_PRIMARY` e `JWT_SECRET_SECONDARY`).
2. Suba tudo: `docker compose up --build`.
3. Popule o banco com dados demo: `docker compose exec backend npm run --workspace backend db:seed`.

Após isso, o backend responde em `http://localhost:4000` e o frontend em `http://localhost:3000`.

Credenciais padrão para explorar o painel:
- E-mail: `admin@davidstore.com`
- Senha: `admin123`

### Opção 2 — Execução manual
1. Garanta um PostgreSQL rodando e crie o banco `davidstore`.
2. Copie e configure o `.env` do backend:
   ```bash
   cp backend/.env.example backend/.env
   npm run --workspace backend prisma:generate
   npm run --workspace backend migrate:deploy
   npm run --workspace backend db:seed
   npm run --workspace backend dev
   ```
   A API fica disponível em `http://localhost:4000`.
3. Em outro terminal, suba o frontend:
   ```bash
   npm run --workspace frontend dev
   ```
   O Next.js responde em `http://localhost:3000`. Ajuste `NEXT_PUBLIC_API_URL` caso a API esteja em outra origem.

#### Inicialização do frontend (detalhada)
- `npm run --workspace frontend dev`: modo desenvolvimento com HMR.
- `npm run --workspace frontend build && npm run --workspace frontend start`: build de produção servida pelo Next.js.
- `npm run --workspace frontend lint`: garante padrões ESLint/Prettier antes do commit.

#### Inicialização do backend (detalhada)
- `npm run --workspace backend dev`: sobe a API com reload automático (ts-node-dev).
- `npm run --workspace backend start`: builda e executa a versão compilada para produção.
- `npm run --workspace backend test`: roda suíte Jest focada em domínios críticos (pedidos, estoque, auth).

### Scripts úteis do monorepo
| Objetivo | Comando | Observações |
| --- | --- | --- |
| Instalar dependências | `npm install` | Executa na raiz e habilita os workspaces. |
| Checar tipos | `npm run typecheck` | Aproveita `tsconfig` compartilhado e detecta regressões cedo. |
| Lintar projeto | `npm run lint` | Aplica regras no backend e frontend de uma vez. |
| Formatar código | `npm run format` | Usa Prettier com opinião unificada. |
| Testes unitários | `npm test` | Orquestra Jest em paralelo nos workspaces. |
| Testes E2E | `npm run test:e2e` | Requer `playwright install --with-deps` antes do primeiro uso. |

> 💡 Para criar novas migrations durante o desenvolvimento, use `npm run migrate:dev -- --name <descricao>` dentro de `backend`.

## 📫 Configuração da Fila de Eventos (AWS SQS)
Defina as seguintes variáveis no `backend/.env` (ou use os parâmetros SSM gerados pela infraestrutura Terraform):
- `SQS_QUEUE_URL`: URL da fila (`terraform output events_queue_url`).
- `SQS_REGION`: região AWS (ex.: `us-east-1`).
- `SQS_ENDPOINT` (opcional): endpoint customizado (útil com LocalStack).
- `SQS_VISIBILITY_TIMEOUT_SECONDS`, `SQS_WAIT_TIME_SECONDS`, `SQS_MAX_NUMBER_OF_MESSAGES`, `SQS_POLL_INTERVAL_MS`, `SQS_BACKOFF_MS`: parâmetros para tunar o consumo.

Sem acesso à AWS? Basta definir `MESSAGE_QUEUE_DRIVER=in-memory` durante o desenvolvimento local.

## 🛡️ Camada de Segurança da API
- **Validação com Zod** em todos os fluxos críticos, com mensagens claras para o usuário.
- **Proteções HTTP** com Helmet, CORS configurável e payloads JSON limitados.
- **Rate limiting distribuído** com Redis e janelas específicas para login e rotas públicas.
- **Autenticação robusta** com refresh tokens persistidos e hashed, detectando reutilização indevida.
- **Rotação automática de chaves JWT** com identificação (`kid`) embutida no token.
- **Cookies HttpOnly** para refresh token (com fallback via corpo da requisição).

Variáveis úteis: `CORS_ALLOWED_ORIGINS`, `RATE_LIMIT_*`, `JWT_ROTATION_INTERVAL_MINUTES`, `JWT_REFRESH_EXPIRES_IN_MS`, `LOG_LEVEL`, `OTEL_TRACING_ENABLED`, `OTEL_SERVICE_NAME`, `OTEL_EXPORTER_OTLP_*`.

## 🛠️ Gestão de Dados e DevOps
- **Cache de produtos com Redis:** TTL configurável via `PRODUCT_CACHE_TTL_SECONDS`, com invalidação automática em alterações.
- **Rate limiting centralizado:** middleware usa Redis como store principal (fallback em memória).
- **Stack IaC com Terraform:** em `infrastructure/terraform` há templates para VPC, EC2, RDS PostgreSQL, ElastiCache Redis, SQS e parâmetros SSM. Execute `terraform init && terraform apply -var-file=terraform.tfvars` após ajustar o exemplo.
- **Docker Compose com Redis pronto:** contêiner dedicado + variáveis pré-configuradas para desenvolvimento com cache e rate limiting distribuídos.

## ✅ Qualidade de Código e Testes
- TypeScript: `npm run typecheck`.
- ESLint/Prettier: `npm run lint` / `npm run format`.
- Testes unitários com Jest + Testing Library + jest-axe: `npm test`.
- Testes end-to-end com Playwright: `npm run test:e2e`.
- CI em `.github/workflows/ci.yml` rodando lint, type-check, unitários e E2E.

> Antes dos testes E2E, execute `npx playwright install --with-deps` dentro de `frontend` para instalar os navegadores.

## 🧳 Dev Container (VS Code)
Há um `.devcontainer/devcontainer.json` pronto. Abra o projeto no VS Code, escolha "Reopen in Container" e deixe o ambiente subir automaticamente com Docker, banco, dependências e scripts configurados.

## 🔗 Endpoints em Destaque
- `GET /dashboard`: KPIs de vendas, estoque crítico e resumo financeiro (role: admin).
- `GET /gateway/overview`: visão 360º do David Pay com volume bruto, líquido, métodos e alertas (role: admin).
- `GET /gateway/transacoes`: lista transacional com filtros (`?status=capturado&method=pix`) (role: admin).
- `PATCH /gateway/transacoes/:orderId/capturar`: captura financeira e libera estoque reservado (role: admin).
- `PATCH /gateway/transacoes/:orderId/recusar`: registra chargeback/falha e devolve reservas automaticamente (role: admin).

## 💡 Experiência do Usuário e Diferenciais
- **Vitrine responsiva** com filtros por categoria, destaques e cards ricos.
- **SSR/SSG com Next.js** para TTFB baixo e SEO consistente.
- **Detalhes completos do produto** com galerias, benefícios e preços promocionais.
- **Carrinho inteligente** com resumo, remoção de itens e total dinâmico.
- **Checkout humanizado** com validação clara e integração direta com a API.
- **Painel administrativo completo** com autenticação, KPIs e monitoramento de estoque crítico.
- **Contexto global de autenticação** no frontend, protegendo rotas e gerenciando sessão JWT.
- **Dashboard financeiro David Pay** com volume, mix de métodos, alertas e agenda de liquidação.

## 🤝 Contribuição, Contato e Comunidade
- **Como contribuir:** abra uma issue descrevendo o contexto, crie uma branch seguindo o padrão `feature/nome-curto`, desenvolva com commits pequenos e envie um PR mencionando a issue. Nosso template cobra descrição, testes executados e screenshots quando houver impacto visual.
- **Discussions & suporte:** use o board de Discussions para compartilhar ideias de features, melhorias UX e integrações externas. Dúvidas críticas podem ser abertas como issues marcadas com o label `support`.
- **Contato direto:** `time@davidstore.com` ou canal do Slack `#davidstore-dev` (solicite convite na issue `community-access`).
- **Reconhecimento da galera:** adicionamos automaticamente quem envia PR aprovado à lista de contribuidores abaixo.

| Contribuidores |
| --- |
| <sub>![](https://avatars.githubusercontent.com/u/9919?s=32)  ![](https://avatars.githubusercontent.com/u/2?s=32)  ![](https://avatars.githubusercontent.com/u/3?s=32)  ![](https://avatars.githubusercontent.com/u/4?s=32)  ![](https://avatars.githubusercontent.com/u/5?s=32)  ...</sub> |

> Curtiu o projeto? Considere dar uma ⭐ no repositório para sabermos que ele está sendo útil!

## 🧭 Próximos Passos Sugeridos
- Ampliar cobertura de testes (unitários, E2E e contratos de API).
- Integrar com provedores reais de pagamento e logística.
- Investir em internacionalização e aprimorar acessibilidade.

## 📄 Licença
Este projeto é distribuído sob a licença MIT.
