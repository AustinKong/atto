from io import BytesIO
from uuid import UUID

from playwright.async_api import async_playwright
from pypdf import PdfReader

from app.schemas.template import TemplateRenderRect
from app.utils.math import clamp

from .html import PROBE_URI_PREFIX

UNIT_MIN = 0.0
UNIT_MAX = 1.0


async def render_pdf_bytes(html: str) -> bytes:
  async with async_playwright() as p:
    browser = await p.chromium.launch(headless=True)
    page = await browser.new_page()

    await page.set_content(html, wait_until='networkidle')
    pdf = await page.pdf(format='A4', print_background=True)

    await browser.close()

  return pdf


def measure_geometry_from_pdf(pdf_bytes: bytes) -> dict[UUID, list[TemplateRenderRect]]:
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
        x=clamp(x0 / page_width, UNIT_MIN, UNIT_MAX),
        y=clamp((page_height - y1) / page_height, UNIT_MIN, UNIT_MAX),
        width=clamp((x1 - x0) / page_width, UNIT_MIN, UNIT_MAX),
        height=clamp((y1 - y0) / page_height, UNIT_MIN, UNIT_MAX),
      )
      geometry.setdefault(unit_id, []).append(unit_rect)

  return geometry
