import base64
from html import escape
from io import BytesIO
from typing import Any
from uuid import UUID

from jinja2 import Template as JinjaTemplate
from playwright.async_api import async_playwright
from pydantic import BaseModel
from pypdf import PdfReader

from app.schemas import (
  DateRangeUnit,
  Profile,
  Section,
  TemplateRenderRect,
  TemplateRenderResponse,
  TextUnit,
)

PROBE_URI_PREFIX = 'atto-resume-unit:'
PROBE_STYLE = 'color: inherit; text-decoration: none;'


def _clamp_unit(value: float) -> float:
  return max(0.0, min(1.0, value))


class TemplateService:
  async def render_pdf(
    self, template_content: str, profile: Profile, sections: list[Section]
  ) -> TemplateRenderResponse:
    """Render PDF bytes and highlight geometry for the same resume snapshot.

    The service renders twice: first with measurement markers to compute per-unit geometry,
    then with clean HTML to generate the final PDF. Returns base64 PDF plus UUID-keyed rects.
    """
    marker_html = await self._render_html(
      template_content,
      profile,
      sections,
      add_measure_markers=True,
    )
    marker_pdf_bytes = await self._render_pdf_bytes(marker_html)
    geometry = self._measure_geometry_from_pdf(marker_pdf_bytes)

    clean_html = await self._render_html(
      template_content,
      profile,
      sections,
      add_measure_markers=False,
    )
    pdf_bytes = await self._render_pdf_bytes(clean_html)
    encoded_pdf = base64.b64encode(pdf_bytes).decode('ascii')

    return TemplateRenderResponse(pdf_base64=encoded_pdf, geometry=geometry)

  async def _render_html(
    self,
    template_content: str,
    profile: Profile,
    sections: list[Section],
    add_measure_markers: bool = False,
  ) -> str:
    """Render template with profile and sections to HTML string."""
    source_sections = (
      [self._add_markers(section) for section in sections] if add_measure_markers else sections
    )
    rendered_sections = [section.model_dump(mode='json') for section in source_sections]
    context = {
      'profile': profile.model_dump(mode='json'),
      'sections': rendered_sections,
    }

    template = JinjaTemplate(template_content)
    return template.render(**context)

  def _measure_geometry_from_pdf(self, pdf_bytes: bytes) -> dict[UUID, list[TemplateRenderRect]]:
    """Extract normalized, page-local rectangles from probe URI annotations in a PDF."""
    reader = PdfReader(BytesIO(pdf_bytes))
    geometry: dict[UUID, list[TemplateRenderRect]] = {}
    for page_index, page in enumerate(reader.pages):
      page_width = float(page.mediabox.width)
      page_height = float(page.mediabox.height)

      annotations = page.get('/Annots') or []
      for annotation_ref in annotations:
        annotation = annotation_ref.get_object()
        uri = str((annotation.get('/A') or {}).get('/URI') or '')
        if not uri.startswith(PROBE_URI_PREFIX):
          continue

        unit_id = UUID(uri.removeprefix(PROBE_URI_PREFIX))
        rect = annotation.get('/Rect') or []
        if len(rect) != 4:
          continue

        x0 = float(min(rect[0], rect[2]))
        x1 = float(max(rect[0], rect[2]))
        y0 = float(min(rect[1], rect[3]))
        y1 = float(max(rect[1], rect[3]))

        unit_rect = TemplateRenderRect(
          page_index=page_index,
          x=_clamp_unit(x0 / page_width),
          y=_clamp_unit((page_height - y1) / page_height),
          width=_clamp_unit((x1 - x0) / page_width),
          height=_clamp_unit((y1 - y0) / page_height),
        )
        geometry.setdefault(unit_id, []).append(unit_rect)

    return geometry

  async def _render_pdf_bytes(self, html: str) -> bytes:
    async with async_playwright() as p:
      browser = await p.chromium.launch(headless=True)
      page = await browser.new_page()

      await page.set_content(html, wait_until='networkidle')
      pdf = await page.pdf(format='A4', print_background=True)

      await browser.close()

    return pdf

  def _add_markers(self, value: Any) -> Any:
    """Return a model copy with measure markers injected into text-carrying resume units.

    TextUnit content and DateRangeUnit values are wrapped in invisible marker spans using the
    unit UUID. Non-text fields are preserved while nested models/lists are traversed recursively.
    """

    def wrap_unit_with_marker(content: str, unit_id: UUID) -> str:
      if not content:
        return ''

      return (
        f'<a href="{PROBE_URI_PREFIX}{str(unit_id)}" style="{PROBE_STYLE}">{escape(content)}</a>'
      )

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
        updates[field_name] = self._add_markers(field_value)
      elif isinstance(field_value, list):
        updates[field_name] = [
          self._add_markers(item) if isinstance(item, BaseModel) else item for item in field_value
        ]
      else:
        updates[field_name] = field_value

    return value.model_copy(update=updates)
