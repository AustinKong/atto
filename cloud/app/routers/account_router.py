from typing import Annotated

from fastapi import APIRouter, Depends

from app.schemas.auth import AuthContext
from app.services.auth_service import get_authenticated_user

router = APIRouter(prefix='/cloud', tags=['Account'])


@router.get('/me', response_model=AuthContext)
async def me(
  user_context: Annotated[AuthContext, Depends(get_authenticated_user)],
) -> AuthContext:
  return user_context
