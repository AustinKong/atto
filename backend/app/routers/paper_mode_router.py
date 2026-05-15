from typing import Annotated

from fastapi import APIRouter, Depends

from app.services.paper_mode import PaperModeService

router = APIRouter(prefix='/paper-mode', tags=['Paper Mode'])


@router.post('/enter', response_model=bool)
async def enter_paper_mode(
  paper_mode_service: Annotated[PaperModeService, Depends()],
) -> bool:
  return paper_mode_service.enter()


@router.post('/exit', response_model=bool)
async def exit_paper_mode(
  paper_mode_service: Annotated[PaperModeService, Depends()],
) -> bool:
  return paper_mode_service.exit()
