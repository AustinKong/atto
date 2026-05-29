from pathlib import Path
from typing import Annotated

from fastapi import Depends

from app.repositories.base import JSONRepository
from app.schemas.profile import Profile
from app.services.config import get_settings
from app.services.config.schemas import AppConfig


class ProfileRepository(JSONRepository):
  def __init__(self, settings: Annotated[AppConfig, Depends(get_settings)]):
    self.settings = settings
    super().__init__()

  def get(self) -> Profile:
    return self.read_json(
      Path(self.settings.paths.profile_path),
      Profile,
      create_if_missing=True,
    )

  def update(self, profile: Profile) -> Profile:
    self.write_json(Path(self.settings.paths.profile_path), profile)
    return profile
