import asyncio

from fastapi import Request
from fastapi.responses import JSONResponse


async def token_budget_handler(request: Request, exc: Exception) -> JSONResponse:
  return JSONResponse(status_code=429, content={'detail': str(exc)})


async def auth_error_handler(request: Request, exc: Exception) -> JSONResponse:
  return JSONResponse(status_code=401, content={'detail': str(exc)})


async def provider_error_handler(request: Request, exc: Exception) -> JSONResponse:
  return JSONResponse(status_code=502, content={'detail': str(exc)})


async def timeout_handler(request: Request, exc: Exception) -> JSONResponse:
  return JSONResponse(status_code=504, content={'detail': 'Request timed out waiting for worker'})
