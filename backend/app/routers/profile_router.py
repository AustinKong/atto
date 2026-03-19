from typing import Annotated

from fastapi import APIRouter, Depends

from app.repositories import ProfileRepository
from app.schemas import Profile

router = APIRouter(
  prefix='/profile',
  tags=['Profile'],
)


@router.get('', response_model=Profile)
async def get_profile(profile_repository: Annotated[ProfileRepository, Depends()]):
  return profile_repository.get()


@router.put('', response_model=Profile)
async def update_profile(
  profile: Profile, profile_repository: Annotated[ProfileRepository, Depends()]
):
  return profile_repository.update(profile)
