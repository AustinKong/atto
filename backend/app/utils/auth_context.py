from collections.abc import Iterator
from contextlib import contextmanager
from contextvars import ContextVar

_session_token_ctx: ContextVar[str | None] = ContextVar('_session_token_ctx', default=None)


def get_session_token() -> str | None:
  return _session_token_ctx.get()


def is_authorized() -> bool:
  session_token = get_session_token()
  return bool(session_token and session_token.strip())


@contextmanager
def use_session_token(value: str | None) -> Iterator[None]:
  token = _session_token_ctx.set(value)
  try:
    yield
  finally:
    _session_token_ctx.reset(token)
