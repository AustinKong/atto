from uuid import UUID

import pytest

from shared.schemas.application_analysis import (
  ApplicationAnalysis,
  ContentQualitySection,
)

from .golden_cases import GoldenCaseId

pytestmark = pytest.mark.eval


def average_section_scores(sections: list[ContentQualitySection]) -> dict[UUID, float]:
  scores_by_section_id: dict[UUID, float] = {}
  for section in sections:
    if section.scores:
      scores_by_section_id[section.section_id] = sum(row.score for row in section.scores) / len(
        section.scores
      )
  return scores_by_section_id


def average_resume_content_quality(analysis: ApplicationAnalysis) -> float:
  section_scores = average_section_scores(analysis.content_quality)
  return sum(section_scores.values()) / len(section_scores)


def test_high_quality_relevant_content_quality_beats_low_quality_generic(
  application_analysis_eval_results: dict[GoldenCaseId, ApplicationAnalysis],
):
  relevant_analysis = application_analysis_eval_results[GoldenCaseId.HIGH_QUALITY_RELEVANT]
  generic_analysis = application_analysis_eval_results[GoldenCaseId.LOW_QUALITY_GENERIC]

  assert average_resume_content_quality(relevant_analysis) > average_resume_content_quality(
    generic_analysis
  )


def test_low_quality_relevant_content_quality_lags_high_quality_relevant(
  application_analysis_eval_results: dict[GoldenCaseId, ApplicationAnalysis],
):
  high_quality_analysis = application_analysis_eval_results[GoldenCaseId.HIGH_QUALITY_RELEVANT]
  low_quality_analysis = application_analysis_eval_results[GoldenCaseId.LOW_QUALITY_RELEVANT]

  assert average_resume_content_quality(low_quality_analysis) < average_resume_content_quality(
    high_quality_analysis
  )


def test_low_quality_relevant_resume_has_weak_section_while_still_matching(
  application_analysis_eval_results: dict[GoldenCaseId, ApplicationAnalysis],
):
  analysis = application_analysis_eval_results[GoldenCaseId.LOW_QUALITY_RELEVANT]
  generic_analysis = application_analysis_eval_results[GoldenCaseId.LOW_QUALITY_GENERIC]
  section_scores = average_section_scores(analysis.content_quality)

  assert analysis.match_score > generic_analysis.match_score
  assert min(section_scores.values()) < average_resume_content_quality(analysis)
