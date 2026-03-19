from jinja2 import Template as JinjaTemplate
from playwright.async_api import async_playwright

from app.schemas import Profile, Section


class TemplateService:
  async def render_html(
    self, template_content: str, profile: Profile, sections: list[Section]
  ) -> str:
    """Render template with profile and sections to HTML string."""
    profile_dict = profile.model_dump(mode='json')

    context = {
      'profile': profile_dict,
      'sections': [section.model_dump(mode='json') for section in sections],
    }

    template = JinjaTemplate(template_content)
    return template.render(**context)

  async def render_pdf(
    self, template_content: str, profile: Profile, sections: list[Section]
  ) -> bytes:
    """Render template with profile and sections to PDF bytes."""
    html = await self.render_html(template_content, profile, sections)

    async with async_playwright() as p:
      browser = await p.chromium.launch(headless=True)
      page = await browser.new_page()

      await page.set_content(html, wait_until='networkidle')
      pdf = await page.pdf(format='A4', print_background=True)

    return pdf
