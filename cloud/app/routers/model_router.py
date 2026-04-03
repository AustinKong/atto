import json
from typing import Annotated

from fastapi import APIRouter, Depends
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db_session
from app.dependencies import get_redis
from app.endpoints.structured_endpoint import StructuredEndpoint
from app.endpoints.unstructured_endpoint import UnstructuredEndpoint
from app.schemas.auth import AuthenticatedUser
from app.schemas.model import (
  CallStructuredRequest,
  CallStructuredResult,
  CallUnstructuredRequest,
  CallUnstructuredResult,
)
from app.services.auth_service import get_authenticated_user
from app.services.request_handler import handle_request

router = APIRouter(prefix='/cloud/model', tags=['Model'])


@router.post('/structured', response_model=CallStructuredResult)
async def call_structured(
  request: CallStructuredRequest,
  user: Annotated[AuthenticatedUser, Depends(get_authenticated_user)],
  redis: Annotated[Redis, Depends(get_redis)],
  db: Annotated[AsyncSession, Depends(get_db_session)],
  endpoint: Annotated[StructuredEndpoint, Depends()],
) -> CallStructuredResult:
  params = {
    'input': request.input,
    'schema': json.dumps(request.response_schema, sort_keys=True),
  }
  return await handle_request(user, endpoint, params, redis, db)


@router.post('/unstructured', response_model=CallUnstructuredResult)
async def call_unstructured(
  request: CallUnstructuredRequest,
  user: Annotated[AuthenticatedUser, Depends(get_authenticated_user)],
  redis: Annotated[Redis, Depends(get_redis)],
  db: Annotated[AsyncSession, Depends(get_db_session)],
  endpoint: Annotated[UnstructuredEndpoint, Depends()],
) -> CallUnstructuredResult:
  params = {'input': request.input}
  return await handle_request(user, endpoint, params, redis, db)
