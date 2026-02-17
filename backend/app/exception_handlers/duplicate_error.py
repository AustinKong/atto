from fastapi import status
from fastapi.responses import JSONResponse


async def duplicate_error_exception_handler(request, exc):
  return JSONResponse(
    status_code=status.HTTP_409_CONFLICT,
    content={'detail': str(exc)},
  )
