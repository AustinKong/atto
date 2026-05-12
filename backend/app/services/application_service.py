import logging
from datetime import UTC, datetime
from typing import Annotated
from uuid import UUID

from fastapi import Depends

from app.clients.application_analysis import (
  ApplicationAnalysisClient,
  get_application_analysis_client,
)
from app.repositories import ApplicationRepository, ListingRepository, ResumeRepository
from app.schemas import ApplicationAnalysis
from app.schemas.task_status import TaskStatus
from app.utils.auth_context import use_session_token
from app.utils.errors import ServiceError

logger = logging.getLogger(__name__)


class ApplicationService:
  def __init__(
    self,
    application_repository: Annotated[ApplicationRepository, Depends()],
    listing_repository: Annotated[ListingRepository, Depends()],
    resume_repository: Annotated[ResumeRepository, Depends()],
    application_analysis_client: Annotated[
      ApplicationAnalysisClient, Depends(get_application_analysis_client)
    ],
  ) -> None:
    self.application_repository = application_repository
    self.listing_repository = listing_repository
    self.resume_repository = resume_repository
    self.application_analysis_client = application_analysis_client

  async def generate_analysis_task(
    self,
    application_id: UUID,
    session_token: str | None = None,
  ) -> None:
    with use_session_token(session_token):
      self.application_repository.set_analysis_status(application_id, TaskStatus.RUNNING)

      try:
        application = self.application_repository.get(application_id)
        listing = self.listing_repository.get(application.listing_id)
        resume = self.resume_repository.get(application.resume_id)

        if not listing.skills:
          raise ServiceError('Listing has no skills to score')

        skills_comparison = await self.application_analysis_client.get_skills_comparison(
          listing=listing,
          application=application,
          resume=resume,
        )
        content_quality = await self.application_analysis_client.get_content_quality(
          listing=listing,
          application=application,
          resume=resume,
        )
        ai_suggestions = await self.application_analysis_client.get_ai_suggestions(
          listing=listing,
          application=application,
          resume=resume,
        )

        analysis = ApplicationAnalysis(
          resume_hash=resume.create_hash(),
          generated_at=datetime.now(UTC),
          skills_comparison=skills_comparison,
          content_quality=content_quality,
          ai_suggestions=ai_suggestions,
        )

        self.application_repository.update_analysis(
          application_id, analysis.model_dump_json(by_alias=True)
        )

        self.application_repository.set_analysis_status(application_id, TaskStatus.SUCCEEDED)
      except Exception as e:
        self.application_repository.set_analysis_status(application_id, TaskStatus.FAILED, str(e))
        logger.exception(
          'Application analysis generation failed for application %s',
          application_id,
        )
