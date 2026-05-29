from pathlib import Path
from typing import Annotated

from fastapi import Depends

from .config_service import ConfigService
from .schemas import AppConfig, PathsPrefs

PAPER_DIRNAME = 'paper'


def _get_paper_paths(base_data_dir: Path, settings: AppConfig) -> PathsPrefs:
  paper_dir = base_data_dir / PAPER_DIRNAME
  return PathsPrefs(
    db_path=str(paper_dir / 'db.sqlite3'),
    vector_path=str(paper_dir / 'vectors'),
    profile_path=str(paper_dir / 'profile.json'),
    templates_dir=str(paper_dir / 'resume_templates'),
    playwright_browsers_path=settings.paths.playwright_browsers_path,
  )


def get_settings(config_service: Annotated[ConfigService, Depends()]) -> AppConfig:
  settings = config_service.settings
  if settings.paper.enabled:
    settings.paths = _get_paper_paths(config_service.data_dir, settings)
  return settings


__all__ = ['ConfigService', 'get_settings']
