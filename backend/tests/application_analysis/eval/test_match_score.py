import pytest

from shared.schemas.application_analysis import ApplicationAnalysis

from .golden_cases import GoldenCaseId

pytestmark = pytest.mark.eval

HIGH_MATCH_MIN = 0.90
LOW_MATCH_MAX = 0.45


def test_high_quality_relevant_resume_scores_above_threshold(
  application_analysis_eval_results: dict[GoldenCaseId, ApplicationAnalysis],
):
  analysis = application_analysis_eval_results[GoldenCaseId.HIGH_QUALITY_RELEVANT]

  assert analysis.match_score >= HIGH_MATCH_MIN


def test_low_quality_generic_resume_scores_below_threshold(
  application_analysis_eval_results: dict[GoldenCaseId, ApplicationAnalysis],
):
  analysis = application_analysis_eval_results[GoldenCaseId.LOW_QUALITY_GENERIC]

  assert analysis.match_score <= LOW_MATCH_MAX


def test_high_quality_generic_resume_scores_below_threshold(
  application_analysis_eval_results: dict[GoldenCaseId, ApplicationAnalysis],
):
  relevant_analysis = application_analysis_eval_results[GoldenCaseId.HIGH_QUALITY_RELEVANT]
  generic_analysis = application_analysis_eval_results[GoldenCaseId.HIGH_QUALITY_GENERIC]

  assert generic_analysis.match_score < relevant_analysis.match_score


def test_low_quality_relevant_resume_remains_viable(
  application_analysis_eval_results: dict[GoldenCaseId, ApplicationAnalysis],
):
  relevant_analysis = application_analysis_eval_results[GoldenCaseId.LOW_QUALITY_RELEVANT]
  generic_analysis = application_analysis_eval_results[GoldenCaseId.LOW_QUALITY_GENERIC]

  assert relevant_analysis.match_score > generic_analysis.match_score
