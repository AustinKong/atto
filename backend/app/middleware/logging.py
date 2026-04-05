import logging

from fastapi import Request
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


async def exception_logging_middleware(request: Request, call_next):
  try:
    return await call_next(request)
  except Exception as exc:
    if request.app.debug:
      logger.error('Unhandled exception for %s %s', request.method, request.url.path, exc_info=exc)
    else:
      logger.error('Unhandled exception for %s %s: %s', request.method, request.url.path, exc)
    return JSONResponse(
      status_code=500,
      content={'detail': 'Internal Server Error'},
    )
