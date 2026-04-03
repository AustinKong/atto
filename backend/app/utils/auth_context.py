from collections.abc import Iterator
from contextlib import contextmanager
from contextvars import ContextVar

_session_cookie_ctx: ContextVar[str | None] = ContextVar('_session_cookie_ctx', default=None)


def get_session_cookie() -> str | None:
  return _session_cookie_ctx.get()


def is_authorized() -> bool:
  session_cookie = get_session_cookie()
  return bool(session_cookie and session_cookie.strip())


@contextmanager
def use_session_cookie(value: str | None) -> Iterator[None]:
  token = _session_cookie_ctx.set(value)
  try:
    yield
  finally:
    _session_cookie_ctx.reset(token)
