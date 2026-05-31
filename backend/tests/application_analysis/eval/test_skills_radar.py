import pytest

from shared.schemas.application_analysis import (
  ApplicationAnalysis,
  SkillComparisonRow,
)

from .golden_cases import GoldenCaseId

pytestmark = pytest.mark.eval


def skill_row_by_name(rows: list[SkillComparisonRow]) -> dict[str, SkillComparisonRow]:
  return {row.skill.lower(): row for row in rows}


def test_role_critical_skills_score_as_more_required_than_optional_skills(
  application_analysis_eval_results: dict[GoldenCaseId, ApplicationAnalysis],
):
  """Role-critical skills should receive higher required scores than secondary skills."""
  analysis = application_analysis_eval_results[GoldenCaseId.HIGH_QUALITY_RELEVANT]
  rows = skill_row_by_name(analysis.skills_comparison)

  assert rows['python'].required_score > rows['production debugging'].required_score
  assert rows['sql'].required_score > rows['data pipelines'].required_score


def test_directly_demonstrated_resume_skills_score_high(
  application_analysis_eval_results: dict[GoldenCaseId, ApplicationAnalysis],
):
  """Skills directly demonstrated by the resume should earn stronger evidence scores."""
  analysis = application_analysis_eval_results[GoldenCaseId.HIGH_QUALITY_RELEVANT]
  rows = skill_row_by_name(analysis.skills_comparison)

  assert rows['python'].resume_score >= rows['production debugging'].resume_score
  assert rows['sql'].resume_score >= rows['data pipelines'].resume_score


def test_high_quality_generic_resume_does_not_get_high_evidence_scores(
  application_analysis_eval_results: dict[GoldenCaseId, ApplicationAnalysis],
):
  """Generic accomplishments should not receive high evidence scores for role-specific skills."""
  relevant_analysis = application_analysis_eval_results[GoldenCaseId.HIGH_QUALITY_RELEVANT]
  generic_analysis = application_analysis_eval_results[GoldenCaseId.HIGH_QUALITY_GENERIC]
  relevant_rows = skill_row_by_name(relevant_analysis.skills_comparison)
  generic_rows = skill_row_by_name(generic_analysis.skills_comparison)

  assert generic_rows['python'].resume_score < relevant_rows['python'].resume_score
  assert generic_rows['sql'].resume_score < relevant_rows['sql'].resume_score
