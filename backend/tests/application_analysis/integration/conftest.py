import pytest

from app.clients.application_analysis.local.client import LocalApplicationAnalysisClient
from tests.fakes.model_client import FakeModelClient


@pytest.fixture
def application_analysis_client(
  fake_model_client: FakeModelClient,
) -> LocalApplicationAnalysisClient:
  return LocalApplicationAnalysisClient(fake_model_client)
