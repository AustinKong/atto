from typing import Annotated, Any

from fastapi import APIRouter, Body, Depends
from fastapi.responses import PlainTextResponse

from app.dependencies import require_tokens
from app.services.model_service import ModelService
from shared.schemas.model import CallStructuredRequest

router = APIRouter(prefix='/cloud/model', tags=['Model'])


@router.post(
  '/structured', response_model=dict[str, Any], dependencies=[Depends(require_tokens(cost=8))]
)
async def call_structured(
  request: CallStructuredRequest,
  model_service: Annotated[ModelService, Depends()],
) -> dict[str, Any]:
  return await model_service.call_structured(request.input, request.response_schema)


@router.post(
  '/unstructured', response_class=PlainTextResponse, dependencies=[Depends(require_tokens(cost=5))]
)
async def call_unstructured(
  input: Annotated[str, Body(embed=True)],
  model_service: Annotated[ModelService, Depends()],
) -> str:
  return await model_service.call_unstructured(input)


@router.post(
  '/embed', response_model=list[list[float]], dependencies=[Depends(require_tokens(cost=2))]
)
async def embed(
  texts: Annotated[list[str], Body()],
  model_service: Annotated[ModelService, Depends()],
) -> list[list[float]]:
  return await model_service.embed(texts)
