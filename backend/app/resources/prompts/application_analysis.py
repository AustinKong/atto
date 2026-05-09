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
