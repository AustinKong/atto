import json

import pytest
from pydantic import BaseModel, Field

from app.clients.model import ModelClient
from shared.schemas.application_analysis import (
  AIUnitSuggestion,
  ApplicationAnalysis,
)

from .golden_cases import GOLDEN_CASES, GoldenCaseId

pytestmark = pytest.mark.eval

MINIMAL_SUGGESTION_COUNT_MAX = 2
# Intentionally lowered for now. TODO: Revisit after improving suggestions quality and relevance
JUDGE_SCORE_MIN = 2


class AISuggestionJudgeResult(BaseModel):
  grounded_score: int = Field(ge=1, le=5)
  actionable_score: int = Field(ge=1, le=5)
  relevance_score: int = Field(ge=1, le=5)
  verdict: str


def suggestions_for_case(analysis: ApplicationAnalysis) -> list[AIUnitSuggestion]:
  return analysis.ai_suggestions.suggestions if analysis.ai_suggestions else []


def has_ai_feedback(analysis: ApplicationAnalysis) -> bool:
  if analysis.ai_suggestions is None:
    return False

  return bool(analysis.ai_suggestions.summary or suggestions_for_case(analysis))


def format_suggestions(analysis: ApplicationAnalysis) -> str:
  suggestions = suggestions_for_case(analysis)
  if not suggestions:
    return '  (none)'

  return '\n'.join(
    f'  - {suggestion.id}: {suggestion.suggestion}'
    + (f'\n    replacement: {suggestion.replacement_text}' if suggestion.replacement_text else '')
    for suggestion in suggestions
  )


def format_judge_failure(
  case_id: GoldenCaseId,
  analysis: ApplicationAnalysis,
  result: AISuggestionJudgeResult,
) -> str:
  summary = analysis.ai_suggestions.summary if analysis.ai_suggestions else '(none)'
  return (
    f'case: {case_id.value}\n'
    f'match_score: {analysis.match_score:.3f}\n'
    f'judge_scores: grounded={result.grounded_score}, '
    f'actionable={result.actionable_score}, relevance={result.relevance_score}\n'
    f'verdict: {result.verdict}\n'
    f'summary: {summary}\n'
    f'suggestions:\n{format_suggestions(analysis)}'
  )


def build_ai_suggestion_judge_prompt(
  case_id: GoldenCaseId,
  analysis: ApplicationAnalysis,
) -> str:
  case = GOLDEN_CASES[case_id]
  summary = analysis.ai_suggestions.summary if analysis.ai_suggestions else ''
  suggestions_json = json.dumps(
    [suggestion.model_dump(mode='json') for suggestion in suggestions_for_case(analysis)]
  )
  return (
    'You are judging AI resume feedback for a job application tool.\n'
    'Judge the feedback quality, not the candidate quality.\n'
    'Score from 1 to 5 where 5 is best.\n'
    'The feedback includes both the top-level summary and unit-level suggestions.\n'
    'Grounded means the feedback is supported by the resume and job listing. It is grounded to '
    'say that evidence is missing when the listing requires it and the resume does not show it.\n'
    'Actionable means the user could clearly apply the advice, including by adding real missing '
    'evidence if they have it.\n'
    'Relevance means the suggestions are useful for improving this submitted resume in this '
    'application context. They may improve role fit, evidence quality, clarity, specificity, '
    'action verbs, grammar, ownership, or outcomes. A suggestion can be relevant even when it '
    'improves resume quality rather than adding new role-specific keywords.\n'
    'Do not lower scores only because the resume itself is low-fit, generic, or missing major '
    'requirements. Penalize only if the feedback is ungrounded, vague, fabricated, or not useful.\n'
    'Return only the structured result.\n\n'
    f'Golden case purpose: {case.purpose}\n'
    f'Listing:\n{case.listing.model_dump_json()}\n\n'
    f'Resume:\n{case.resume.model_dump_json()}\n\n'
    f'Summary:\n{summary}\n\n'
    f'Suggestions:\n{suggestions_json}'
  )


def test_high_quality_relevant_case_has_no_or_minimal_suggestions(
  application_analysis_eval_results: dict[GoldenCaseId, ApplicationAnalysis],
):
  """A strong role-fit resume should receive no feedback or only a minimal suggestion set."""
  analysis = application_analysis_eval_results[GoldenCaseId.HIGH_QUALITY_RELEVANT]

  assert len(suggestions_for_case(analysis)) <= MINIMAL_SUGGESTION_COUNT_MAX


def test_low_quality_generic_case_gets_ai_feedback(
  application_analysis_eval_results: dict[GoldenCaseId, ApplicationAnalysis],
):
  """A weak generic resume should receive AI feedback instead of passing silently."""
  analysis = application_analysis_eval_results[GoldenCaseId.LOW_QUALITY_GENERIC]

  assert has_ai_feedback(analysis)


def test_low_quality_relevant_case_gets_quality_feedback_without_fit_rejection(
  application_analysis_eval_results: dict[GoldenCaseId, ApplicationAnalysis],
):
  """Relevant but weak evidence should receive quality feedback without being treated as no-fit."""
  analysis = application_analysis_eval_results[GoldenCaseId.LOW_QUALITY_RELEVANT]

  assert has_ai_feedback(analysis)


def test_high_quality_generic_case_gets_relevance_gap_feedback(
  application_analysis_eval_results: dict[GoldenCaseId, ApplicationAnalysis],
):
  """Polished generic content should still receive feedback about missing role alignment."""
  analysis = application_analysis_eval_results[GoldenCaseId.HIGH_QUALITY_GENERIC]

  assert has_ai_feedback(analysis)


def test_suggestions_keep_unit_ids_and_hashes_for_stale_text_detection(
  application_analysis_eval_results: dict[GoldenCaseId, ApplicationAnalysis],
):
  """Generated suggestions should carry unit identity data for stale-text detection."""
  for analysis in application_analysis_eval_results.values():
    for suggestion in suggestions_for_case(analysis):
      assert suggestion.unit_id
      assert suggestion.unit_hash


@pytest.mark.anyio
async def test_ai_suggestions_are_grounded_actionable_and_role_relevant_by_llm_judge(
  application_analysis_eval_results: dict[GoldenCaseId, ApplicationAnalysis],
  application_analysis_judge_model_client: ModelClient,
):
  """An LLM judge should rate generated feedback as grounded, actionable, and role-relevant."""
  cases_with_feedback = {
    case_id: analysis
    for case_id, analysis in application_analysis_eval_results.items()
    if has_ai_feedback(analysis)
  }

  assert cases_with_feedback
  for case_id, analysis in cases_with_feedback.items():
    result = await application_analysis_judge_model_client.call_structured(
      input=build_ai_suggestion_judge_prompt(case_id, analysis),
      response_model=AISuggestionJudgeResult,
    )
    failure_message = format_judge_failure(case_id, analysis, result)

    assert result.grounded_score >= JUDGE_SCORE_MIN, failure_message
    assert result.actionable_score >= JUDGE_SCORE_MIN, failure_message
    assert result.relevance_score >= JUDGE_SCORE_MIN, failure_message
