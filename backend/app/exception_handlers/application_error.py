import logging

from fastapi import Request, status
from fastapi.responses import JSONResponse

from app.utils.errors import user_facing_error_message

logger = logging.getLogger(__name__)


async def application_error_exception_handler(request: Request, exc: Exception) -> JSONResponse:
  if request.app.debug:
    logger.error('ApplicationError: %s', exc, exc_info=exc)
  else:
    logger.error('ApplicationError: %s', exc)
  return JSONResponse(
    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    content={'detail': user_facing_error_message(exc)},
  )
