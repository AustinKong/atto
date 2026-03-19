from pathlib import Path

from app.config import settings
from app.repositories.base import JSONRepository
from app.schemas import Profile


class ProfileRepository(JSONRepository):
  def __init__(self):
    super().__init__()

  def get(self) -> Profile:
    return self.read_json(Path(settings.paths.profile_path), Profile, create_if_missing=True)

  def update(self, profile: Profile) -> Profile:
    self.write_json(Path(settings.paths.profile_path), profile)
    return profile
