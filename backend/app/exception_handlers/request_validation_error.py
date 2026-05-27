import logging

from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


async def request_validation_error_exception_handler(
  request: Request,
  exc: RequestValidationError,
) -> JSONResponse:
  if request.app.debug:
    logger.error('RequestValidationError: %s', exc, exc_info=exc)
  else:
    logger.error('RequestValidationError: %s', exc)
  return JSONResponse(
    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
    content={'detail': 'Some information is missing or invalid. Check the form and try again.'},
  )
