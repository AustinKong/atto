import logging

from fastapi import status
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


async def service_error_exception_handler(request, exc):
  if request.app.debug:
    logger.error('ServiceError: %s', exc, exc_info=exc)
  else:
    logger.error('ServiceError: %s', exc)
  return JSONResponse(
    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    content={'detail': str(exc)},
  )
