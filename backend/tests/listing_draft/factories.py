from datetime import date
from uuid import UUID, uuid4

from pydantic import HttpUrl

from app.clients.scraping.schemas import CrawlResult
from app.schemas.listing import Keyword, Listing, Money
from app.services.listing.schemas import ExtractionResponse

VALID_LISTING_CONTENT = (
  'Example Co is hiring a Backend Engineer in Singapore, Singapore. '
  'You will build Python services and Python APIs backed by PostgreSQL. '
  'The role needs REST APIs, Docker, AWS, CI/CD, observability, data pipelines, '
  'distributed systems, SQL, and production debugging experience.'
)


def make_keyword(word: str, count: int = 1) -> Keyword:
  return Keyword(word=word, count=count)


def make_listing(
  *,
  id: UUID | None = None,
  url: str = 'https://example.com/jobs/backend-engineer',
  title: str = 'Backend Engineer',
  company: str = 'Example Co',
  domain: str = 'example.com',
  description: str = 'Build backend services and APIs.',
  skills: list[str] | None = None,
  requirements: list[str] | None = None,
  keywords: list[Keyword] | None = None,
) -> Listing:
  return Listing(
    id=id or uuid4(),
    url=HttpUrl(url),
    title=title,
    company=company,
    domain=domain,
    description=description,
    skills=skills if skills is not None else ['Python', 'PostgreSQL', 'REST APIs'],
    requirements=requirements
    if requirements is not None
    else ['Build production Python services.', 'Operate PostgreSQL-backed APIs.'],
    keywords=keywords if keywords is not None else [make_keyword('Python')],
  )


def make_extraction_response(
  *,
  title: str | None = 'Backend Engineer',
  company: str | None = 'Example Co',
  domain: str | None = 'example.com',
  location: str | None = 'Singapore, Singapore',
  description: str | None = 'Build backend services and APIs.',
  posted_date: date | None = date(2026, 5, 1),
  salary: Money | None = None,
  skills: list[str] | None = None,
  requirements: list[str] | None = None,
  keywords: list[str] | None = None,
  error: str | None = None,
) -> ExtractionResponse:
  return ExtractionResponse(
    title=title,
    company=company,
    domain=domain,
    location=location,
    description=description,
    posted_date=posted_date,
    salary=salary,
    skills=skills if skills is not None else ['Python', 'PostgreSQL', 'REST APIs'],
    requirements=requirements
    if requirements is not None
    else ['Build production Python services.', 'Operate PostgreSQL-backed APIs.'],
    keywords=keywords if keywords is not None else ['Python', 'PostgreSQL', 'REST APIs'],
    error=error,
  )


def make_crawl_result(
  *,
  url: str = 'https://example.com/jobs/backend-engineer',
  content: str = VALID_LISTING_CONTENT,
  screenshot: str | None = 'base64-png',
) -> CrawlResult:
  return CrawlResult(url=HttpUrl(url), content=content, screenshot=screenshot)
