from typing import Annotated

from clerk_backend_api import Clerk
from clerk_backend_api.security.types import AuthenticateRequestOptions, AuthStatus
from fastapi import Depends, HTTPException, Request

from app.repositories.user_repository import UserRepository
from app.schemas.auth import AccessContext, AuthContext
from app.utils.settings import settings

_BYOK_HEADER = 'X-Atto-Byok'


# Authentication + Authorization
class AuthService:
  def __init__(self, user_repository: Annotated[UserRepository, Depends()]) -> None:
    self._user_repository = user_repository

  @staticmethod
  def _has_byok_header(request: Request) -> bool:
    return request.headers.get(_BYOK_HEADER, '').strip().lower() == 'true'

  @staticmethod
  def _compute_access_context(has_subscription: bool, has_byok: bool) -> AccessContext:
    access_mode = 'denied'
    access_denial_code: str | None = 'requires_subscription_or_byok'
    if has_subscription:
      access_mode = 'cloud_plan'
      access_denial_code = None
    elif has_byok:
      access_mode = 'byok'
      access_denial_code = None

    return AccessContext(
      access_mode=access_mode,
      has_subscription=has_subscription,
      has_byok=has_byok,
      access_denial_code=access_denial_code,
    )

  def _get_authenticated_user_id(self, request: Request) -> str:
    clerk = Clerk(bearer_auth=settings.clerk.secret_key)

    try:
      request_state = clerk.authenticate_request(
        request,
        AuthenticateRequestOptions(secret_key=settings.clerk.secret_key),
      )
      if request_state.status != AuthStatus.SIGNED_IN:
        raise HTTPException(status_code=401, detail='Missing or invalid Clerk credentials')

      payload = request_state.payload or {}
      return payload['sub']
    except (KeyError, ValueError) as exc:
      raise HTTPException(status_code=401, detail='Missing or invalid Clerk credentials') from exc

  async def authenticate(self, request: Request) -> AuthContext:
    user_id = self._get_authenticated_user_id(request)
    user = await self._user_repository.get_or_provision(user_id)
    has_byok = self._has_byok_header(request)
    has_subscription = UserRepository.has_active_subscription(user)
    access = self._compute_access_context(has_subscription, has_byok)

    return AuthContext(
      user=user,
      access=access,
    )


# TODO: Rename to get_auth_context
async def get_authenticated_user(
  request: Request,
  auth: Annotated[AuthService, Depends()],
) -> AuthContext:
  return await auth.authenticate(request)
