from typing import Annotated

import httpx
from fastapi import Depends, Header, HTTPException, Request
from jose import JWTError, jwt

from app.dependencies import get_http_client
from app.schemas.auth import AuthenticatedUser
from app.utils.errors import AuthError
from app.utils.settings import settings


class AuthService:
  def __init__(
    self,
    request: Request,
    http: Annotated[httpx.AsyncClient, Depends(get_http_client)],
  ) -> None:
    self._jwks_cache: dict = request.app.state.jwks_cache
    self._http = http

  async def authenticate(self, authorization: str | None) -> AuthenticatedUser:
    """Validate a Clerk-issued JWT and return the authenticated user."""
    if not authorization or not authorization.startswith('Bearer '):
      raise HTTPException(status_code=401, detail='Missing or invalid Authorization header')

    token = authorization.removeprefix('Bearer ')

    try:
      unverified_header = jwt.get_unverified_header(token)
      kid = unverified_header.get('kid')
      public_key = self._jwks_cache.get(kid)

      if public_key is None:
        public_key = await self._refresh_jwks_and_get_key(kid)
        if public_key is None:
          raise AuthError('Unknown JWT key ID')

      payload = jwt.decode(
        token,
        public_key,
        algorithms=['RS256'],
        issuer=settings.clerk.issuer,
        audience=settings.clerk.audience,
        options={'verify_aud': settings.clerk.audience is not None},
      )
      user_id: str = payload['sub']

    except (JWTError, AuthError, KeyError) as exc:
      raise HTTPException(status_code=401, detail=str(exc)) from exc

    return AuthenticatedUser(user_id=user_id)

  async def _refresh_jwks_and_get_key(self, kid: str) -> dict | None:
    response = await self._http.get(settings.clerk.jwks_url)
    response.raise_for_status()
    keys = {k['kid']: k for k in response.json().get('keys', [])}
    self._jwks_cache.update(keys)
    return keys.get(kid)


async def get_authenticated_user(
  authorization: Annotated[str | None, Header()] = None,
  auth: Annotated[AuthService, Depends(AuthService)] = ...,  # type: ignore[assignment]
) -> AuthenticatedUser:
  return await auth.authenticate(authorization)
