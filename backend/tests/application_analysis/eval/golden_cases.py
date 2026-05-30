from dataclasses import dataclass
from enum import StrEnum
from uuid import uuid4

from app.schemas.application import Application
from app.schemas.listing import Listing
from app.schemas.resume import DetailedItem, DetailedSection, Resume

from ..factories import (
  make_application,
  make_detailed_section,
  make_keyword,
  make_listing,
  make_resume,
  make_simple_section,
  make_text_unit,
)


class GoldenCaseId(StrEnum):
  HIGH_QUALITY_RELEVANT = 'high_quality_relevant'
  LOW_QUALITY_GENERIC = 'low_quality_generic'
  HIGH_QUALITY_GENERIC = 'high_quality_generic'
  LOW_QUALITY_RELEVANT = 'low_quality_relevant'


@dataclass(frozen=True)
class GoldenCase:
  purpose: str
  listing: Listing
  application: Application
  resume: Resume


# Resumes live on two axes: relevance (relevant vs generic) and quality/polish (high vs low)
def build_golden_cases() -> dict[GoldenCaseId, GoldenCase]:
  listing = make_listing(
    title='Backend Data Platform Engineer',
    description=(
      'Own internal backend systems that power analytics and operational reporting. '
      'Build and maintain Python APIs backed by PostgreSQL, model and query relational data, '
      'and improve batch and streaming pipeline reliability through debugging, retries, '
      'alerting, and clear handoff documentation.'
    ),
    skills=['Python', 'SQL', 'PostgreSQL', 'APIs', 'Data pipeline reliability'],
    keywords=[
      make_keyword('Python'),
      make_keyword('SQL'),
      make_keyword('PostgreSQL'),
      make_keyword('data pipelines'),
      make_keyword('production debugging'),
    ],
    requirements=[
      'Build production Python APIs for internal analytics and data products',
      'Use SQL and PostgreSQL to model, query, and debug relational data',
      'Improve reliability of batch and streaming data workflows with retries and alerting',
      'Write concise engineering documentation for operational handoffs and on-call support',
    ],
  )

  # Gold-standard positive example: three owned experiences, quantified impact, scale,
  # reliability engineering, cross-functional collaboration, and a full resume surface
  # (experience, education, projects, skills) that should look strong to both ATS and humans.
  high_quality_relevant = make_resume(
    sections=[
      DetailedSection(
        id=uuid4(),
        title=make_text_unit('Experience'),
        content=[
          DetailedItem(
            title=make_text_unit('Senior Backend Engineer'),
            subtitle=make_text_unit('Data Platform Team | Acme Analytics'),
            bullets=[
              make_text_unit(
                'Designed and maintained Python APIs backed by PostgreSQL for 150+ internal '
                'users, reducing report generation latency by 40%.'
              ),
              make_text_unit(
                'Established monitoring, retry policies, and on-call runbooks for critical '
                'batch and streaming workflows, reducing production incidents by 50% and '
                'improving SLA compliance from 92% to 99%.'
              ),
            ],
          ),
          DetailedItem(
            title=make_text_unit('Software Engineer II'),
            subtitle=make_text_unit('Analytics Infrastructure Team | Northstar Health'),
            bullets=[
              make_text_unit(
                'Owned production troubleshooting for analytics ingestion and reporting '
                'systems, resolving SQL bottlenecks that cut query runtimes from 8 minutes '
                'to under 90 seconds.'
              ),
              make_text_unit(
                'Partnered with analysts, product managers, and engineering teams to design '
                'reporting datasets and data contracts supporting executive reporting.'
              ),
            ],
          ),
          DetailedItem(
            title=make_text_unit('Backend Engineer'),
            subtitle=make_text_unit('Operational Reporting Team | Brightline Labs'),
            bullets=[
              make_text_unit(
                'Led migration of legacy reporting services to a PostgreSQL-backed analytics '
                'platform, standardizing schema patterns across 500+ tables and simplifying '
                'downstream maintenance.'
              ),
              make_text_unit(
                'Architected a reusable API framework adopted by three internal data products, '
                'improving developer velocity and reducing duplicated code.'
              ),
            ],
          ),
        ],
      ),
      make_simple_section(
        'Education',
        [
          'B.S. in Computer Science, State University',
          (
            'Relevant coursework: databases, distributed systems, data engineering, '
            'and software architecture'
          ),
          'Capstone: PostgreSQL-backed reporting platform for analytics and operations',
        ],
      ),
      make_detailed_section(
        'Projects',
        item_title='Observability Toolkit',
        item_subtitle='Internal Data Reliability Project',
        bullets=[
          (
            'Built an internal observability platform integrating pipeline health dashboards, '
            'alert routing, and incident diagnostics, reducing mean time to resolution by 35%.'
          ),
          (
            'Used SQL and Python scripts to support faster root-cause analysis during '
            'incidents across batch jobs and streaming pipelines.'
          ),
        ],
      ),
      make_simple_section(
        'Skills',
        [
          'Python',
          'SQL',
          'PostgreSQL',
          'REST APIs',
          'Data Modeling',
          'ETL Pipelines',
          'Monitoring & Alerting',
          'Incident Response',
          'Production Debugging',
          'Docker',
          'Git',
          'Apache Airflow',
        ],
      ),
    ],
  )

  # Realistic but weak negative example: a complete resume someone might submit during a broad
  # job search, with normal office coordination experience, education, volunteer work, and skills.
  # It is intentionally low quality for this specific backend data-platform role because the
  # evidence is generic, administrative, and not technical: no Python, SQL, PostgreSQL, APIs,
  # production debugging, data modeling, pipeline reliability, or engineering ownership. It also
  # includes realistic quality issues from a rushed resume: vague outcomes, inconsistent grammar,
  # light typos, and uneven capitalization without becoming an obviously fake bad example.
  low_quality_generic = make_resume(
    sections=[
      DetailedSection(
        id=uuid4(),
        title=make_text_unit('Experience'),
        content=[
          DetailedItem(
            title=make_text_unit('Operations Coordinator'),
            subtitle=make_text_unit('Facilities and Administration Team | Midtown Services'),
            bullets=[
              make_text_unit(
                'Did weekly planning meetings for 12 person office team, prepared '
                'agendas, and follow up with stakeholders on deadlines.'
              ),
              make_text_unit(
                'Worked on shared spreadhseets for vendor contacts, supply requests, and '
                'department calendars so routine office work stayed mostly organized.'
              ),
              make_text_unit(
                'Responsible for monthly status summaries using standard templates and getting '
                'updates from team members before leadership review meetings as needed.'
              ),
            ],
          ),
          DetailedItem(
            title=make_text_unit('Administrative Assistant'),
            subtitle=make_text_unit('Customer Support Office | Greenfield Retail Group'),
            bullets=[
              make_text_unit(
                'Helped process incoming service requests, routed messages to the appropriate '
                'department, and documented follow up notes in shared tracking files.'
              ),
              make_text_unit(
                'Helped coordinating onboarding schedules, conference room bookings, and travel '
                'arrangements for new employees and visiting partner teams.'
              ),
              make_text_unit(
                'Worked on basic presentation materials and meeting notes to support internal '
                'planning conservations and customer service retro meetings.'
              ),
            ],
          ),
        ],
      ),
      make_simple_section(
        'Education',
        [
          'B.A. in Business Administration, Lakeside College',
          'Course work: organizational communication, project coordination, office managment',
          'Student association treasurer, helped with meeting notes and expense tracking',
        ],
      ),
      make_detailed_section(
        'Volunteer Experience',
        item_title='Community Event Volunteer',
        item_subtitle='Neighborhood Outreach Center',
        bullets=[
          (
            'Helped with attendee registration, sign in sheets, and reminder emails '
            'for monthly community workshops.'
          ),
          (
            'Assisted with printed materials, room layouts, and post event feedback summaries for '
            'program coordinators.'
          ),
        ],
      ),
      make_simple_section(
        'Skills',
        [
          'Calendar management',
          'Meeting Coordination',
          'Customer service',
          'Vendor communication',
          'Document organization',
          'Spreadsheet tracking',
          'Presentation preparation',
          'Travel scheduling',
          'Inbox management',
          'Event logistic',
        ],
      ),
    ],
  )

  # High-quality generic negative example: polished writing, quantified marketing/business impact,
  # and a full resume surface that should look credible to humans. It is still generic for this
  # backend data-platform role because the evidence is in brand marketing and customer programs,
  # not backend engineering, data systems, SQL/PostgreSQL, APIs, or production reliability work.
  high_quality_generic = make_resume(
    sections=[
      DetailedSection(
        id=uuid4(),
        title=make_text_unit('Experience'),
        content=[
          DetailedItem(
            title=make_text_unit('Senior Brand Marketing Manager'),
            subtitle=make_text_unit('Consumer Growth Team | Luma Goods'),
            bullets=[
              make_text_unit(
                'Led integrated launch campaigns across email, social, retail, and partner '
                'channels, increasing qualified campaign traffic by 32% year over year.'
              ),
              make_text_unit(
                'Created executive-ready positioning briefs, launch calendars, and audience '
                'segmentation plans that improved stakeholder alignment across five teams.'
              ),
              make_text_unit(
                'Managed agency timelines, creative reviews, and campaign performance reporting '
                'for seasonal product launches with budgets up to $450K.'
              ),
            ],
          ),
          DetailedItem(
            title=make_text_unit('Marketing Specialist'),
            subtitle=make_text_unit('Customer Programs | Atlas Home'),
            bullets=[
              make_text_unit(
                'Built lifecycle email programs and customer education materials that improved '
                'repeat purchase rate by 18% over two quarters.'
              ),
              make_text_unit(
                'Partnered with sales, product, and design teams to turn customer research into '
                'clear messaging, landing page copy, and campaign briefs.'
              ),
            ],
          ),
        ],
      ),
      make_detailed_section(
        'Projects',
        item_title='Customer Story Program',
        item_subtitle='Cross-functional Marketing Initiative',
        bullets=[
          (
            'Developed a customer advocacy program with interview guides, story templates, '
            'and approval workflows for sales enablement and website content.'
          ),
          (
            'Packaged campaign results into monthly business reviews for senior stakeholders, '
            'highlighting channel performance, learnings, and next-step recommendations.'
          ),
        ],
      ),
      make_simple_section(
        'Education',
        [
          'B.A. in Communications, Westbridge University',
          'Certificate in Digital Marketing Strategy',
          'Coursework: consumer behavior, market research, and persuasive writing',
        ],
      ),
      make_simple_section(
        'Skills',
        [
          'Campaign strategy',
          'Brand positioning',
          'Lifecycle marketing',
          'Customer research',
          'Executive communication',
          'Agency management',
          'Content planning',
          'Marketing analytics',
          'Audience segmentation',
          'Sales enablement',
        ],
      ),
    ],
  )

  # Low-quality relevant positive-ish example: direct backend/data-platform evidence is present,
  # but the resume is underdeveloped and mildly rough. It should remain viable because it mentions
  # Python, SQL, APIs, Postgres, reliability, logs, retries, and analyst-facing data work, but it
  # should trigger coaching because the bullets are generic, lightly ungrammatical, and thin on
  # scope, ownership, and outcomes. This is meant to feel like a real rushed submission, not an
  # obviously fake bad resume.
  low_quality_relevant = make_resume(
    sections=[
      DetailedSection(
        id=uuid4(),
        title=make_text_unit('Experience'),
        content=[
          DetailedItem(
            title=make_text_unit('Software Engineer'),
            subtitle=make_text_unit('Analytics Tools | Small Health Tech Company'),
            bullets=[
              make_text_unit(
                'Worked on Python APIs for internal reporting tools and fixed SQL issues when '
                'reports broke or loaded slow for analyst team.'
              ),
              make_text_unit(
                'Updated Postgres tables and data loads, including query changes and some indexes '
                'when dashboard numbers were not right.'
              ),
              make_text_unit(
                'Helped with batch jobs, retry logic, and logging so the team could check errors '
                'when nightly files did not finish.'
              ),
            ],
          ),
          DetailedItem(
            title=make_text_unit('Junior Developer'),
            subtitle=make_text_unit('Operations Reporting | Regional Services Group'),
            bullets=[
              make_text_unit(
                'Built small API endpoints for the operations team and fixed data export issues '
                'when reports had wrong numbers.'
              ),
              make_text_unit(
                'Worked with analysts on Postgres tables and pipeline problems through support '
                'tickets and follow-up requests.'
              ),
            ],
          ),
          DetailedItem(
            title=make_text_unit('Application Support Developer'),
            subtitle=make_text_unit('Internal Systems | Citywide Logistics'),
            bullets=[
              make_text_unit(
                'Maintained internal reporting scripts in Python and helped troubleshoot failed '
                'scheduled jobs for operations users.'
              ),
              make_text_unit(
                'Wrote basic handoff notes for recurring report issues, but documentation was '
                'short and not always kept up to date.'
              ),
            ],
          ),
        ],
      ),
      make_detailed_section(
        'Projects',
        item_title='Reporting Cleanup',
        item_subtitle='Internal Side Project',
        bullets=[
          (
            'Cleaned up old report scripts and moved some manual spreadsheet work into Python '
            'scripts, but documentation still needed more detail.'
          ),
          (
            'Added basic alerts for missed files and wrote notes for the team on what to check '
            'when jobs fail.'
          ),
        ],
      ),
      make_simple_section(
        'Education',
        [
          'B.S. Information Systems, City College',
          'Classes included databases, web apps, and some data warehousing',
          'School project was a small reporting app with Postgres backend',
        ],
      ),
      make_simple_section(
        'Skills',
        [
          'Python',
          'SQL',
          'Postgres',
          'APIs',
          'reporting jobs',
          'logs',
          'retry logic',
          'dashboards',
          'Git',
          'basic Linux',
        ],
      ),
    ],
  )

  return {
    GoldenCaseId.HIGH_QUALITY_RELEVANT: GoldenCase(
      purpose='Strong resume with direct evidence for the listing requirements.',
      listing=listing,
      application=make_application(
        listing_id=listing.id,
        resume_id=high_quality_relevant.id,
        name='Backend Data Platform Engineer',
      ),
      resume=high_quality_relevant,
    ),
    GoldenCaseId.LOW_QUALITY_GENERIC: GoldenCase(
      purpose='Generic resume that should not pass the match threshold.',
      listing=listing,
      application=make_application(
        listing_id=listing.id,
        resume_id=low_quality_generic.id,
        name='Backend Data Platform Engineer',
      ),
      resume=low_quality_generic,
    ),
    GoldenCaseId.HIGH_QUALITY_GENERIC: GoldenCase(
      purpose='Well-written resume for the wrong role.',
      listing=listing,
      application=make_application(
        listing_id=listing.id,
        resume_id=high_quality_generic.id,
        name='Backend Data Platform Engineer',
      ),
      resume=high_quality_generic,
    ),
    GoldenCaseId.LOW_QUALITY_RELEVANT: GoldenCase(
      purpose='Relevant resume with quality problems that should still remain viable.',
      listing=listing,
      application=make_application(
        listing_id=listing.id,
        resume_id=low_quality_relevant.id,
        name='Backend Data Platform Engineer',
      ),
      resume=low_quality_relevant,
    ),
  }


GOLDEN_CASES: dict[GoldenCaseId, GoldenCase] = build_golden_cases()
