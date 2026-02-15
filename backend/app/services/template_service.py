from pathlib import Path

import httpx
from jinja2 import Template
from weasyprint import HTML

from app.config import settings
from app.repositories.file_repository import FileRepository
from app.schemas import Profile, Section
from app.utils.errors import NotFoundError


class TemplateService(FileRepository):
  def __init__(self):
    super().__init__()

  def render_html(self, template_content: str, profile: Profile, sections: list[Section]) -> str:
    profile_dict = profile.model_dump(mode='json')
    profile_dict.pop('base_sections', None)

    context = {
      'profile': profile_dict,
      'sections': [section.model_dump(mode='json') for section in sections],
    }

    try:
      template = Template(template_content)
      return template.render(**context)
    except Exception as e:
      raise RuntimeError(f'Failed to render template: {e}') from e

  def render_pdf(self, template_content: str, profile: Profile, sections: list[Section]) -> bytes:
    html = self.render_html(template_content, profile, sections)
    try:
      pdf = HTML(string=html, base_url=None).write_pdf(
        presentational_hints=True,
        uncompressed_pdf=False,
      )
      if pdf is None:
        raise RuntimeError('WeasyPrint returned no data')
      return pdf
    except Exception as exc:
      raise RuntimeError(f'Failed to render PDF: {exc}') from exc

  def list_local_templates(self) -> list[str]:
    templates_dir = self.list_directory(Path(settings.paths.templates_dir), ['.html', '.htm'])
    return [p.name for p in templates_dir]

  def get_template_content(self, template_name: str) -> str:
    try:
      filepath = Path(settings.paths.templates_dir) / template_name
      return self.read_text(filepath)
    except Exception as e:
      raise NotFoundError(f"Template '{template_name}' not found") from e

  async def list_remote_templates(self) -> list[str]:
    """Fetch community templates from GitHub."""
    try:
      async with httpx.AsyncClient() as client:
        response = await client.get(
          'https://api.github.com/repos/AustinKong/atto/contents/templates',
          headers={'Accept': 'application/vnd.github.v3+json'},
        )
        response.raise_for_status()
        templates = response.json()
        return [
          item['name']
          for item in templates
          if isinstance(item, dict)
          and item.get('type') == 'file'
          and item['name'].endswith(('.html', '.htm'))
        ]
    except Exception as e:
      raise RuntimeError(f'Failed to fetch remote templates: {e}') from e

  async def get_remote_template(self, template_name: str) -> str:
    """Fetch template content from GitHub."""
    try:
      async with httpx.AsyncClient() as client:
        response = await client.get(
          f'https://raw.githubusercontent.com/AustinKong/atto/main/templates/{template_name}',
        )
        response.raise_for_status()
        return response.text
    except httpx.HTTPStatusError as e:
      if e.response.status_code == 404:
        raise NotFoundError(f"Remote template '{template_name}' not found") from e
      raise RuntimeError(f'Failed to fetch remote template: {e}') from e
    except Exception as e:
      raise RuntimeError(f'Failed to fetch remote template: {e}') from e

  async def download_remote_template(self, template_name: str) -> None:
    """Download and save remote template locally."""
    try:
      # Check if template already exists locally
      local_templates = self.list_local_templates()
      if template_name in local_templates:
        raise ValueError(f"Template '{template_name}' already exists locally")

      # Fetch the template content
      content = await self.get_remote_template(template_name)

      # Save it locally
      filepath = Path(settings.paths.templates_dir) / template_name
      filepath.parent.mkdir(parents=True, exist_ok=True)
      filepath.write_text(content)
    except ValueError:
      raise
    except NotFoundError:
      raise
    except Exception as e:
      raise RuntimeError(f'Failed to download template: {e}') from e
