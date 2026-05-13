from typing import Annotated

from fastapi import Depends

from .base_client import ApplicationAnalysisClient
from .local import LocalApplicationAnalysisClient


def get_application_analysis_client(
  local_client: Annotated[LocalApplicationAnalysisClient, Depends()],
) -> ApplicationAnalysisClient:
  return local_client


__all__ = [
  'ApplicationAnalysisClient',
  'LocalApplicationAnalysisClient',
  'get_application_analysis_client',
]
