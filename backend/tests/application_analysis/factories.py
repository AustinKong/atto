from uuid import UUID, uuid4

from pydantic import HttpUrl

from app.schemas.application import Application
from app.schemas.listing import Keyword, Listing
from app.schemas.resume import (
  DetailedItem,
  DetailedSection,
  ParagraphSection,
  Resume,
  Section,
  SimpleSection,
  TextUnit,
)


def make_keyword(word: str, count: int = 1) -> Keyword:
  return Keyword(word=word, count=count)


def make_listing(
  *,
  title: str = 'Backend Engineer',
  company: str = 'Example Co',
  domain: str = 'example.com',
  description: str = 'Build Python services, SQL-backed APIs, and reliable data workflows.',
  skills: list[str] | None = None,
  keywords: list[Keyword] | None = None,
  requirements: list[str] | None = None,
) -> Listing:
  return Listing(
    url=HttpUrl('https://example.com/jobs/backend-engineer'),
    title=title,
    company=company,
    domain=domain,
    description=description,
    skills=skills if skills is not None else ['Python', 'SQL', 'APIs'],
    keywords=keywords if keywords is not None else [make_keyword('Python'), make_keyword('SQL')],
    requirements=requirements
    if requirements is not None
    else ['Build production APIs', 'Use relational databases', 'Debug distributed systems'],
  )


def make_text_unit(content: str, *, id: UUID | None = None) -> TextUnit:
  return TextUnit(id=id or uuid4(), content=content)


def make_simple_section(
  title: str,
  bullets: list[str],
  *,
  id: UUID | None = None,
) -> SimpleSection:
  return SimpleSection(
    id=id or uuid4(),
    title=make_text_unit(title),
    content=[make_text_unit(bullet) for bullet in bullets],
  )


def make_detailed_section(
  title: str,
  *,
  item_title: str = 'Example Role',
  item_subtitle: str = 'Example Company',
  bullets: list[str] | None = None,
  id: UUID | None = None,
) -> DetailedSection:
  item = DetailedItem(
    title=make_text_unit(item_title),
    subtitle=make_text_unit(item_subtitle),
    bullets=[make_text_unit(bullet) for bullet in (bullets or [])],
  )
  return DetailedSection(id=id or uuid4(), title=make_text_unit(title), content=[item])


def make_paragraph_section(
  title: str,
  content: str,
  *,
  id: UUID | None = None,
) -> ParagraphSection:
  return ParagraphSection(
    id=id or uuid4(),
    title=make_text_unit(title),
    content=make_text_unit(content),
  )


def make_resume(
  *,
  sections: list[Section] | None = None,
  template_id: UUID | None = None,
) -> Resume:
  return Resume(
    template_id=template_id or uuid4(),
    sections=sections
    if sections is not None
    else [
      make_detailed_section(
        'Experience',
        bullets=[
          'Built Python APIs backed by SQL databases.',
          'Improved data workflow reliability for production services.',
        ],
      ),
      make_simple_section('Skills', ['Python', 'SQL', 'API design']),
    ],
  )


def make_application(
  *,
  listing_id: UUID,
  resume_id: UUID,
  name: str = 'Backend Engineer at Example Co',
) -> Application:
  return Application(listing_id=listing_id, resume_id=resume_id, name=name)
