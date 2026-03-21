from collections.abc import Awaitable, Callable
from enum import StrEnum
from typing import TypeAlias

from pydantic import BaseModel, HttpUrl


class CrawlResult(BaseModel):
  url: HttpUrl
  content: str
  screenshot: str | None = None


class SearchResult(BaseModel):
  title: str
  url: HttpUrl
  body: str = ''


class Timelimit(StrEnum):
  day = 'd'
  week = 'w'
  month = 'm'
  year = 'y'


class SearchMethod(StrEnum):
  web = 'web'
  news = 'news'


SearchFn: TypeAlias = Callable[[], Awaitable[list[SearchResult]]]
CrawlFn: TypeAlias = Callable[[HttpUrl], Awaitable[CrawlResult | list[CrawlResult]]]


class DDGSTextResult(BaseModel):
  title: str
  href: str
  body: str


class DDGSNewsResult(BaseModel):
  date: str
  title: str
  body: str
  url: str
  image: str
  source: str
