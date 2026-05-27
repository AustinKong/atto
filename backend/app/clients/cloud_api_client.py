from typing import Any

import httpx
from pydantic import BaseModel

from app.config import settings
from app.utils.auth_context import get_session_token
from app.utils.errors import ServiceError

RequestPayload = BaseModel | list[Any] | dict[str, Any]


class CloudApiClient:
  def __init__(
    self,
    base_url: str = settings.cloud.base_url,
    timeout: float = settings.cloud.timeout,
  ) -> None:
    self._base_url = base_url.rstrip('/')
    self._timeout = timeout

  async def get(self, path: str, params: dict[str, Any] | None = None) -> Any:
    return await self._request('GET', path, params=params)

  async def post(
    self,
    path: str,
    payload: RequestPayload | str | None = None,
    params: dict[str, Any] | None = None,
  ) -> Any:
    return await self._request('POST', path, params=params, payload=payload)

  async def _request(
    self,
    method: str,
    path: str,
    *,
    params: dict[str, Any] | None = None,
    payload: RequestPayload | str | None = None,
  ) -> Any:
    if not self._base_url:
      raise ServiceError('Atto cloud is unavailable right now. Please try again later.')

    headers = self._build_headers()
    json_payload: list[Any] | dict[str, Any] | None = None
    text_payload: str | None = None
    if isinstance(payload, BaseModel):
      json_payload = payload.model_dump(by_alias=True)
    elif isinstance(payload, str):
      text_payload = payload
    else:
      json_payload = payload

    try:
      async with httpx.AsyncClient(base_url=self._base_url, timeout=self._timeout) as client:
        response = await client.request(
          method=method,
          url=path,
          params=params,
          json=json_payload,
          content=text_payload,
          headers=headers,
        )
        response.raise_for_status()
    except httpx.HTTPStatusError as exc:
      raise ServiceError('Atto cloud is unavailable right now. Please try again later.') from exc
    except httpx.RequestError as exc:
      raise ServiceError(
        'Atto could not reach the cloud service. Check your connection and try again.'
      ) from exc

    content_type = response.headers.get('content-type', '').lower()
    if 'application/json' in content_type:
      return response.json()
    return response.text

  @staticmethod
  def _build_headers() -> dict[str, str]:
    session_token = get_session_token()
    if not session_token:
      raise ServiceError('Sign in to Atto before using cloud features.')
    has_byok = bool(settings.model.api_key.strip())
    return {
      'Authorization': f'Bearer {session_token}',
      'X-Atto-Byok': 'true' if has_byok else 'false',
    }
