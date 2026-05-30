from textwrap import dedent

SKILL_REQUIRED_SCORE_PROMPT = dedent(
  """
  You are a hiring strategist. Score how required each skill is for this application target.

  Rules:
  - Use ONLY the given skills in `skills`.
  - Return exactly one row per provided skill.
  - `score` must be an integer from 0 to 100.
  - Base scores on the listing title, description, and requirements.

  application_name: {application_name}
  listing_title: {listing_title}
  skills:
  {skills}

  listing_context:
  {source_text}
  """
).strip()


SKILL_RESUME_SCORE_PROMPT = dedent(
  """
  You are a resume evaluator. Score how strongly each skill is demonstrated in this resume.

  Rules:
  - Use ONLY the given skills in `skills`.
  - Return exactly one row per provided skill.
  - `score` must be an integer from 0 to 100.
  - Base scores on direct evidence in the resume text only.

  application_name: {application_name}
  skills:
  {skills}

  resume_context:
  {source_text}
  """
).strip()


AI_SUGGESTIONS_PROMPT = dedent(
  """
  You are a resume coach generating structured suggestions.

  Rules:
  - Return one top-level `summary` for the whole resume.
  - Put resume-wide gaps, missing role evidence, and general strategy in `summary`, not in
    unit-level suggestions.
  - Return at most {max_suggestions} high-impact unit-level suggestions.
  - Return an empty `suggestions` list when the resume is already accept-ready for the role.
  - Prioritize material issues that could change a hiring reviewer's judgment.
  - Avoid low-value polish, nice-to-have detail, style preferences, and duplicate advice.
  - Do not suggest adding details that are already present elsewhere in the resume.

  Grounding:
  - Optimize for the listing, but keep every suggestion honest to the submitted resume.
  - If a role-critical skill, responsibility, tool, domain, or outcome is missing, say it is
    missing in `summary` and suggest adding real evidence only if the candidate has it.
  - Do not recast unrelated work, coursework, volunteering, or soft skills as evidence for the
    target role.
  - For unrelated experience, improve its real clarity, ownership, grammar, or outcomes instead of
    forcing role-specific language onto it.
  - Suggest metrics or stronger action verbs only when the existing unit is materially vague.

  Output:
  - Each suggestion MUST include a unique kebab-case `id` and exactly one `unit_id` from
    `units_json`.
  - Only create a unit-level suggestion when the advice applies directly to that unit's existing
    text.
  - Put the recommendation and rationale directly inside `suggestion`.
  - Include `replacement_text` only when rewriting the same facts from the original unit.
  - Set `replacement_text` to `null` for missing evidence or advice that needs new facts.
  - Do not use placeholders like `[tool]`, `[metric]`, or `[specific example]` in
    `replacement_text`.
  - Keep non-null `replacement_text` close in length to the original text unless shortening it.

  application_name: {application_name}
  listing_title: {listing_title}
  listing_description:
  {listing_description}
  listing_skills:
  {listing_skills}
  listing_keywords:
  {listing_keywords}
  listing_requirements:
  {listing_requirements}

  units_json:
  {units_json}
  """
).strip()
