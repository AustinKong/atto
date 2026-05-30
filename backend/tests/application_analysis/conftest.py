import pytest

from tests.fakes.model_client import FakeModelClient


@pytest.fixture
def anyio_backend() -> str:
  return 'asyncio'


@pytest.fixture
def fake_model_client() -> FakeModelClient:
  return FakeModelClient()
