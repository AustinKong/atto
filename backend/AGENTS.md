# Backend Agent Guidelines

Stack: Python 3.11+, FastAPI, Pydantic v2, SQLite (via `sqlite3`), Playwright, OpenAI/Gemini, ChromaDB.

## Formatting

Enforced by Ruff — do not bypass:

- 2-space indentation, single quotes, 100-char line width, LF endings.
- **Type annotations are required on all function signatures** (parameters and return types).
- Import sections (Ruff isort): stdlib → third-party → local (`app`, `shared`), each separated by a blank line, alphabetised within each section.
- `known-first-party = ["app", "shared"]` so `app.*` and `shared.*` are treated as local.
- Ruff rules: `E`, `F`, `B`, `UP`, `I` — fix before committing.

Run linting:
```bash
cd backend && ruff check app
cd backend && ruff format app
```

## File & directory naming

| What | Convention | Example |
|---|---|---|
| Python files | `snake_case` | `listing_router.py` |
| Directories | `snake_case` | `exception_handlers/` |
| Classes | `PascalCase` | `ApplicationRepository` |
| Functions / methods | `snake_case` | `get_application` |
| Constants (module-level SQL, prompts) | `SCREAMING_SNAKE_CASE` | `APPLICATION_WITH_EVENTS_QUERY` |

## Layered architecture

```
routers/        → thin HTTP handlers; validate input, call service or repository, return response
services/       → business logic; orchestrate repositories and clients
repositories/   → raw SQLite access; one class per domain model
clients/        → external integrations (LLM, scraping, search, cloud API)
schemas/        → Pydantic v2 request/response models
exception_handlers/ → one handler function per exception type
middleware/     → cross-cutting request/response concerns
services/config/ → configuration loading, persistence, and DI helpers
utils/          → pure helper functions
```

For simple CRUD operations that require no business logic, a router may depend on a repository directly. Only introduce a service layer when business logic is needed.

## Routers

- Name the `APIRouter` instance `router` (not `app`).
- Always set `prefix` and `tags`:
  ```python
  router = APIRouter(prefix='/applications', tags=['Applications'])
  ```
- All route handlers must be `async def`.
- Always declare `response_model`.
- Use `Annotated[Type, Depends()]` for dependency injection:
  ```python
  async def get_application(
    id: UUID,
    application_repository: Annotated[ApplicationRepository, Depends()],
  ):
  ```
- UUID path parameters are typed as `UUID` — FastAPI validates and rejects malformed values automatically.
- Routers are registered in `main.py` under the `/api` prefix.

## Services

- Class-based with constructor-injected dependencies:
  ```python
  class ListingService:
    def __init__(
      self,
      listing_repository: Annotated[ListingRepository, Depends()],
      llm_client: Annotated[ModelClient, Depends(get_model_client)],
      ...
    ) -> None:
      self.listing_repository = listing_repository
      self.llm_client = llm_client
  ```
- All methods are `async def`.
- Services coordinate multiple repositories and/or clients; repositories should not call other repositories.
- Background tasks receive dependencies via function parameters (not FastAPI `BackgroundTasks` injection) because they run outside the request lifecycle — plumb session tokens manually when needed.

## Repositories

- Inherit from `DatabaseRepository` (in `repositories/base/database_repository.py`).
- Use `self.fetch_one()`, `self.fetch_all()`, `self.execute()`, `self.execute_many()` — never use `sqlite3` directly.
- Wrap multi-statement operations in `with self.transaction():` to ensure atomicity.
- Store complex SQL strings as module-level constants in `SCREAMING_SNAKE_CASE`.
- Return domain model instances (Pydantic objects), never raw `sqlite3.Row` objects.
- `__init__` must call `super().__init__()`.
- When a repository is instantiated outside FastAPI DI (for example in startup/lifespan code),
  pass settings explicitly via `settings=get_settings(ConfigService())`.
- Private helpers are prefixed with `_` (e.g. `_parse_application_row`).

## Schemas (Pydantic v2)

- All schemas inherit from `CamelModel` (from `shared.schemas.types`):
  ```python
  from shared.schemas.types import CamelModel
  ```
  This provides automatic snake_case ↔ camelCase alias generation and `populate_by_name=True`.
- Use `StrEnum` for enumeration fields.
- Discriminated unions for polymorphic types:
  ```python
  StatusEvent = Annotated[
    StatusEventSaved | StatusEventApplied | ...,
    Field(discriminator='status'),
  ]
  ```
- Each variant of a discriminated union has a `Literal` discriminant with a default:
  ```python
  class StatusEventSaved(BaseStatusEvent):
    status: Literal[StatusEnum.SAVED] = StatusEnum.SAVED
  ```
- Use `Field(default_factory=uuid4)` for generated UUIDs and `Field(default_factory=list)` for mutable list defaults.
- Optional fields use `X | None = None` syntax (not `Optional[X]`).
- Cross-cutting field validators use `@field_validator` with `@classmethod`.

## Exception handling

- Custom exceptions inherit from `ApplicationError` (base), `NotFoundError`, `DuplicateError`, or `ServiceError` — choose the most specific.
- Each exception type has a dedicated async handler function in `exception_handlers/`.
- Handlers return `JSONResponse` with an appropriate HTTP status code and `{'detail': str(exc)}`.
- All exception handlers are registered in `main.py`'s `create_app()`.
- Use `logger = logging.getLogger(__name__)` inside handler files.

## Application factory

- `main.py` exposes a `create_app() -> FastAPI` factory — do not instantiate `FastAPI` anywhere else.
- Startup logic (e.g. ensuring default data exists) goes in the `@asynccontextmanager lifespan` function.
- All routers are included with the `/api` prefix inside `create_app()`.

## Configuration

- Settings are loaded through `ConfigService` and injected effective config via `get_settings` in `app/services/config`.
- Never read environment variables directly in business logic — go through injected `AppConfig`/`ConfigService`.
- New config options should be added to the Pydantic schema in `app/services/config/schemas.py`.

## Database

- Schema is initialised at startup in `app/db_init.py`. There is **no migration system** — schema changes require updating `db_init.py` and recreating the database.
- Always use parameterised queries (pass values as a `tuple` to `execute`/`fetch_*`) — never interpolate user input into SQL strings.
- Use `sqlite3.Row` (set by `DatabaseRepository`) so rows are accessible by column name.

## Testing

Backend tests live under `backend/tests/` and are configured in `backend/pyproject.toml`.

Run tests:
```bash
cd backend && ../backend/venv/bin/python -m pytest
cd backend && ../backend/venv/bin/python -m pytest tests/application_analysis/unit/test_skill_scoring.py
```

Run test linting:
```bash
cd backend && ../backend/venv/bin/python -m ruff check tests pyproject.toml
```

Pytest markers:
- `unit`: deterministic tests for pure scoring, mapping, validation, and boundary logic.
- `integration`: app-flow tests using controlled test doubles.
- `eval`: opt-in end-to-end model behavior evaluations over curated golden datasets. These may call
  configured real LLM/embedding providers and should be manually gated in CI.

### LLM testing philosophy

Do not try to unit test LLM intelligence directly. Treat model calls as unreliable external
dependencies: the provider can change behavior, exact outputs can drift, and tiny prompt changes can
produce equally valid alternative responses.

Use three layers:
- Unit test deterministic code around the LLM boundary: scoring math, schema validation, response
  mapping, filtering, caps, and error handling.
- Integration test the full pipeline with fake/model-double responses to prove wiring, prompt inputs,
  schema handling, caching, and persistence behavior.
- Evaluate real model behavior with opt-in `eval` tests over curated golden cases. These tests should
  use thresholds, tolerances, and generated reports rather than exact output matching.

### Assertion style for scoring tests

Prefer behavior assertions over exact numeric snapshots. The scoring weights are expected to change
while tuning the product, so tests should avoid brittle equality checks such as `score == 0.73`
unless the exact value is truly the public contract.

Prefer:
- relative comparisons: `strong_resume_score > weak_resume_score`
- bounds: `score >= acceptance_threshold`, `score <= rejection_threshold`
- stability deltas: `abs(original_score - reordered_score) <= allowed_delta`

Exact equality is acceptable for non-tuning contracts, such as preserving IDs/hashes, filtering an
unknown `unit_id`, capping a list length, or proving two already-capped scenarios produce the same
score.

Test names should document the behavior being protected. Add short docstrings when the product intent
is not obvious from the setup, especially for scoring/fairness/LLM-boundary tests.
