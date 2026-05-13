from html import escape
from typing import Any
from uuid import UUID

from jinja2 import Template as JinjaTemplate
from pydantic import BaseModel

from app.schemas.profile import Profile
from app.schemas.resume import DateRangeUnit, Section, TextUnit

PROBE_URI_PREFIX = 'atto-resume-unit:'
PROBE_STYLE = 'color: inherit; text-decoration: none;'


def render_template_html(
  template_content: str,
  profile: Profile,
  sections: list[Section],
  add_measure_markers: bool = False,
) -> str:
  source_sections = (
    [add_measure_markers_to_model(section) for section in sections]
    if add_measure_markers
    else sections
  )
  rendered_sections = [section.model_dump(mode='json') for section in source_sections]
  context = {
    'profile': profile.model_dump(mode='json'),
    'sections': rendered_sections,
  }

  template = JinjaTemplate(template_content)
  return template.render(**context)


def add_measure_markers_to_model(value: Any) -> Any:
  if isinstance(value, TextUnit):
    return value.model_copy(
      update={
        'content': wrap_unit_with_marker(value.content, value.id),
      }
    )

  if isinstance(value, DateRangeUnit):
    return value.model_copy(
      update={
        'start_date': wrap_unit_with_marker(
          str(value.start_date) if value.start_date else '',
          value.id,
        ),
        'end_date': wrap_unit_with_marker(
          str(value.end_date) if value.end_date else '',
          value.id,
        ),
      }
    )

  updates: dict[str, object] = {}
  for field_name in value.__class__.model_fields:
    field_value = getattr(value, field_name)

    if isinstance(field_value, BaseModel):
      updates[field_name] = add_measure_markers_to_model(field_value)
    elif isinstance(field_value, list):
      updates[field_name] = [
        add_measure_markers_to_model(item) if isinstance(item, BaseModel) else item
        for item in field_value
      ]
    else:
      updates[field_name] = field_value

  return value.model_copy(update=updates)


def wrap_unit_with_marker(content: str, unit_id: UUID) -> str:
  if not content:
    return ''

  return f'<a href="{PROBE_URI_PREFIX}{str(unit_id)}" style="{PROBE_STYLE}">{escape(content)}</a>'
