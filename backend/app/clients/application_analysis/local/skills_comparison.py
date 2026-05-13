from app.clients.model import ModelClient
from app.utils.errors import ServiceError
from app.utils.math import clamp
from app.utils.text import find_phrase_matches
from shared.schemas.application_analysis import SkillScoreResult

LLM_WEIGHT = 0.6
KEYWORD_WEIGHT = 0.4


async def score_skills_from_prompt(
  llm_client: ModelClient,
  skills: list[str],
  source_text: str,
  prompt: str,
) -> dict[str, int]:
  llm_result = await llm_client.call_structured(
    input=prompt,
    response_model=SkillScoreResult,
  )
  return calculate_hybrid_skill_scores(
    skills=skills,
    source_text=source_text,
    llm_result=llm_result,
  )


def calculate_hybrid_skill_scores(
  skills: list[str],
  source_text: str,
  llm_result: SkillScoreResult,
) -> dict[str, int]:
  expected_skills = {skill.lower().strip() for skill in skills}
  scored_skills = {row.skill.lower().strip() for row in llm_result.rows}
  if expected_skills != scored_skills:
    raise ServiceError('Invalid skill scoring response')

  llm_scores_by_skill = {
    row.skill.lower().strip(): int(clamp(row.score, 0.0, 100.0)) for row in llm_result.rows
  }
  keyword_counts_by_skill: dict[str, int] = {}
  for skill in skills:
    key = skill.lower().strip()
    keyword_counts_by_skill[key] = len(find_phrase_matches(source_text, skill))

  max_count = max(keyword_counts_by_skill.values()) if keyword_counts_by_skill else 0

  hybrid_scores: dict[str, int] = {}
  for skill in skills:
    key = skill.lower().strip()
    keyword_count = keyword_counts_by_skill[key]
    keyword_score = (keyword_count / max_count) if max_count > 0 else 0.0
    llm_component = llm_scores_by_skill[key] / 100
    combined = (LLM_WEIGHT * llm_component + KEYWORD_WEIGHT * keyword_score) * 100
    hybrid_scores[skill] = int(round(clamp(combined, 0.0, 100.0)))

  return hybrid_scores
