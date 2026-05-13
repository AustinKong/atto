import base64

from app.schemas.profile import Profile
from app.schemas.resume import Section
from app.schemas.template import TemplateRenderResponse

from .html import render_template_html
from .pdf import measure_geometry_from_pdf, render_pdf_bytes


class TemplateService:
  async def render_pdf(
    self, template_content: str, profile: Profile, sections: list[Section]
  ) -> TemplateRenderResponse:
    """Render PDF bytes and highlight geometry for the same resume snapshot."""
    marker_html = render_template_html(
      template_content,
      profile,
      sections,
      add_measure_markers=True,
    )
    marker_pdf_bytes = await render_pdf_bytes(marker_html)
    geometry = measure_geometry_from_pdf(marker_pdf_bytes)

    clean_html = render_template_html(
      template_content,
      profile,
      sections,
      add_measure_markers=False,
    )
    pdf_bytes = await render_pdf_bytes(clean_html)
    encoded_pdf = base64.b64encode(pdf_bytes).decode('ascii')

    return TemplateRenderResponse(pdf_base64=encoded_pdf, geometry=geometry)
