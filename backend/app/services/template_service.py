import re
from pathlib import Path

import httpx
from jinja2 import Template as JinjaTemplate
from weasyprint import HTML

from app.config import settings
from app.repositories.file_repository import FileRepository
from app.schemas import Profile, Section, Template, TemplateSummary
from app.utils.errors import DuplicateError


class TemplateService(FileRepository):
  SYSTEM_DEFAULT_TEMPLATE_ID = '00000000-0000-0000-0000-000000000000'

  def __init__(self):
    super().__init__()

  def _extract_frontmatter(self, content: str) -> tuple[str, str, str]:
    """
    Extract frontmatter metadata from HTML content string.

    Returns:
      Tuple of (id, title, description) as strings.
    """
    header = content[:1024]

    id_match = re.search(r'<!--\s*template-id:\s*([a-f0-9\-]+)\s*-->', header, re.IGNORECASE)
    if not id_match:
      raise ValueError('Malformed frontmatter: missing template-id')
    template_id = id_match.group(1)

    title_match = re.search(r'<!--\s*template-title:\s*(.+?)\s*-->', header, re.IGNORECASE)
    if not title_match:
      raise ValueError('Malformed frontmatter: missing template-title')
    title = title_match.group(1)

    desc_match = re.search(r'<!--\s*template-description:\s*(.+?)\s*-->', header, re.IGNORECASE)
    if not desc_match:
      raise ValueError('Malformed frontmatter: missing template-description')
    description = desc_match.group(1)

    return (template_id, title, description)

  def render_html(self, template_content: str, profile: Profile, sections: list[Section]) -> str:
    profile_dict = profile.model_dump(mode='json')
    profile_dict.pop('base_sections', None)

    context = {
      'profile': profile_dict,
      'sections': [section.model_dump(mode='json') for section in sections],
    }

    template = JinjaTemplate(template_content)
    return template.render(**context)

  def render_pdf(self, template_content: str, profile: Profile, sections: list[Section]) -> bytes:
    html = self.render_html(template_content, profile, sections)
    pdf = HTML(string=html, base_url=None).write_pdf(
      presentational_hints=True,
      uncompressed_pdf=False,
    )

    if pdf is None:
      raise RuntimeError('WeasyPrint returned no data')

    return pdf

  def list_local_templates(self) -> list[TemplateSummary]:
    summaries = []

    template = self.get_local_template(self.SYSTEM_DEFAULT_TEMPLATE_ID)
    summaries.append(
      TemplateSummary(
        id=template.id,
        title=template.title,
        description=template.description,
        source='local',
      )
    )

    templates_dir = self.list_directory(Path(settings.paths.templates_dir), ['.html'])

    for filepath in templates_dir:
      try:
        content = self.read_text(filepath)
        id, title, description = self._extract_frontmatter(content)

        summaries.append(
          TemplateSummary(
            id=id,
            title=title,
            description=description,
            source='local',
          )
        )
      except Exception:
        pass

    return summaries

  def get_local_template(self, template_id: str) -> Template:
    if template_id == self.SYSTEM_DEFAULT_TEMPLATE_ID:
      system_template_path = Path(__file__).parent.parent / 'assets' / 'system.html'
      content = self.read_text(system_template_path)
      id, title, description = self._extract_frontmatter(content)
      return Template(
        id=template_id,
        title=title,
        description=description,
        content=content,
        source='local',
      )

    templates_dir = self.list_directory(Path(settings.paths.templates_dir), ['.html'])

    for filepath in templates_dir:
      try:
        content = self.read_text(filepath)
        id, title, description = self._extract_frontmatter(content)
        if id == template_id:
          return Template(
            id=template_id,
            title=title,
            description=description,
            content=content,
            source='local',
          )
      except Exception:
        pass

    raise FileNotFoundError(f'Template {template_id} not found')

  def _get_local_ids(self) -> set[str]:
    local_summaries = self.list_local_templates()
    return {summary.id for summary in local_summaries}

  async def list_remote_templates(self) -> list[TemplateSummary]:
    try:
      async with httpx.AsyncClient() as client:
        response = await client.get(
          'https://raw.githubusercontent.com/AustinKong/atto/main/templates/manifest.json',
          timeout=10.0,
        )
        response.raise_for_status()
        manifest = response.json()
    except Exception as e:
      raise RuntimeError(f'Failed to fetch remote manifest: {str(e)}') from e

    local_ids = self._get_local_ids()
    summaries = []

    for item in manifest:
      summaries.append(
        TemplateSummary(
          id=item['id'],
          title=item['title'],
          description=item['description'],
          source='both' if item['id'] in local_ids else 'remote',
        )
      )

    return summaries

  async def get_remote_template(self, template_id: str) -> Template:
    try:
      async with httpx.AsyncClient() as client:
        manifest_response = await client.get(
          'https://raw.githubusercontent.com/AustinKong/atto/main/templates/manifest.json',
          timeout=10.0,
        )
        manifest_response.raise_for_status()
        manifest = manifest_response.json()
    except Exception as e:
      raise RuntimeError(f'Failed to fetch remote manifest: {str(e)}') from e

    download_url = None
    for item in manifest:
      if item['id'] == template_id:
        download_url = item.get('download_url')
        break

    if not download_url:
      raise RuntimeError(f'Template {template_id} not found in remote manifest')

    try:
      async with httpx.AsyncClient() as client:
        response = await client.get(download_url, timeout=10.0)
        response.raise_for_status()
        content = response.text
    except Exception as e:
      raise RuntimeError(f'Failed to fetch remote template {template_id}: {str(e)}') from e

    _, title, description = self._extract_frontmatter(content)
    return Template(
      id=template_id,
      title=title,
      description=description,
      content=content,
      source='remote',
    )

  async def download_remote_template(self, template_id: str) -> None:
    local_ids = self._get_local_ids()
    if template_id in local_ids:
      raise DuplicateError(f'Template with ID {template_id} already exists locally')

    template = await self.get_remote_template(template_id)
    content = template.content

    filepath = Path(settings.paths.templates_dir) / f'{template_id}.html'
    self.write_text(filepath, content, dedup=True)
