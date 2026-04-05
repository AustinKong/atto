import logging

from fastapi import status
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


async def not_found_exception_handler(request, exc):
  if request.app.debug:
    logger.error('NotFoundError: %s', exc, exc_info=exc)
  else:
    logger.error('NotFoundError: %s', exc)
  return JSONResponse(
    status_code=status.HTTP_404_NOT_FOUND,
    content={'detail': str(exc)},
  )
