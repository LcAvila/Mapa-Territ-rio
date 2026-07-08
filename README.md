# Mapa Território

Sistema web para **gestão territorial**, **cadastro de clientes**, **planejamento logístico** e **execução de roteiros de visita** no Brasil. Combina mapas interativos (estados, municípios, bairros e clientes), painel administrativo completo, autenticação via Supabase e API REST em Node.js com PostgreSQL (Supabase)..

---

## Índice

1. [Visão geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Stack tecnológica](#stack-tecnológica)
4. [Estrutura de pastas](#estrutura-de-pastas)
5. [Variáveis de ambiente](#variáveis-de-ambiente)
6. [Como executar](#como-executar)
7. [Banco de dados e schemas](#banco-de-dados-e-schemas)
8. [API REST — rotas completas](#api-rest--rotas-completas)
9. [Autenticação e permissões](#autenticação-e-permissões)
10. [Funcionalidades do frontend](#funcionalidades-do-frontend)
11. [Módulo de roteiros e visitas](#módulo-de-roteiros-e-visitas)
12. [Geocodificação e mapas](#geocodificação-e-mapas)
13. [Scripts utilitários](#scripts-utilitários)
14. [Docker](#docker)
15. [Migrações](#migrações)
16. [Limitações conhecidas](#limitações-conhecidas)

---

## Visão geral

O **Mapa Território** permite que empresas com equipes de campo:

| Área | O que o sistema faz |
|------|---------------------|
| **Mapa** | Visualizar territórios por UF/município, clientes no mapa, heatmap, filtros por representante, modo planejamento/atendimento |
| **Clientes** | CRUD com endereço, CEP, geocodificação automática, vínculo a representante |
| **Territórios** | Atribuir municípios/UF a usuários, importação em lote, reivindicação |
| **Usuários** | Hierarquia (admin → supervisor → representante), tipos de usuário, grupos, permissões por módulo |
| **Visitas / Roteiros** | Agendar roteiro manual, ordenação por menor distância, supervisão, mapa da rota, check-in/checkout, resultados |
| **Notificações** | Alertas globais ou por usuário, controle de lidas |
| **Social** | Feed interno com posts, comentários e reações |
| **Auditoria** | Log de atividades e ações administrativas |
| **Logística** | Planilhas, blocos de viagem, clusters, distâncias (legado + planejamento por ciclos) |

---

## Arquitetura

```
┌─────────────────┐     HTTPS/JWT      ┌─────────────────┐
│  Frontend       │ ◄────────────────► │  Backend        │
│  React + Vite   │     REST /api/*    │  Express 5      │
│  :8080          │                    │  :3001          │
└────────┬────────┘                    └────────┬────────┘
         │                                      │
         │ Supabase Auth                          │ Prisma ORM
         ▼                                      ▼
┌─────────────────┐                    ┌─────────────────┐
│  Supabase Auth  │                    │  PostgreSQL     │
│  (JWT)          │                    │  (Supabase DB)  │
└─────────────────┘                    └─────────────────┘
                                                │
         ┌──────────────────────────────────────┤
         ▼                                      ▼
  HERE API (rotas/geocode)              Nominatim (fallback)
  ViaCEP (CEP)                          Python (planilhas)
```

- **Frontend** autentica diretamente no **Supabase Auth** e envia o `Bearer token` para o backend.
- **Backend** valida o token com Supabase, carrega o usuário no Prisma (com cache de sessão) e aplica **permissões por módulo**.
- Em falha do Prisma, várias rotas usam **fallback HTTP** via `supabaseAdmin` (service role).

---

## Stack tecnológica

### Backend (`/backend`)

| Tecnologia | Uso |
|------------|-----|
| **Node.js** + **TypeScript** | Runtime e tipagem |
| **Express 5** | API REST |
| **Prisma 5** | ORM e migrações PostgreSQL |
| **Supabase JS** | Auth + fallback HTTP |
| **Zod** | Validação de payloads |
| **bcryptjs** | Hash de senhas (legado/admin seed) |
| **Helmet**, **CORS**, **express-rate-limit**, **hpp** | Segurança |
| **Axios** | HERE API, Nominatim, serviços externos |
| **Multer** | Upload de planilhas |
| **xlsx** | Leitura/escrita Excel |
| **Python 3** (`process_planilha.py`) | Processamento de planilhas logísticas |

### Frontend (`/frontend`)

| Tecnologia | Uso |
|------------|-----|
| **React 18** | UI |
| **Vite 5** | Build e dev server |
| **TypeScript** | Tipagem (`strictNullChecks: true` no app) |
| **React Router 6** | Rotas SPA |
| **TanStack Query** | Cache de dados da API |
| **Tailwind CSS** + **shadcn/ui** (Radix) | Componentes e design system |
| **Leaflet** + **react-leaflet** | Mapas (mapa BR, rotas, picker de endereço) |
| **@turf/turf** | Operações geoespaciais |
| **Framer Motion** | Animações |
| **Supabase JS** | Login e sessão |
| **Zod** + **react-hook-form** | Formulários |
| **Sonner** | Toasts |
| **Recharts** | Gráficos no admin |
| **xlsx**, **html2canvas** | Exportações |

### Infraestrutura

| Item | Detalhe |
|------|---------|
| **PostgreSQL** | Supabase (pooler 6543 em dev) |
| **Docker Compose** | `backend` + `frontend` em desenvolvimento |
| **Supabase migrations** | `supabase/migrations/` (módulo de rotas inicial) |

---

## Estrutura de pastas

```
Mapa-Territorio/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Modelos Prisma (fonte da verdade)
│   │   ├── migrations/            # Migrações Prisma
│   │   └── seed.ts                # Seed admin, módulos, permissões
│   ├── src/
│   │   ├── server.ts              # Entrada Express, montagem de rotas
│   │   ├── prisma.ts
│   │   ├── controllers/           # visit-route, route-planning
│   │   ├── services/              # VisitRouteService, HereRouting, etc.
│   │   ├── routes/                # Rotas HTTP por domínio
│   │   ├── middlewares/           # auth, security
│   │   ├── utils/                 # geocoding, validation, client-coordinates
│   │   └── scripts/               # geocode, admin, diagnóstico
│   ├── scripts/
│   │   └── apply-schema-fix.js    # SQL idempotente (pooler-friendly)
│   └── process_planilha.py
├── frontend/
│   ├── src/
│   │   ├── pages/                 # Index, Admin, Login, RoteiroExecucao...
│   │   ├── components/            # Mapa, admin, UI
│   │   ├── contexts/              # Auth, Theme, Rotas
│   │   ├── hooks/                 # API, routing, geo
│   │   └── services/              # route-planning (cliente HTTP)
│   └── public/
├── supabase/migrations/           # SQL adicional (ex.: route_cycles)
└── docker-compose.yml
```

---

## Variáveis de ambiente

Arquivo `.env` na raiz ou em `backend/.env` (o `server.ts` carrega ambos).

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | Sim | PostgreSQL (Prisma; frequentemente pooler Supabase `:6543`) |
| `DIRECT_URL` | Sim | URL direta para migrações Prisma (`directUrl` no schema) |
| `SUPABASE_URL` | Sim | URL do projeto Supabase |
| `SUPABASE_ANON_KEY` | Sim | Chave anon (frontend + validação auth) |
| `SUPABASE_SERVICE_ROLE_KEY` | Sim | Service role (bypass RLS no backend) |
| `JWT_SECRET` | Sim | Segredo legado/auxiliar |
| `PORT` | Não | Porta do backend (padrão `3001`) |
| `FRONTEND_URL` | Não | Origem CORS em produção |
| `HERE_API_KEY` | Recomendada | Geocodificação e rotas HERE |
| `NODE_ENV` | Não | `development` / `production` |
| `PYTHON_PATH` | Não | Caminho do Python para `process_planilha.py` (padrão `python`) |

> **Nunca** commite `.env` com chaves reais.

---

## Como executar

### Desenvolvimento local

```bash
# Backend
cd backend
npm install
npx prisma generate
npm run dev          # http://localhost:3001

# Frontend (outro terminal)
cd frontend
npm install
npm run dev          # http://localhost:8080
```

### Docker

```bash
docker compose up --build
# Backend: http://localhost:3001
# Frontend: http://localhost:8080
```

### Build produção

```bash
cd backend && npm run build && npm start
cd frontend && npm run build   # saída em frontend/dist
```

### Schema no banco (quando `migrate deploy` travar no pooler)

```bash
cd backend
node scripts/apply-schema-fix.js
npx prisma generate   # com o backend parado
```

---

## Banco de dados e schemas

O schema oficial está em `backend/prisma/schema.prisma`. Tabelas mapeadas com `@@map` para nomes SQL em snake_case.

### Núcleo — usuários e permissões

| Modelo Prisma | Tabela SQL | Descrição |
|---------------|------------|-----------|
| `User` | `users` | Usuários: credenciais, perfil, endereço, foto, `supabase_id`, hierarquia `managedBy`/`managedUsers`, `token_version` (sessão única), preferências de notificação e workspace padrão |
| `Group` | `groups` | Grupos de usuários |
| `Module` | `modules` | Módulos do sistema (dashboard, mapa, users, clientes, etc.) |
| `UserPermission` | `user_permissions` | PK composta `(userId, moduleId)` — `canView`, `canEdit` |
| `UserType` | `user_types` | Tipos customizáveis (cor, ícone, `canVisit`, menu) |
| `UserActivity` | `user_activities` | Auditoria de ações do usuário |
| `Territory` | `territories` | Município/UF atribuído a usuário |
| `Bairro` | `bairros` | Bairros por município (import/planejamento) |
| `ConfigSistema` | `config_sistema` | Parâmetros globais chave-valor |
| `PlanilhaConfig` | — | Configuração de campos de planilhas (JSON) |

**Papéis (`User.role`):** `admin`, `supervisor`, `user`.

### Clientes e visitas (legado + planejamento)

| Modelo | Tabela | Descrição |
|--------|--------|-----------|
| `Cliente` | `clientes` | Cadastro principal: nome, endereço, CEP, CNPJ, lat/lng, `userId` (representante), prioridade, semana |
| `HistoricoVisitas` | `historico_visitas` | Histórico de visitas passadas |
| `PlanejamentoVisitas` | `planejamento_visitas` | Visitas planejadas por supervisor |
| `DistanciasLogistica` | `distancias_logistica` | Distâncias calculadas cliente × supervisor |
| `BlocosViagem` | `blocos_viagem` | Blocos logísticos por UF/semana |
| `ClustersCidades` | `clusters_cidades` | Agrupamento geográfico de cidades |

### Módulo de roteiros (planejamento avançado)

| Modelo | Tabela | Descrição |
|--------|--------|-----------|
| `RouteCycle` | `route_cycles` | Ciclo de planejamento (nome, datas, status, supervisor) |
| `RouteCycleWeek` | `route_cycle_weeks` | Semanas 1–4 dentro do ciclo |
| `RouteClientSnapshot` | `route_clients_snapshot` | Snapshot de cliente no ciclo |
| `RouteAssignment` | `route_assignments` | Cliente atribuído a uma semana |
| `RouteSequence` | `route_sequences` | Roteiro executável: nome, data, semana, coordenadas início/fim, distâncias, status |
| `RouteSequenceItem` | `route_sequence_items` | Parada: ordem, cliente, lat/lng, km da parada anterior, status |
| `RouteCluster` | `route_clusters` | Clusters por ciclo/semana |
| `RouteBlock` | `route_blocks` | Blocos de viagem no ciclo |
| `RouteExecutionLog` | `route_execution_logs` | Log de ações na execução |
| `VisitCheckin` | `visit_checkins` | Check-in/out com GPS |
| `VisitResult` | `visit_results` | Resultado da visita (venda, status, notas) |
| `RouteAuditLog` | `route_audit_logs` | Auditoria de alterações em entidades de rota |
| `RouteExport` | `route_exports` | Metadados de exportação (Excel/PDF) |

**Status de `RouteSequence.optimization_status` (exemplos):** `pending`, `em_execucao`, `completed`.

**Status de parada (`RouteSequenceItem.status`):** `pendente`, `agendada`, `em_rota`, `visitando`, `visitada`, `nao_visitada`, `remarcada`, `sem_sucesso`, `venda_feita`.

### Social e notificações

| Modelo | Tabela | Descrição |
|--------|--------|-----------|
| `FeedPost` | `feed_posts` | Publicações |
| `FeedComment` | `feed_comments` | Comentários |
| `FeedReaction` | `feed_reactions` | Reações (emoji) |
| `Notification` | `notifications` | Alertas (`targetAll`, `targetUserIds`, `senderName`) |
| `NotificationSeen` | `notification_seen` | Controle de leitura por usuário |

### Índices relevantes

- `route_cycles`: `supervisor_user_id`, `created_by`
- `route_sequences`: `route_cycle_id`, `week_id`, `supervisor_user_id`
- `route_sequence_items`: `route_sequence_id`, `client_snapshot_id`
- `user_permissions`: `userId`, `moduleId`
- `clientes`: `userId`

---

## API REST — rotas completas

Base URL: `http://localhost:3001` (dev).

Prefixo global: `/api/`. Quase todas as rotas protegidas exigem header:

```
Authorization: Bearer <supabase_access_token>
```

### `/api/auth`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/login` | Não | **Legado (410)** — login via Supabase no frontend |
| GET | `/me` | Sim | Dados do usuário logado; `?login=true` incrementa `token_version` |
| PUT | `/me` | Sim | Atualiza perfil (nome, endereço, foto, etc.) |
| GET | `/users/map` | Sim | Usuários para exibição no mapa |

### `/api/admin`

| Método | Rota | Permissão | Descrição |
|--------|------|-----------|-----------|
| GET | `/settings` | — | Configurações públicas do sistema |
| PUT | `/settings` | Admin | Salvar configurações |
| GET/POST/PUT/DELETE | `/user-types` | settings/edit | CRUD tipos de usuário |
| GET | `/users` | users/view | Listar usuários |
| GET | `/users/:id` | users/view | Detalhe do usuário |
| POST | `/users` | users/edit | Criar usuário (+ Supabase Auth) |
| PUT | `/users/:id` | users/edit | Atualizar usuário |
| DELETE | `/users/:id` | Admin | Excluir usuário |
| POST | `/users/:id/kick` | Admin | Invalidar sessões (`token_version`) |
| GET | `/users/:id/permissions` | — | Permissões do usuário |
| POST | `/users/:id/permissions` | users/edit | Salvar permissões |
| GET | `/users/:id/activities` | users/view | Atividades do usuário |
| PUT | `/users/:id/config` | users/edit | Workspace/tela padrão |
| PUT | `/users/:id/notif-prefs` | users/edit | Preferências de notificação |
| GET | `/territories` | territories/view | Listar territórios |
| POST | `/territories` | territories/edit | Criar território |
| POST | `/territories/claim` | Sim | Reivindicar município |
| DELETE | `/territories/unclaim` | Sim | Liberar território |
| DELETE | `/territories/:id` | territories/edit | Remover território |
| POST | `/territories/import` | Admin | Importar territórios em lote |
| POST | `/bairros/import` | Admin | Importar bairros |
| GET | `/audit` | audit/view | Logs de auditoria |
| DELETE | `/audit/clear` | Admin | Limpar auditoria (com confirmação) |
| GET | `/modules` | — | Módulos do sistema |
| GET | `/groups` | — | Grupos |

### `/api/clientes`

| Método | Rota | Permissão | Descrição |
|--------|------|-----------|-----------|
| GET | `/` | Sim | Listar clientes (filtros por UF, cidade, usuário) |
| POST | `/` | clientes/edit | Criar cliente + geocodificação automática |
| PUT | `/:id` | clientes/edit | Atualizar cliente + re-geocode se endereço mudou |
| DELETE | `/:id` | clientes/edit | Excluir cliente |

### `/api/visit-route`

Todas exigem autenticação.

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/summary` | Resumo dos roteiros (`?userId=` para filtrar representante) |
| GET | `/suggestions` | Sugestões de clientes sem visita recente (30 dias) |
| GET | `/sequence/:id` | Detalhe da sequência para execução |
| GET | `/:id/details` | Detalhe completo: endereços, CEP, motivos, km entre paradas |
| GET | `/:id/geojson` | GeoJSON para mapa (corrige coordenadas + `bounds`) |
| POST | `/manual` | Criar roteiro manual (clientes, data, nome, semana, ponto de partida) |
| PATCH | `/:id` | Editar nome, data, semana |
| DELETE | `/:id` | Excluir roteiro (bloqueado se `em_execucao`) |
| POST | `/:id/start` | Iniciar execução do roteiro |
| POST | `/checkin` | Check-in GPS em parada |
| POST | `/checkout` | Check-out |
| POST | `/result` | Registrar resultado da visita |

### `/api/notifications`

| Método | Rota | Permissão | Descrição |
|--------|------|-----------|-----------|
| GET | `/` | notifications/view | Histórico (filtrado por alvo para não-admin) |
| POST | `/` | notifications/edit | Criar notificação |
| POST | `/:id/seen` | Sim | Marcar como lida |
| DELETE | `/clear` | notifications/edit | Limpar notificações |

### `/api/feed`

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/` | Listar posts |
| POST | `/post` | Criar post |
| POST | `/comment` | Comentar |
| POST | `/react` | Reagir com emoji |

### `/api/routing`

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/route` | Calcular rota HERE entre waypoints (distância, duração, trechos) |

### `/api/geocode`

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/?address=` | Geocodificar endereço (HERE ou Nominatim) |

### `/api/location`

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/states` | Estados (IBGE) |
| GET | `/cities/:uf` | Municípios por UF |
| GET | `/districts/:ibgeCode` | Distritos |
| GET | `/neighborhoods-geojson/:ibgeCode` | Bairros GeoJSON |
| GET | `/bairros/:cidade/:uf` | Bairros cadastrados |

### `/api/birthdays`

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/month` | Aniversariantes do mês |

### `/api/planilha`

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/generate-plan` | Disparar geração de plano logístico |
| POST | `/upload-planilha` | Upload Excel → processamento Python |

### `/api/route-planning` (planejamento por ciclos)

> **Nota:** O serviço `RoutePlanningService` e o controller existem, e o frontend (`frontend/src/services/route-planning.ts`) chama estas rotas, porém **não estão montadas em `server.ts` no momento**. Para ativar, registre o router em `server.ts`.

Rotas previstas pelo controller:

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/cycles` | Criar ciclo de planejamento |
| GET | `/cycles/summary` | Resumo dos ciclos |
| POST | `/cycles/:id/distribute` | Distribuir clientes no ciclo |
| POST | `/sequences` | Gerar sequência por semana/supervisor |
| POST | `/sequences/:id/optimize` | Otimizar rota via HERE |

---

## Autenticação e permissões

### Fluxo

1. Usuário faz login no **frontend** via **Supabase Auth** (email/senha).
2. Frontend chama `GET /api/auth/me?login=true` com o JWT.
3. Backend valida JWT no Supabase, busca usuário no Prisma (ou fallback HTTP).
4. Permissões vêm de `user_permissions` + papel `role`.
5. Cache em memória (5 min, máx. 500 entradas) evita consultas repetidas.
6. `token_version` garante **sessão única** por usuário (novo login invalida tokens antigos).

### Middlewares

- `authenticate` — exige Bearer token válido.
- `requirePermission(moduleId, 'view' | 'edit')` — checa módulo.
- `requireAdmin` — apenas `role === 'admin'`.

### Módulos padrão (seed)

`dashboard`, `mapa`, `users`, `clientes`, `territories`, `reps`, `logistica`, `notifications`, `audit`, `routes`

---

## Funcionalidades do frontend

### Rotas SPA (`App.tsx`)

| Rota | Página | Acesso |
|------|--------|--------|
| `/login` | Login | Público |
| `/` | Redireciona para workspace padrão | Autenticado |
| `/mapa` | Mapa territorial (`Index.tsx`) | Autenticado |
| `/admin` | Painel administrativo | Autenticado (por permissão) |
| `/perfil` | Perfil do usuário | Autenticado |
| `/ajuda` | Ajuda | Autenticado |
| `/roteiro/:id` | Execução de roteiro em campo | Autenticado |

### Mapa (`/mapa`)

- Mapa do Brasil com UFs coloridas por representante/território.
- Drill-down: UF → município → bairros (GeoJSON IBGE + cadastro).
- Marcadores de clientes, heatmap, filtros por usuário.
- Modos **planejamento** e **atendimento**.
- Painel de detalhe de cliente, roteirização (`RoutingPanel` + HERE).
- Context menu no mapa, busca geográfica.

### Painel Admin (`/admin`)

Abas principais (via `?tab=` na URL):

| Tab | Função |
|-----|--------|
| `dashboard` | Métricas, atalhos, feed social |
| `baserotas` | Base de clientes (CRUD, filtros, mapa) |
| `visitas` | Acompanhamento de roteiros (`SupervisorRoutesPanel`) |
| `visitas_agendar` | Agendamento (`VisitScheduler`) |
| `territories` | Gestão de territórios e mapa mini-Brasil |
| `users` / `user_type_*` | Usuários por tipo |
| `groups` | Grupos |
| `notifications` | Enviar alertas |
| `system` | Configurações visuais do sistema |
| `user_types` | Tipos de usuário |
| `audit` | Logs de auditoria |

Componentes notáveis: `BrazilMap`, `SocialFeedPanel`, `AuditLogsPanel`, `SystemConfigPanel`, `NotificationSystem` (global).

---

## Módulo de roteiros e visitas

### Criar roteiro manual

1. Admin/supervisor em **Visitas → Agendamento**.
2. Seleciona representante, **nome do roteiro** (opcional), data, semana, clientes, ponto de partida (base ou GPS).
3. `POST /api/visit-route/manual`:
   - Resolve coordenadas (`client-coordinates.ts`: valida UF, corrige lat/lng invertidos, geocodifica).
   - Ordena clientes por **vizinho mais próximo**.
   - Grava `route_sequences` + `route_sequence_items` com `distance_from_previous_km`.

### Supervisão

- Lista em **Visitas → Acompanhamento**.
- Clique na linha → modal de **detalhes** (endereço, CEP, motivo, km).
- Menu: editar nome/data, ver mapa, excluir.
- Mapa: GeoJSON com pins corrigidos e `fitBounds` na região das paradas.

### Execução em campo (`/roteiro/:id`)

- Iniciar roteiro, check-in/check-out com GPS, registrar resultado de venda/status.

---

## Geocodificação e mapas

| Serviço | Arquivo | Uso |
|---------|---------|-----|
| **HERE Geocoding** | `utils/geocoding.ts` | Primário (`HERE_API_KEY`, `countryCode:BRA`) |
| **Nominatim** | `utils/geocoding.ts` | Fallback sem chave HERE |
| **ViaCEP** | `services/ViaCEPService.ts` | Consulta CEP (rota externa disponível em `external.routes.ts`) |
| **client-coordinates** | `utils/client-coordinates.ts` | Validação Brasil/UF, correção de swap, re-geocode |

Ao abrir mapa de roteiro, coordenadas incorretas no cadastro são **recalculadas e persistidas** automaticamente.

---

## Scripts utilitários

| Script | Comando | Descrição |
|--------|---------|-----------|
| Aplicar SQL de schema | `node scripts/apply-schema-fix.js` | Colunas/índices idempotentes |
| Geocode em massa | `npm run geocode-legacy` | `geocode-existing-clients.ts` |
| Seed | `npx prisma db seed` | Admin + módulos (cuidado: seed atual limpa usuários) |
| Criar admin | `ts-node src/scripts/create-admin.ts` | Admin local |
| Sync módulos | `ts-node src/scripts/sync-modules.ts` | Sincronizar módulos |

---

## Docker

`docker-compose.yml` define:

- **mapa_backend** — porta 3001, hot-reload via volume
- **mapa_frontend** — porta 8080, depende do backend
- Rede `mapa_network`

---

## Migrações

### Prisma (`backend/prisma/migrations/`)

Migrações incrementais desde mar/2026: usuários, grupos, feed, notificações, supervisor, `numero` em cliente, e-mail, alvos de notificação, **`name` em route_sequences**, sync schema rota/notificações.

### Supabase (`supabase/migrations/`)

- `20260512000000_add_route_module.sql` — tabelas completas do módulo de rotas (cycles, sequences, checkins, etc.)

### Aplicar migrações

```bash
cd backend
npx prisma migrate deploy    # pode travar no pooler 6543
# Alternativa:
node scripts/apply-schema-fix.js
```

---

## Limitações conhecidas

1. **`/api/route-planning`** não montado no `server.ts` — planejamento por ciclos só via código interno/service até registrar o router.
2. **`/api/external`** (CEP IBGE legado) definido mas não montado em `server.ts` — CEP via outros fluxos.
3. **Pooler Supabase (6543)** pode impedir `prisma migrate` — use `apply-schema-fix.js` ou conexão direta 5432.
4. **Coordenadas antigas** de clientes podem estar erradas até abrir mapa/criar roteiro (correção automática).
5. **Rate limit** Nominatim: 1 req/s quando sem HERE API.
6. **`POST /api/auth/login`** retorna 410 — login exclusivamente pelo Supabase no frontend.

---

## Licença e contato

Projeto privado — uso interno. Para dúvidas sobre deploy ou credenciais, consulte a equipe responsável pelo ambiente Supabase e HERE.

---

*Documentação gerada com base no código-fonte do repositório Mapa-Território.*
