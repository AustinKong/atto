from fastapi import Request
from redis.asyncio import Redis


# TODO: Do we want to reexport redis from here so types and getter are in one place?
async def get_redis(request: Request) -> Redis:
  return request.app.state.redis
