import logging

from fastapi import Request, status
from fastapi.responses import JSONResponse

from app.utils.errors import user_facing_error_message

logger = logging.getLogger(__name__)


async def validation_error_exception_handler(request: Request, exc: Exception) -> JSONResponse:
  if request.app.debug:
    logger.error('ValidationError: %s', exc, exc_info=exc)
  else:
    logger.error('ValidationError: %s', exc)
  return JSONResponse(
    status_code=status.HTTP_400_BAD_REQUEST,
    content={'detail': user_facing_error_message(exc)},
  )
