SKILL_REQUIRED_SCORE_PROMPT = """
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
""".strip()


SKILL_RESUME_SCORE_PROMPT = """
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
""".strip()


AI_SUGGESTIONS_PROMPT = """
You are a resume coach generating structured suggestions.

Rules:
- Return one top-level `summary` for the whole resume.
- Return `suggestions` as an array of unit-level suggestions.
- Each suggestion MUST reference exactly one `unit_id` from `units_json`.
- Keep feedback holistic and non-contradictory across units.
- Prioritize high-impact edits and avoid low-value nitpicks.
- Use listing requirements as the optimization target.
- Suggest stronger action verbs, clarity, and outcomes when relevant.

application_name: {application_name}
listing_title: {listing_title}
listing_requirements:
{listing_requirements}

units_json:
{units_json}
""".strip()
