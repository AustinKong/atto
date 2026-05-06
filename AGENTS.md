# Atto – Root Agent Guidelines

This file covers cross-cutting conventions that apply to **every** package in this monorepo. Per-package details live in the respective `AGENTS.md` files inside `frontend/`, `backend/`, `cloud/`, and `shared/`.

## Repository layout

```
atto/
├── frontend/          # React/TypeScript SPA (Vite, Chakra UI v3, TanStack Query)
├── backend/           # Local FastAPI service (SQLite, Playwright, OpenAI/Gemini)
├── cloud/             # Cloud FastAPI service (PostgreSQL, Redis, Gemini)
├── shared/            # Pydantic schemas shared between backend & cloud
├── templates/         # Jinja2 resume templates
├── package.json       # Root npm scripts (dev, lint, build, dist)
└── docker-compose.yml # Cloud service orchestration
```

## Universal formatting rules

These are enforced by tools (Prettier for TS, Ruff for Python) and must never be overridden:

| Rule | Value |
|---|---|
| Indentation | 2 spaces (all languages) |
| Line length | 100 characters |
| Quotes | Single quotes |
| Line endings | LF |

## Naming conventions (by language)

| Context | Convention |
|---|---|
| TypeScript/React component files | `PascalCase` (`UserCard.tsx`) |
| TypeScript non-component files | `kebab-case` (`date.utils.ts`) |
| TypeScript directories | `kebab-case` (even those holding components) |
| Python files & directories | `snake_case` (`listing_router.py`) |
| Python classes | `PascalCase` |
| Python constants | `SCREAMING_SNAKE_CASE` |

## Commands

```bash
# Run both frontend and backend together
npm run dev

# Lint & autofix everything (ESLint + Ruff)
npm run lint:fix

# Build distributable (frontend tsc+vite + PyInstaller)
npm run dist

# Backend tests
backend/venv/bin/python -m pytest

# Cloud tests
cd cloud && python -m pytest
```

## Cross-package data flow

The frontend calls `/api/*` endpoints (proxied to the local backend during dev). The backend delegates expensive operations (research, LLM calls) to the cloud service via `CloudApiClient`. Pydantic schemas in `shared/` define the contract between backend and cloud.

All JSON payloads use **camelCase** (automatic via `CamelModel` alias generator). Python code uses **snake_case** internally; `CamelModel` converts on serialization/deserialization.

## Adding new features

1. Define Pydantic schemas in `backend/app/schemas/` (or `shared/schemas/` if cloud also needs them).
2. Add the database table/migration in `backend/app/seed.py`.
3. Implement the repository → service → router stack in the backend.
4. Add TypeScript types in `frontend/src/types/`, service functions in `frontend/src/services/`, queries/mutations in `frontend/src/queries/` and `frontend/src/mutations/`.
5. Build pages and components following the frontend component folder structure.

## Security

- Never commit secrets. Use environment variables / `~/.atto/config.user.yaml` for local config, `.env` for cloud.
- Always use parameterised SQL queries (never string-interpolate user input into SQL).
- Validate UUIDs at the router boundary; use `UUID` type annotations so FastAPI rejects malformed IDs automatically.
