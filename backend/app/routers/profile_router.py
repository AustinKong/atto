from fastapi import APIRouter

from app.schemas import Profile
from app.services import profile_service

router = APIRouter(
  prefix='/profile',
  tags=['Profile'],
)


@router.get('', response_model=Profile)
async def get_profile():
  return profile_service.get()


@router.put('', response_model=Profile)
async def update_profile(profile: Profile):
  return profile_service.update(profile)
