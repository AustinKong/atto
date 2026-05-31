import os
from typing import cast

import pytest

from app.services.config import ConfigService
from app.services.config.schemas import (
  AppConfig,
  AvailableEmbeddingModel,
  AvailableLLMModel,
  ModelProvider,
)
from tests.fakes.model_client import FakeModelClient

EVAL_MODEL_PROVIDER_ENV_VAR = 'ATTO_EVAL_MODEL_PROVIDER'
EVAL_MODEL_API_KEY_ENV_VAR = 'ATTO_EVAL_MODEL_API_KEY'
EVAL_LLM_ENV_VAR = 'ATTO_EVAL_LLM'
EVAL_EMBEDDING_ENV_VAR = 'ATTO_EVAL_EMBEDDING'
EVAL_TEMPERATURE_ENV_VAR = 'ATTO_EVAL_TEMPERATURE'
DEFAULT_EVAL_TEMPERATURE = 0.0


@pytest.fixture
def anyio_backend() -> str:
  return 'asyncio'


@pytest.fixture
def fake_model_client() -> FakeModelClient:
  return FakeModelClient()


def build_eval_config() -> AppConfig:
  config = ConfigService().settings.model_copy(deep=True)
  provider = os.getenv(EVAL_MODEL_PROVIDER_ENV_VAR)
  if provider is not None:
    config.model.provider = cast(ModelProvider, provider)

  api_key = os.getenv(EVAL_MODEL_API_KEY_ENV_VAR)
  if api_key is not None:
    config.model.api_key = api_key

  llm = os.getenv(EVAL_LLM_ENV_VAR)
  if llm is not None:
    config.model.llm = cast(AvailableLLMModel, llm)

  embedding = os.getenv(EVAL_EMBEDDING_ENV_VAR)
  if embedding is not None:
    config.model.embedding = cast(AvailableEmbeddingModel, embedding)

  config.model.temperature = float(
    os.getenv(EVAL_TEMPERATURE_ENV_VAR, str(DEFAULT_EVAL_TEMPERATURE))
  )
  config = AppConfig.model_validate(config.model_dump())

  if not config.model.api_key.strip():
    pytest.skip(f'Set {EVAL_MODEL_API_KEY_ENV_VAR} to run evals.')

  return config
