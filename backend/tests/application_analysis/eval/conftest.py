import asyncio

import pytest

from app.clients.application_analysis.local.client import LocalApplicationAnalysisClient
from app.clients.model import ModelClient, get_local_model_client
from shared.schemas.application_analysis import ApplicationAnalysis
from tests.conftest import build_eval_config

from .golden_cases import GOLDEN_CASES, GoldenCaseId


async def run_application_analysis_eval() -> dict[GoldenCaseId, ApplicationAnalysis]:
  config = build_eval_config()
  analysis_client = LocalApplicationAnalysisClient(get_local_model_client(config))
  results: dict[GoldenCaseId, ApplicationAnalysis] = {}

  for case_id, case in GOLDEN_CASES.items():
    print(f'Running application-analysis eval case: {case_id.value}')
    results[case_id] = await analysis_client.generate_analysis(
      listing=case.listing,
      application=case.application,
      resume=case.resume,
    )

  return results


@pytest.fixture(scope='session')
def application_analysis_eval_results() -> dict[GoldenCaseId, ApplicationAnalysis]:
  return asyncio.run(run_application_analysis_eval())


@pytest.fixture(scope='session')
def application_analysis_judge_model_client() -> ModelClient:
  return get_local_model_client(build_eval_config())
