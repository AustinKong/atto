import re
from dataclasses import dataclass
from datetime import UTC, date, datetime, time, timedelta
from random import Random
from uuid import uuid4

from pydantic import HttpUrl, TypeAdapter
from schemas import PaperListingResponse

from app.schemas.application import Application, StatusEnum, StatusEvent
from app.schemas.listing import ApplicantInsightsResult, Keyword, Listing, ListingResearch, Money
from app.schemas.resume import Resume
from app.services.paper_mode.schemas import PaperFixture
from shared.schemas.application_analysis import ApplicationAnalysis, SkillComparisonRow
from shared.schemas.listing_research import (
  MarketContextResult,
  SalaryRangeResult,
  SentimentAnalysisResult,
  SentimentAnalysisSource,
)

DATE_RANDOM_SEED = 20260515
APPLICATION_RATE = 0.7
PAPER_FIXTURE_ANCHOR_DATE = date(1970, 1, 1)
STATUS_EVENT_ADAPTER = TypeAdapter(StatusEvent)

STATUS_PATTERNS = [
  [StatusEnum.SAVED],
  [StatusEnum.SAVED, StatusEnum.APPLIED],
  [StatusEnum.SAVED, StatusEnum.APPLIED, StatusEnum.SCREENING],
  [StatusEnum.SAVED, StatusEnum.APPLIED, StatusEnum.SCREENING, StatusEnum.INTERVIEW],
  [
    StatusEnum.SAVED,
    StatusEnum.APPLIED,
    StatusEnum.SCREENING,
    StatusEnum.INTERVIEW,
    StatusEnum.REJECTED,
  ],
  [
    StatusEnum.SAVED,
    StatusEnum.APPLIED,
    StatusEnum.SCREENING,
    StatusEnum.INTERVIEW,
    StatusEnum.OFFER_RECEIVED,
  ],
  [
    StatusEnum.SAVED,
    StatusEnum.APPLIED,
    StatusEnum.SCREENING,
    StatusEnum.INTERVIEW,
    StatusEnum.OFFER_RECEIVED,
    StatusEnum.ACCEPTED,
  ],
  [StatusEnum.SAVED, StatusEnum.APPLIED, StatusEnum.GHOSTED],
  [StatusEnum.SAVED, StatusEnum.APPLIED, StatusEnum.WITHDRAWN],
]


@dataclass(frozen=True)
class DatePlan:
  posted_date: date
  event_dates: list[date]


def build_fixture(
  *,
  seed: PaperFixture,
  listing_responses: list[PaperListingResponse],
) -> PaperFixture:
  count = len(listing_responses)
  date_plans = build_date_plans(count)
  application_indices = select_application_indices(count)
  base_resume = seed.resumes[0]
  listings = [
    build_listing(listing_response, index, date_plans[index])
    for index, listing_response in enumerate(listing_responses)
  ]
  application_resumes = [
    build_application_resume(base_resume, index) for index in sorted(application_indices)
  ]
  resume_by_item_index = {
    item_index: resume
    for item_index, resume in zip(sorted(application_indices), application_resumes, strict=True)
  }
  applications = [
    build_application(
      listing_response=listing_responses[index],
      listing=listings[index],
      resume=resume_by_item_index[index],
      index=index,
      date_plan=date_plans[index],
    )
    for index in sorted(application_indices)
  ]

  return PaperFixture(
    anchor_date=PAPER_FIXTURE_ANCHOR_DATE,
    profile=seed.profile,
    resumes=[base_resume, *application_resumes],
    listings=listings,
    applications=applications,
  )


def build_listing(
  listing_response: PaperListingResponse,
  index: int,
  date_plan: DatePlan,
) -> Listing:
  posted_days_ago = days_before_anchor(date_plan.posted_date)
  keywords = [
    Keyword(word=keyword.lower(), count=max(1, 10 - keyword_index))
    for keyword_index, keyword in enumerate(listing_response.keywords[:8])
  ]
  salary_median = salary_median_for(index, listing_response.title)
  sources = [
    SentimentAnalysisSource(
      url=str(source.url),
      title=source.title,
      content=source.content,
    )
    for source in listing_response.research_sources
  ]

  return Listing(
    id=uuid4(),
    url=build_listing_url(listing_response, posted_days_ago, index),
    title=listing_response.title,
    company=listing_response.company,
    domain=listing_response.domain,
    location=listing_response.location,
    description=listing_response.description,
    notes=listing_response.research_notes,
    posted_date=date_plan.posted_date,
    salary=Money(value=salary_median, currency='USD'),
    skills=listing_response.skills,
    requirements=listing_response.requirements,
    keywords=keywords,
    research=ListingResearch(
      sentiment=SentimentAnalysisResult(value=sentiment_for(index), sources=sources),
      salary=SalaryRangeResult(
        industry_min=int(salary_median * 0.68),
        industry_q1=int(salary_median * 0.84),
        industry_median=salary_median,
        industry_q3=int(salary_median * 1.18),
        industry_max=int(salary_median * 1.45),
        currency='USD',
      ),
      market=MarketContextResult(summary=listing_response.market_summary),
      applicant_insights=ApplicantInsightsResult(insights=listing_response.applicant_insights),
      generated_at=datetime.combine(
        min(
          PAPER_FIXTURE_ANCHOR_DATE,
          date_plan.posted_date + timedelta(days=1),
        ),
        time(hour=12),
        UTC,
      ),
    ),
  )


def build_application(
  *,
  listing_response: PaperListingResponse,
  listing: Listing,
  resume: Resume,
  index: int,
  date_plan: DatePlan,
) -> Application:
  events = build_events(listing_response, index, date_plan.event_dates)
  last_event = events[-1]
  return Application(
    id=uuid4(),
    listing_id=listing.id,
    name=listing.title,
    resume_id=resume.id,
    status_events=events,
    current_status=last_event.status,
    last_status_at=last_event.date,
    analysis=ApplicationAnalysis(
      resume_hash='',
      generated_at=datetime.combine(PAPER_FIXTURE_ANCHOR_DATE, time(hour=12), UTC),
      match_score=match_score_for(index),
      skills_comparison=[
        SkillComparisonRow(
          skill=skill,
          resume_score=resume_score_for(skill_index, index),
          required_score=required_score_for(skill_index, index),
        )
        for skill_index, skill in enumerate(listing_response.skills[:6])
      ],
    ),
  )


def build_application_resume(base_resume: Resume, index: int) -> Resume:
  return base_resume.model_copy(update={'id': uuid4()}, deep=True)


def build_events(
  listing_response: PaperListingResponse,
  index: int,
  event_dates: list[date],
) -> list[StatusEvent]:
  pattern = STATUS_PATTERNS[index % len(STATUS_PATTERNS)]
  events: list[StatusEvent] = []
  interview_stage = 0
  for status, event_date in zip(pattern, event_dates, strict=True):
    if status == StatusEnum.INTERVIEW:
      interview_stage += 1
    event = {
      'status': status,
      'date': event_date,
      'notes': note_for_status(listing_response, status, index, interview_stage),
    }
    if status == StatusEnum.APPLIED:
      event['referrals'] = (
        [{'name': 'Taylor Chen', 'contact': 'taylor@example.com'}] if index % 4 == 0 else []
      )
    elif status == StatusEnum.INTERVIEW:
      event.update(
        {
          'stage': interview_stage,
          'interviewers': [{'name': 'Hiring Team', 'contact': None}],
          'scheduled_at': datetime.combine(event_date, time(hour=10), UTC),
          'location': 'Video call',
        }
      )
    events.append(STATUS_EVENT_ADAPTER.validate_python(event))

  return events


def build_date_plans(count: int) -> list[DatePlan]:
  rng = Random(DATE_RANDOM_SEED)
  posted_days = distribute_days_ago(rng, count)
  return [
    DatePlan(
      posted_date=date_from_days_ago(posted_days_ago),
      event_dates=[
        date_from_days_ago(days_ago)
        for days_ago in build_event_days_ago(
          rng=rng,
          posted_days_ago=posted_days_ago,
          event_count=len(STATUS_PATTERNS[index % len(STATUS_PATTERNS)]),
        )
      ],
    )
    for index, posted_days_ago in enumerate(posted_days)
  ]


def date_from_days_ago(days_ago: int) -> date:
  return PAPER_FIXTURE_ANCHOR_DATE - timedelta(days=days_ago)


def days_before_anchor(value: date) -> int:
  return (PAPER_FIXTURE_ANCHOR_DATE - value).days


def build_event_days_ago(*, rng: Random, posted_days_ago: int, event_count: int) -> list[int]:
  if event_count == 1:
    return [posted_days_ago]
  if posted_days_ago >= event_count - 1:
    event_days = sorted(rng.sample(range(posted_days_ago), event_count - 1), reverse=True)
    return [posted_days_ago, *event_days]
  return [
    max(0, posted_days_ago - round(event_index * posted_days_ago / (event_count - 1)))
    for event_index in range(event_count)
  ]


def select_application_indices(count: int) -> set[int]:
  application_count = max(1, round(count * APPLICATION_RATE))
  rng = Random(DATE_RANDOM_SEED + 1)
  return set(rng.sample(range(count), application_count))


def distribute_days_ago(rng: Random, count: int) -> list[int]:
  if count == 1:
    return [rng.randint(3, 14)]
  if count <= 90:
    return sorted(rng.sample(range(1, 91), count), reverse=True)
  return sorted([rng.randint(1, 90) for _ in range(count)], reverse=True)


def build_listing_url(
  listing_response: PaperListingResponse,
  posted_days_ago: int,
  index: int,
) -> HttpUrl:
  company_slug = slugify(listing_response.company)
  role_slug = slugify(listing_response.title)
  posted_slug = f'posted-{posted_days_ago:02d}d-ago'
  return HttpUrl(f'https://jobs.{company_slug}.test/{role_slug}-{posted_slug}-{index + 1}')


def slugify(value: str) -> str:
  return re.sub(r'[^a-z0-9]+', '-', value.lower()).strip('-')


def salary_median_for(index: int, title: str) -> int:
  base = 145_000 + (index % 8) * 8_000
  lowered = title.lower()
  if 'senior' in lowered or 'staff' in lowered:
    base += 35_000
  if 'intern' in lowered or 'junior' in lowered:
    base -= 55_000
  return max(75_000, base)


def sentiment_for(index: int) -> float:
  return round(0.58 + (index % 7) * 0.05, 2)


def match_score_for(index: int) -> float:
  return round(0.62 + (index % 9) * 0.035, 2)


def resume_score_for(skill_index: int, item_index: int) -> int:
  return min(98, 58 + ((skill_index * 11 + item_index * 7) % 38))


def required_score_for(skill_index: int, item_index: int) -> int:
  return min(100, 64 + ((skill_index * 13 + item_index * 5) % 34))


def note_for_status(
  listing_response: PaperListingResponse,
  status: StatusEnum,
  index: int,
  interview_stage: int,
) -> str:
  notes = listing_response.timeline_notes
  note_by_status = {
    StatusEnum.SAVED: notes.saved,
    StatusEnum.APPLIED: notes.applied,
    StatusEnum.SCREENING: notes.screening,
    StatusEnum.INTERVIEW: notes.interview,
    StatusEnum.OFFER_RECEIVED: notes.offer_received,
    StatusEnum.ACCEPTED: notes.accepted,
    StatusEnum.REJECTED: notes.rejected,
    StatusEnum.GHOSTED: notes.ghosted,
    StatusEnum.WITHDRAWN: notes.withdrawn,
    StatusEnum.RESCINDED: notes.rescinded,
  }
  note = note_by_status[status]
  if status == StatusEnum.INTERVIEW:
    return f'Round {interview_stage}: {note}'
  return note


def format_skill_list(skills: list[str]) -> str:
  if not skills:
    return 'the core role requirements'
  if len(skills) == 1:
    return skills[0]
  return f'{", ".join(skills[:-1])}, and {skills[-1]}'
