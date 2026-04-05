from typing import Annotated

from clerk_backend_api import Clerk
from clerk_backend_api.security.types import AuthenticateRequestOptions, AuthStatus
from fastapi import Depends, HTTPException, Request

from app.schemas.auth import AuthenticatedUser
from app.utils.settings import settings


class AuthService:
  async def authenticate(self, request: Request) -> AuthenticatedUser:
    """Validate an incoming Clerk-authenticated request and return the user."""

    clerk = Clerk(bearer_auth=settings.clerk.secret_key)

    try:
      request_state = clerk.authenticate_request(
        request,
        AuthenticateRequestOptions(secret_key=settings.clerk.secret_key),
      )
      if request_state.status != AuthStatus.SIGNED_IN:
        raise HTTPException(status_code=401, detail='Missing or invalid Clerk credentials')

      payload = request_state.payload or {}
      user_id: str = payload['sub']
    except (KeyError, ValueError) as exc:
      raise HTTPException(status_code=401, detail='Missing or invalid Clerk credentials') from exc

    return AuthenticatedUser(user_id=user_id)


async def get_authenticated_user(
  request: Request,
  auth: Annotated[AuthService, Depends()],
) -> AuthenticatedUser:
  return await auth.authenticate(request)
