import shutil
import sys
from datetime import date
from pathlib import Path
from typing import Annotated

from fastapi import Depends

from app.db_init import create_tables
from app.repositories import (
  ApplicationRepository,
  ListingRepository,
  ProfileRepository,
  ResumeRepository,
)
from app.repositories.base import VectorRepository
from app.services.config import ConfigService, get_settings

from .schemas import PaperFixture
from .transforms import (
  build_application,
  build_listing,
)

PAPER_FIXTURE_FILENAME = 'paper_data.json'


class PaperModeService:
  def __init__(
    self,
    config_service: Annotated[ConfigService, Depends()],
    profile_repository: Annotated[ProfileRepository, Depends()],
    resume_repository: Annotated[ResumeRepository, Depends()],
    listing_repository: Annotated[ListingRepository, Depends()],
    application_repository: Annotated[ApplicationRepository, Depends()],
  ) -> None:
    self.config_service = config_service
    self.profile_repository = profile_repository
    self.resume_repository = resume_repository
    self.listing_repository = listing_repository
    self.application_repository = application_repository

  def is_enabled(self) -> bool:
    return self.config_service.settings.paper.enabled

  def enter(self) -> bool:
    VectorRepository.reset_chroma_systems()
    self._delete_paper_workspace()
    self.config_service.save({'paper': {'enabled': True}})

    try:
      paper_fixture = PaperFixture.model_validate_json(
        self._get_default_fixture_path().read_text(encoding='utf-8')
      )
      date_shift = date.today() - paper_fixture.anchor_date

      create_tables()
      with self.application_repository.transaction():
        for resume in paper_fixture.resumes:
          self.resume_repository.seed(resume)

        for listing in paper_fixture.listings:
          self.listing_repository.seed(
            build_listing(
              listing,
              date_shift=date_shift,
            )
          )

        resume_by_id = {resume.id: resume for resume in paper_fixture.resumes}
        for index, application in enumerate(paper_fixture.applications):
          self.application_repository.seed(
            build_application(
              application,
              index=index,
              resume_by_id=resume_by_id,
              date_shift=date_shift,
            )
          )

      self.profile_repository.update(paper_fixture.profile)
    except Exception:
      VectorRepository.reset_chroma_systems()
      self.config_service.save({'paper': {'enabled': False}})
      raise

    return self.is_enabled()

  def exit(self) -> bool:
    VectorRepository.reset_chroma_systems()
    self._delete_paper_workspace()
    self.config_service.save({'paper': {'enabled': False}})
    return self.is_enabled()

  def _get_default_fixture_path(self) -> Path:
    if getattr(sys, 'frozen', False):
      return Path(sys._MEIPASS) / 'app' / 'assets' / PAPER_FIXTURE_FILENAME  # type: ignore

    return Path(__file__).parents[2] / 'assets' / PAPER_FIXTURE_FILENAME

  def _delete_paper_workspace(self) -> None:
    settings = get_settings(self.config_service)
    paper_dir = Path(settings.paths.db_path).parent
    if paper_dir.exists():
      shutil.rmtree(paper_dir)
