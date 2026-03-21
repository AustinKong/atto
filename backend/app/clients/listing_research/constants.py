from __future__ import annotations

from textwrap import dedent

SENTIMENT_MAX_RESULTS = 4
SALARY_MAX_RESULTS = 3
MARKET_MAX_RESULTS = 3

# Search query templates
SENTIMENT_SEARCH_QUERY = (
  '{company} employee reviews company culture sentiment outlook reddit glassdoor blind'
)
SALARY_SEARCH_QUERY = (
  '{title} salary at {company} {location} levels.fyi glassdoor indeed compensation'
)
MARKET_SEARCH_QUERY_1 = '{company} business performance recent news 2025'
MARKET_SEARCH_QUERY_2 = '{title} job market demand industry trends'

SENTIMENT_PROMPT_TEMPLATE = dedent(
  """
  You are an AI analyst that reads employee feedback to assess company sentiment.
  Listing context:
  {listing_json}

  External research excerpts:
  {research_context}

  Requirements:
  - Return JSON that conforms to the SentimentAnalysisResult schema exactly.
  - value must be a float between 0.0 and 1.0 (inclusive) describing optimism.
  - sources must reference the specific URL and include short quotations that justify the score.
  - If research_context is empty, rely on the listing context and explicitly note the limitation.
  """
).strip()


SALARY_PROMPT_TEMPLATE = dedent(
  """
  You are a compensation analyst. Estimate salary ranges for the listing using hard data.
  Listing context:
  {listing_json}

  Salary research excerpts:
  {research_context}

  Requirements:
  - Produce JSON that matches the SalaryRangeResult schema exactly.
  - Provide integer values for min, q1, median, q3, and max in the same currency.
  - Infer currency from context; default to USD if uncertain and explain why in the reasoning notes.
  - If few sources appear, document the assumptions but still produce a plausible numeric range.
  """
).strip()


MARKET_PROMPT_TEMPLATE = dedent(
  """
  You synthesize market news and hiring trends for an applicant.
  Listing context:
  {listing_json}

  Market research excerpts:
  {research_context}

  Requirement: Return a single paragraph that summarizes the market context,
  touching on the employer's momentum, job demand for the role, and notable macro factors.
  """
).strip()


APPLICANT_INSIGHTS_PROMPT_TEMPLATE = dedent(
  """
  Act as a senior career coach. Use the listing, sentiment, salary, and market findings to
  advise an applicant.
  Listing context:
  {listing_json}

  Sentiment analysis:
  {sentiment_json}

  Salary analysis:
  {salary_json}

  Market context summary:
  {market_summary}

  Listing description:
  {listing_description}

  Listing requirements:
  {listing_requirements}

  Requirements:
  - Output a JSON object matching ApplicantInsightsResult (insights: list[str]).
  - Each insight should be a concise bullet (<=2 sentences) with a clear action or talking point.
  - Tie insights back to the research (sentiment, salary, market) whenever possible.
  - Include at least one insight about tailoring the resume or cover letter and another about
    interview prep.
  """
).strip()
