from datetime import UTC, date, datetime, time, timedelta
from typing import cast
from uuid import UUID, uuid4

from app.schemas.application import Application, StatusEnum, StatusEvent
from app.schemas.listing import Listing, ListingResearch
from app.schemas.resume import (
  DetailedSection,
  ParagraphSection,
  Resume,
  Section,
  SimpleSection,
  TextUnit,
)
from app.utils.hash import hash_trimmed_text
from shared.schemas.application_analysis import AISuggestions, AIUnitSuggestion, ApplicationAnalysis


def build_listing(
  listing: Listing,
  *,
  date_shift: timedelta,
) -> Listing:
  return listing.model_copy(
    update={
      'posted_date': resolve_fixture_date(
        fixture_date=cast(date, listing.posted_date),
        date_shift=date_shift,
      ),
      'research': build_listing_research(
        listing,
        date_shift=date_shift,
      ),
    }
  )


def build_application(
  application: Application,
  *,
  index: int,
  resume_by_id: dict[UUID, Resume],
  date_shift: timedelta,
) -> Application:
  resume = resume_by_id[application.resume_id]
  analysis = (
    build_application_analysis(application.analysis, resume, index)
    if application.analysis
    else None
  )
  return application.model_copy(
    update={
      'analysis': analysis,
      'last_status_at': resolve_fixture_date(
        fixture_date=application.last_status_at,
        date_shift=date_shift,
      ),
      'status_events': [
        shift_status_event_dates(
          event,
          date_shift=date_shift,
        )
        for event in application.status_events
      ],
    }
  )


def build_listing_research(
  listing: Listing,
  *,
  date_shift: timedelta,
) -> ListingResearch:
  research = cast(ListingResearch, listing.research)
  generated_date = resolve_fixture_date(
    fixture_date=research.generated_at.date(),
    date_shift=date_shift,
  )
  return research.model_copy(
    update={
      'generated_at': datetime.combine(
        generated_date,
        research.generated_at.timetz(),
      )
    }
  )


def build_application_analysis(
  analysis: ApplicationAnalysis,
  resume: Resume,
  item_index: int,
) -> ApplicationAnalysis:
  units_by_section = extract_text_units_by_section(resume.sections)
  unit_hash_by_id = {
    unit.id: hash_trimmed_text(unit.content)
    for _section_id, units in units_by_section
    for unit in units
  }
  generated_at = datetime.combine(date.today(), time(hour=12), UTC)

  content_quality = [
    section.model_copy(
      update={
        'scores': [
          score.model_copy(
            update={'unit_hash': unit_hash_by_id.get(score.unit_id, score.unit_hash)}
          )
          for score in section.scores
        ]
      }
    )
    for section in analysis.content_quality
  ]

  return analysis.model_copy(
    update={
      'resume_hash': resume.create_hash(),
      'generated_at': generated_at,
      'content_quality': content_quality,
      'ai_suggestions': build_ai_suggestions(
        analysis.ai_suggestions,
        item_index,
        unit_hash_by_id,
      ),
    }
  )


def build_ai_suggestions(
  ai_suggestions: AISuggestions | None,
  item_index: int,
  unit_hash_by_id: dict[UUID, str],
) -> AISuggestions | None:
  if ai_suggestions is None:
    return None

  suggestions = [
    AIUnitSuggestion(
      id=str(uuid4()),
      unit_id=suggestion.unit_id,
      unit_hash=unit_hash_by_id.get(suggestion.unit_id, suggestion.unit_hash),
      suggestion=suggestion.suggestion,
      replacement_text=suggestion.replacement_text,
    )
    for suggestion_index, suggestion in enumerate(ai_suggestions.suggestions)
  ]

  return AISuggestions(summary=ai_suggestions.summary, suggestions=suggestions)


def shift_status_event_dates(
  event: StatusEvent,
  *,
  date_shift: timedelta,
) -> StatusEvent:
  updates: dict[str, object] = {
    'date': resolve_fixture_date(
      fixture_date=event.date,
      date_shift=date_shift,
    )
  }

  if event.status == StatusEnum.INTERVIEW and event.scheduled_at is not None:
    updates['scheduled_at'] = resolve_fixture_datetime(
      fixture_datetime=event.scheduled_at,
      date_shift=date_shift,
    )

  return event.model_copy(update=updates)


def extract_text_units_by_section(sections: list[Section]) -> list[tuple[UUID, list[TextUnit]]]:
  result: list[tuple[UUID, list[TextUnit]]] = []
  for section in sections:
    units: list[TextUnit] = []
    if isinstance(section, SimpleSection):
      units.extend(unit for unit in section.content if unit.content.strip())
    elif isinstance(section, ParagraphSection):
      if section.content.content.strip():
        units.append(section.content)
    elif isinstance(section, DetailedSection):
      for item in section.content:
        for unit in [item.title, item.subtitle, *item.bullets]:
          if unit.content.strip():
            units.append(unit)

    result.append((section.id, units))
  return result


def resolve_fixture_date(*, fixture_date: date, date_shift: timedelta) -> date:
  return fixture_date + date_shift


def resolve_fixture_datetime(
  *,
  fixture_datetime: datetime,
  date_shift: timedelta,
) -> datetime:
  return fixture_datetime + date_shift
