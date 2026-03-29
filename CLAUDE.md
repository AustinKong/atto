# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev                        # Run frontend + backend concurrently
npm run dev:frontend               # Vite dev server on :5173
npm run dev:backend                # FastAPI + uvicorn on :8000
```

### Linting & Formatting
```bash
npm run lint:fix                   # Fix both frontend (ESLint) and backend (ruff)
npm --prefix frontend run format   # Prettier format frontend
cd backend && ruff check app       # Lint backend
cd backend && ruff format app      # Format backend
```

### Build & Distribution
```bash
npm run dist                       # Build frontend + PyInstaller exe
npm run build:frontend             # Build frontend only (tsc + vite)
```

### Backend (direct)
```bash
backend/venv/bin/python backend/run.py --headless
backend/venv/bin/python -m pytest  # Run backend tests
```

## Architecture

Atto is a local-first job application tracker. The frontend (React/Vite on :5173) proxies `/api` and `/static` to the FastAPI backend (:8000). In production, the backend serves the built frontend as static files from a single PyInstaller executable.

### Frontend (`frontend/src/`)

**Data flow**: `services/` (fetch wrappers) → `queries/` (TanStack Query `queryOptions`/`infiniteQueryOptions`) → pages/components via `useSuspenseQuery` / `useInfiniteQuery`.

**Routing**: React Router v7 with `createBrowserRouter` defined in `routes/index.tsx`. Route loaders prefetch queries via the query client.

**State**: TanStack React Query for all server state, persisted to IndexedDB via `idb-keyval`. Listing drafts (in-progress scrapes) also use IndexedDB directly.

**Theme**: Chakra UI v3. Custom theme tokens/recipes live in `components/theme/`. Use semantic tokens (`fg.muted`, `bg.panel`, etc.) and `textStyle` values (`xs`–`7xl`, `label`) rather than raw CSS values. The `mcp__chakra-ui__*` MCP tools can look up available props and examples.

**Formatters**: Shared formatting utilities in `utils/formatters/` — use and extend these rather than inline formatting logic.

### Backend (`backend/app/`)

Layered architecture: **routers** → **services** → **repositories** (SQLite).

- `routers/` — FastAPI route handlers; thin, delegate to services
- `services/` — business logic; orchestrate LLM/scraping clients and repositories
- `repositories/` — raw SQLite access; one class per domain model
- `clients/` — external integrations: LLM (OpenAI/Gemini), Playwright scraping, DuckDuckGo search, research generation
- `schemas/` — Pydantic v2 request/response models
- `config/` — YAML config at `~/.atto/config.user.yaml`, accessed via settings singleton

Database schema is initialized at startup in `seed.py`. No migrations — schema changes require manual updates there.

Background tasks (e.g. listing research generation) use FastAPI's `BackgroundTasks`.

## Code Style

### TypeScript/React
- `type` over `interface` everywhere
- Inline prop types: `function Foo({ name }: { name: string })`
- `React.memo` with named inner function: `const Foo = memo(function Foo(props) { ... })`
- Named handler functions with `function` keyword unless short/simple
- Never use `any`

### Python
- Ruff: 100-char line length, 2-space indent, single quotes, Python 3.11+
- Type annotations on all function signatures
