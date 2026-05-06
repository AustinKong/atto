# Shared Agent Guidelines

The `shared/` package is a lightweight Python library installed as a local dependency by both `backend/` and `cloud/`. It contains only Pydantic schema definitions that both services need — no business logic, no I/O.

## Formatting

Same Ruff rules as the rest of the Python codebase: 2-space indent, single quotes, 100-char line width, LF endings.

## Package contents

```
shared/
├── pyproject.toml
└── schemas/
    ├── types.py       ← CamelModel base class
    ├── model.py       ← Schemas for the cloud model (LLM) API
    └── research.py    ← Schemas for cloud research endpoint responses
```

## `CamelModel` — the universal base class

Every API-facing Pydantic model in this project (both `backend/` and `cloud/`) inherits from `CamelModel`:

```python
from shared.schemas.types import CamelModel
```

`CamelModel` applies two config options:
- `alias_generator = to_camel` — all fields are serialised as camelCase JSON keys.
- `populate_by_name = True` — models can be constructed with either the Python snake_case name or the camelCase alias.

**Always extend `CamelModel`**, not plain `BaseModel`, for any schema that crosses an HTTP boundary.

## What belongs in `shared/`

A schema belongs in `shared/` if and only if **both** the local backend and the cloud service need to read or write it. If only one service uses a schema, put it in that service's own `schemas/` directory.

Currently:
- `CamelModel` — needed everywhere.
- `CallStructuredRequest` / cloud model schemas — used by the local backend when calling the cloud's `/cloud/model` endpoint.
- Research result schemas (`SentimentAnalysisResult`, `SalaryRangeResult`, `MarketContextResult`) — returned by the cloud and consumed by the local backend.

## Adding a new shared schema

1. Add the Pydantic model to the appropriate file in `shared/schemas/` (or create a new `[topic].py` file).
2. Re-export it from `shared/schemas/__init__.py` if one exists, or import directly from the module path.
3. Both `backend/pyproject.toml` and `cloud/pyproject.toml` already reference `shared` as a local path dependency — no version bumping needed.

## What does not belong in `shared/`

- Business logic, utility functions, or database code.
- Schemas specific to only one service.
- FastAPI routers, dependencies, or middleware.
