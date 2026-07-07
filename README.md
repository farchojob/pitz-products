# PITZ — Product Manager

A full-stack **product management (CRUD)** application built for the PITZ technical challenge.

- **Backend:** Ruby on Rails 7.1 (API-only) · PostgreSQL · RSpec
- **Frontend:** React 18 · TypeScript (strict) · TailwindCSS + shadcn/ui (light/dark) · TanStack Query

> 🚧 **In progress.** This README is filled out fully at the documentation milestone (setup, env tables, API reference, technical decisions, FAQ). See the plan below for the current state.

## Repository layout

```
pitz-products/
├── backend/     # Rails 7.1 API-only + PostgreSQL
├── frontend/    # Vite + React + TypeScript + Tailwind/shadcn
├── docs/        # screenshots, API notes
└── docker-compose.yml
```

## Status / roadmap

| Milestone | Scope | State |
|-----------|-------|-------|
| M0 | Toolchain + monorepo scaffold | 🔨 |
| M1 | Backend core: model, validations, scopes, 5 endpoints, pagination, CORS, seeds | ⏳ |
| M2 | RSpec: model + request specs (all endpoints + edge cases) | ⏳ |
| M3 | Frontend core: listing, search, filter, pagination, states | ⏳ |
| M4 | Product form (create/edit), delete confirm, toasts, responsive | ⏳ |
| M5 | Full README + docs | ⏳ |
| M6 | Swagger, soft delete, CI, deploy | ⏳ |
| M7 | Docker, auditing, frontend tests | ⏳ |

## Quick links

- Backend: [`backend/`](backend/)
- Frontend: [`frontend/`](frontend/)
