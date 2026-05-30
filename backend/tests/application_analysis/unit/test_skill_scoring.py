import pytest

from app.clients.application_analysis.local.skills_comparison import calculate_hybrid_skill_scores
from app.utils.errors import ServiceError
from shared.schemas.application_analysis import SkillScoreResult, SkillScoreRow

pytestmark = pytest.mark.unit

HIGH_MODEL_SKILL_SCORE = 80
BALANCED_MODEL_SKILL_SCORE = 50
NO_MODEL_EVIDENCE_SCORE = 0
FULL_MODEL_EVIDENCE_SCORE = 100


def skill_scores(*rows: tuple[str, int]) -> SkillScoreResult:
  return SkillScoreResult(rows=[SkillScoreRow(skill=skill, score=score) for skill, score in rows])


@pytest.mark.parametrize(
  'llm_result',
  [
    skill_scores(('Python', HIGH_MODEL_SKILL_SCORE)),
    skill_scores(
      ('Python', HIGH_MODEL_SKILL_SCORE),
      ('SQL', HIGH_MODEL_SKILL_SCORE),
      ('React', HIGH_MODEL_SKILL_SCORE),
    ),
  ],
)
def test_calculate_hybrid_skill_scores_rejects_incomplete_model_skill_rows(
  llm_result: SkillScoreResult,
):
  """Avoids silently trusting partial or off-target LLM skill scoring responses."""
  with pytest.raises(ServiceError, match='AI response was incomplete'):
    calculate_hybrid_skill_scores(
      skills=['Python', 'SQL'],
      source_text='Python and SQL are required for this role.',
      llm_result=llm_result,
    )


def test_calculate_hybrid_skill_scores_blends_model_evidence_with_keyword_frequency():
  """Skill scores use a blend of LLM judgment and keyword signal."""
  scores = calculate_hybrid_skill_scores(
    skills=['Python', 'SQL'],
    source_text='Python Python SQL',
    llm_result=skill_scores(
      ('Python', BALANCED_MODEL_SKILL_SCORE), ('SQL', BALANCED_MODEL_SKILL_SCORE)
    ),
  )

  assert scores['Python'] > scores['SQL']
  assert scores['SQL'] > 0


def test_calculate_hybrid_skill_scores_keeps_keyword_frequency_from_overriding_model_evidence():
  """Avoids resume keyword stuffing overpowering a low score from the LLM evidence check."""
  scores = calculate_hybrid_skill_scores(
    skills=['Python', 'SQL'],
    source_text='Python Python Python SQL',
    llm_result=skill_scores(
      ('Python', NO_MODEL_EVIDENCE_SCORE), ('SQL', FULL_MODEL_EVIDENCE_SCORE)
    ),
  )

  assert scores['SQL'] > scores['Python']
  assert scores['Python'] > 0
