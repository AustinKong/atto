import json

import pytest
from pydantic import BaseModel, Field

from app.clients.model import ModelClient
from app.schemas.listing_draft import ListingDraft, ListingDraftUnique

from .golden_cases import GOLDEN_CASES, GoldenCaseId

pytestmark = pytest.mark.eval

JUDGE_SCORE_MIN = 3


class ListingDraftJudgeResult(BaseModel):
  grounded_score: int = Field(ge=1, le=5)
  description_specificity_score: int = Field(ge=1, le=5)
  qualification_coverage_score: int = Field(ge=1, le=5)
  responsibility_coverage_score: int = Field(ge=1, le=5)
  boilerplate_avoidance_score: int = Field(ge=1, le=5)
  usefulness_score: int = Field(ge=1, le=5)
  verdict: str


def unique_draft_for_valid_case(
  listing_draft_eval_results: dict[GoldenCaseId, ListingDraft],
) -> ListingDraftUnique:
  draft = listing_draft_eval_results[GoldenCaseId.CLEAN_MARKDOWN_LISTING]
  assert isinstance(draft, ListingDraftUnique), getattr(draft, 'error', None)
  return draft


def build_listing_draft_judge_prompt(case_id: GoldenCaseId, draft: ListingDraftUnique) -> str:
  case = GOLDEN_CASES[case_id]
  draft_json = json.dumps(draft.listing.model_dump(mode='json'), indent=2)
  return (
    'You are judging a generated job listing draft for a job application tracker.\n'
    'Judge the generated draft quality, not the quality of the job itself.\n'
    'Score from 1 to 5 where 5 is best.\n'
    'Grounded means the draft is supported by the source listing and does not invent important '
    'facts like title, company, location, salary, skills, or requirements.\n'
    'Description specificity means the description summarizes the actual role, team, product, '
    'users/customers, and concrete work instead of mostly repeating broad company boilerplate.\n'
    'Qualification coverage means requirements capture the must-have and preferred candidate '
    'background: education, years of experience, programming languages, and development domains.\n'
    'Responsibility coverage means requirements capture important role expectations such as '
    'feature ownership, RPC/UI work, growth initiatives, and reliability work when present.\n'
    'Boilerplate avoidance means requirements and description avoid job-board chrome, premium '
    'upsells, legal text, broad company slogans, and application instructions.\n'
    'Usefulness means the draft would be helpful as an editable saved job listing for a candidate '
    'deciding what to highlight in an application.\n'
    'Do not require exact wording. Penalize missing major requirements, hallucinated technologies, '
    'or vague generic output.\n'
    'Return only the structured result.\n\n'
    f'Golden case purpose: {case.purpose}\n'
    f'Source listing:\n{case.content}\n\n'
    f'Generated draft JSON:\n{draft_json}'
  )


def format_judge_failure(result: ListingDraftJudgeResult, draft: ListingDraftUnique) -> str:
  return (
    f'judge_scores: grounded={result.grounded_score}, '
    f'description_specificity={result.description_specificity_score}, '
    f'qualification_coverage={result.qualification_coverage_score}, '
    f'responsibility_coverage={result.responsibility_coverage_score}, '
    f'boilerplate_avoidance={result.boilerplate_avoidance_score}, '
    f'usefulness={result.usefulness_score}\n'
    f'verdict: {result.verdict}\n'
    f'draft: {draft.listing.model_dump_json()}'
  )


@pytest.mark.anyio
async def test_valid_listing_draft_is_grounded_complete_and_useful_by_llm_judge(
  listing_draft_eval_results: dict[GoldenCaseId, ListingDraft],
  listing_draft_judge_model_client: ModelClient,
):
  """An LLM judge should rate the generated draft as grounded, complete, and candidate-useful."""
  draft = unique_draft_for_valid_case(listing_draft_eval_results)

  result = await listing_draft_judge_model_client.call_structured(
    input=build_listing_draft_judge_prompt(GoldenCaseId.CLEAN_MARKDOWN_LISTING, draft),
    response_model=ListingDraftJudgeResult,
  )
  failure_message = format_judge_failure(result, draft)

  assert result.grounded_score >= JUDGE_SCORE_MIN, failure_message
  assert result.description_specificity_score >= JUDGE_SCORE_MIN, failure_message
  assert result.qualification_coverage_score >= JUDGE_SCORE_MIN, failure_message
  assert result.responsibility_coverage_score >= JUDGE_SCORE_MIN, failure_message
  assert result.boilerplate_avoidance_score >= JUDGE_SCORE_MIN, failure_message
  assert result.usefulness_score >= JUDGE_SCORE_MIN, failure_message
