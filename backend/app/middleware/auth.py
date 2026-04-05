from fastapi import Request

from app.utils.auth_context import use_session_token


async def auth_context_middleware(request: Request, call_next):
  with use_session_token(request.cookies.get('__session')):
    return await call_next(request)
