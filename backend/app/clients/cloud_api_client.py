from typing import Any

import httpx

from app.utils.auth_context import get_session_cookie
from app.utils.errors import ServiceError


class CloudApiClient:
  def __init__(
    self,
    base_url: str = 'http://localhost:8001',
    timeout: float = 30.0,
  ) -> None:
    self._base_url = base_url.rstrip('/')
    self._timeout = timeout

  async def get_json(self, path: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
    return await self.request_json('GET', path, params=params)

  async def post_json(self, path: str, payload: dict[str, Any]) -> dict[str, Any]:
    return await self.request_json('POST', path, json_body=payload)

  async def request_json(
    self,
    method: str,
    path: str,
    *,
    params: dict[str, Any] | None = None,
    json_body: dict[str, Any] | None = None,
  ) -> dict[str, Any]:
    if not self._base_url:
      raise ServiceError('Cloud URL is not configured')

    headers = self._build_headers()

    try:
      async with httpx.AsyncClient(base_url=self._base_url, timeout=self._timeout) as client:
        response = await client.request(
          method=method,
          url=path,
          params=params,
          json=json_body,
          headers=headers,
        )
        response.raise_for_status()
    except httpx.HTTPStatusError as exc:
      status_code = exc.response.status_code
      detail = exc.response.text.strip()
      message = detail[:200] if detail else 'No response body'
      raise ServiceError(f'Cloud request failed [{status_code}]: {message}') from exc
    except httpx.RequestError as exc:
      raise ServiceError(f'Cloud request failed: {str(exc)}') from exc

    data = response.json()
    if not isinstance(data, dict):
      raise ServiceError('Cloud response must be a JSON object')
    return data

  @staticmethod
  def _build_headers() -> dict[str, str]:
    session_cookie = get_session_cookie()
    if not session_cookie:
      raise ServiceError('Missing Cookie header for cloud request')
    return {'Cookie': f'__session={session_cookie}'}
