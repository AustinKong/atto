import pytest

from shared.schemas.application_analysis import ApplicationAnalysis

from .golden_cases import GoldenCaseId

pytestmark = pytest.mark.eval

HIGH_MATCH_MIN = 0.90
LOW_MATCH_MAX = 0.45


def test_high_quality_relevant_resume_scores_above_threshold(
  application_analysis_eval_results: dict[GoldenCaseId, ApplicationAnalysis],
):
  """A strong role-fit resume should clear the high match-score threshold."""
  analysis = application_analysis_eval_results[GoldenCaseId.HIGH_QUALITY_RELEVANT]

  assert analysis.match_score >= HIGH_MATCH_MIN


def test_low_quality_generic_resume_scores_below_threshold(
  application_analysis_eval_results: dict[GoldenCaseId, ApplicationAnalysis],
):
  """A weak generic resume should stay below the low match-score threshold."""
  analysis = application_analysis_eval_results[GoldenCaseId.LOW_QUALITY_GENERIC]

  assert analysis.match_score <= LOW_MATCH_MAX


def test_high_quality_generic_resume_scores_below_threshold(
  application_analysis_eval_results: dict[GoldenCaseId, ApplicationAnalysis],
):
  """Polished generic content should not outscore polished role-relevant evidence."""
  relevant_analysis = application_analysis_eval_results[GoldenCaseId.HIGH_QUALITY_RELEVANT]
  generic_analysis = application_analysis_eval_results[GoldenCaseId.HIGH_QUALITY_GENERIC]

  assert generic_analysis.match_score < relevant_analysis.match_score


def test_low_quality_relevant_resume_remains_viable(
  application_analysis_eval_results: dict[GoldenCaseId, ApplicationAnalysis],
):
  """Relevant but low-quality evidence should still beat low-quality generic content."""
  relevant_analysis = application_analysis_eval_results[GoldenCaseId.LOW_QUALITY_RELEVANT]
  generic_analysis = application_analysis_eval_results[GoldenCaseId.LOW_QUALITY_GENERIC]

  assert relevant_analysis.match_score > generic_analysis.match_score
