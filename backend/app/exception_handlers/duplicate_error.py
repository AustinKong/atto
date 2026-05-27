import logging

from fastapi import Request, status
from fastapi.responses import JSONResponse

from app.utils.errors import user_facing_error_message

logger = logging.getLogger(__name__)


async def duplicate_error_exception_handler(request: Request, exc: Exception) -> JSONResponse:
  if request.app.debug:
    logger.error('DuplicateError: %s', exc, exc_info=exc)
  else:
    logger.error('DuplicateError: %s', exc)
  return JSONResponse(
    status_code=status.HTTP_409_CONFLICT,
    content={'detail': user_facing_error_message(exc)},
  )
