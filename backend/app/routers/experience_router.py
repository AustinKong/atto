from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends

from app.repositories import ExperienceRepository
from app.schemas import Experience

router = APIRouter(
  prefix='/experiences',
  tags=['Experiences'],
)


@router.get('', response_model=list[Experience])
async def get_experiences(experience_repository: Annotated[ExperienceRepository, Depends()]):
  return experience_repository.list_all()


@router.get('/{id}', response_model=Experience)
async def get_experience(
  id: UUID, experience_repository: Annotated[ExperienceRepository, Depends()]
):
  return experience_repository.get(id)


@router.post('', response_model=Experience)
async def create_experience(
  experience: Experience, experience_repository: Annotated[ExperienceRepository, Depends()]
):
  return await experience_repository.create(experience)


@router.put('', response_model=Experience)
async def update_experience(
  experience: Experience, experience_repository: Annotated[ExperienceRepository, Depends()]
):
  return await experience_repository.update(experience)


@router.delete('/{id}', response_model=None)
async def delete_experience(
  id: UUID, experience_repository: Annotated[ExperienceRepository, Depends()]
):
  await experience_repository.delete(id)
