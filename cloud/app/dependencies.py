import httpx
from fastapi import Request
from redis.asyncio import Redis

from app.clients.gemini_client import GeminiClient


def get_http_client(request: Request) -> httpx.AsyncClient:
  return request.app.state.http_client


async def get_redis(request: Request) -> Redis:
  return request.app.state.redis


def get_gemini_client(request: Request) -> GeminiClient:
  return request.app.state.gemini_client
