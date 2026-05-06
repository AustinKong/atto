# Cloud Agent Guidelines

Stack: Python 3.11+, FastAPI, PostgreSQL (via SQLAlchemy async), Redis, Gemini AI, Clerk (auth).

The cloud service is a stateless HTTP API deployed separately from the local backend. It provides token-gated LLM and research endpoints consumed by the local backend's `CloudApiClient`.

## Formatting

Identical to the backend — enforced by Ruff:

- 2-space indentation, single quotes, 100-char line width, LF endings.
- **Type annotations are required on all function signatures** (parameters and return types).
- Import sections (Ruff isort): stdlib → third-party → local (`app`, `shared`), alphabetised within each section.
- Ruff rules: `E`, `F`, `B`, `UP`, `I` — fix before committing.

```bash
cd cloud && ruff check app
cd cloud && ruff format app
```

## File & directory naming

Same as the backend: `snake_case` for all Python files and directories, `PascalCase` for classes.

## Layered architecture

```
routers/        → thin HTTP handlers; delegate to services
services/       → business logic; coordinate clients and repositories
repositories/   → SQLAlchemy async ORM access (PostgreSQL)
clients/        → external HTTP provider integrations (Glassdoor, Salary, Market, Gemini)
schemas/        → Pydantic models for request/response
dependencies.py → reusable FastAPI dependency functions
db.py           → SQLAlchemy engine + session factory + session provider dependency
utils/          → pure helpers (settings, errors, redis key helpers)
```

## Application factory

- `main.py` exposes `create_app() -> FastAPI` — same pattern as the local backend.
- All shared state (Redis, HTTP client, provider clients, Gemini) is initialised in the `@asynccontextmanager lifespan` and stored on `app.state`.
- Retrieve `app.state` values from `request.app.state` inside dependency functions (see `dependencies.py`).
- Database migrations run inside `lifespan` using raw `text()` statements — no Alembic.

## Dependency injection patterns

Provider clients and infrastructure are retrieved from `app.state` via simple dependency functions:

```python
def get_redis(request: Request) -> Redis:
  return request.app.state.redis
```

Use `require_tokens(cost: int)` — a **dependency factory** — to gate any endpoint behind auth + token budget checks. It:
1. Verifies the Clerk JWT and resolves the `AuthenticatedUser`.
2. Provisions the user row if they are new.
3. Deducts `cost` tokens from their Redis budget.
4. Refunds on exception (try/yield/except pattern):
  ```python
  def require_tokens(cost: int):
    async def dep(...) -> AsyncGenerator[None, None]:
      ...
      try:
        yield
      except Exception:
        await TokenBudgetService(redis).refund(user.user_id, cost, request_id)
        raise
    return dep
  ```

Pass `require_tokens` as a `dependencies=[Depends(require_tokens(cost=N))]` argument on the route decorator, not as a handler parameter.

## Routers

- Same conventions as the local backend: `router = APIRouter(prefix='...', tags=[...])`, `async def` handlers, `Annotated[Type, Depends()]`, explicit `response_model`.
- All cloud routes use the `/cloud` prefix.
- Route handlers are intentionally thin — one line calling a service method.

## Services

- Class-based with constructor-injected dependencies (same pattern as local backend).
- All methods are `async def`.
- Call provider clients for external data; use repositories for persistence.

## Repositories

- Use SQLAlchemy async sessions (`AsyncSession`) via the `get_db_session` dependency.
- Repository classes accept an `AsyncSession` in their constructor (not via `Depends` directly — the session is injected at the call site).
- Use `await session.execute(...)` and `await session.commit()` explicitly.

## Provider clients (`clients/`)

- All provider clients inherit from `ProviderClient` (ABC in `clients/base_client.py`).
- Declare class-level `provider_name`, `bucket_capacity` (int), and `refill_rate` (float) attributes.
- Use the `@throttled` decorator on any method that should be rate-limited — it acquires a token from the `AsyncLimiter` before executing.
- HTTP calls go through the shared `httpx.AsyncClient` stored on `app.state`.

## Configuration

- Settings come from `app.utils.settings.settings` (a `CloudSettings` instance using `pydantic-settings`).
- `CloudSettings` reads from environment variables with `__` as the nested delimiter and from a `.env` file.
- Structured sub-settings (`RedisSettings`, `PostgresSettings`, `ClerkSettings`) are nested Pydantic `BaseModel` classes.
- Never read `os.environ` directly in business logic.

## Exception handling

- Define custom exception classes in `app.utils.errors`.
- Register a dedicated async handler for each exception type in `main.py`'s `create_app()`.
- Handlers return `JSONResponse` with an appropriate HTTP status code.

## Schemas

- All request/response schemas inherit from `CamelModel` (from `shared.schemas.types`) for automatic snake_case ↔ camelCase conversion.
- Auth schemas live in `app/schemas/auth.py`.
- Research response schemas (`SentimentAnalysisResult`, `SalaryRangeResult`, `MarketContextResult`) live in `shared/schemas/research.py` because the local backend also needs them.

## Testing

```bash
cd cloud && python -m pytest
```
