import logging

from fastapi import status
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


async def duplicate_error_exception_handler(request, exc):
  if request.app.debug:
    logger.error('DuplicateError: %s', exc, exc_info=exc)
  else:
    logger.error('DuplicateError: %s', exc)
  return JSONResponse(
    status_code=status.HTTP_409_CONFLICT,
    content={'detail': str(exc)},
  )
