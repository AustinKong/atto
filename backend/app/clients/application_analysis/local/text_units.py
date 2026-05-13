from uuid import UUID

from pydantic import BaseModel

from app.schemas.resume import BaseSection, Section, TextUnit

TextUnitRef = tuple[UUID, str]


def extract_section_text_units(section: Section) -> list[TextUnitRef]:
  """Recursively extract text units as (id, stripped text) tuples."""
  units: list[TextUnitRef] = []

  def walk(node: BaseModel | list[object]) -> None:
    if isinstance(node, TextUnit):
      text = node.content.strip()
      if text:
        units.append((node.id, text))
      return

    if isinstance(node, BaseModel):
      for field_name in node.__class__.model_fields:
        if isinstance(node, BaseSection) and field_name == 'title':
          continue
        field_value = getattr(node, field_name)
        if isinstance(field_value, (BaseModel, list)):
          walk(field_value)
      return

    for item in node:
      if isinstance(item, (BaseModel, list)):
        walk(item)

  walk(section)
  return units
