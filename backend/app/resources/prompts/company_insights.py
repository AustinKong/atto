"""
Prompts for generating company insights from research.
"""

LINK_SELECTION_PROMPT = """You are helping to research a company by identifying the most relevant pages to read.

You are given a list of links from the company's website. Your task is to select the top 3 most relevant links that would help understand:
- What the company does
- Their mission and values
- Their products or services
- Company culture and background

Company: {company}

Available links:
{links}

Select the top 3 most relevant links. Prioritize links like "About", "About Us", "Our Story", "What We Do", "Mission", "Company", etc.
Avoid links to careers, job postings, legal pages, contact forms, login pages, or external sites.
"""


COMPANY_INSIGHTS_PROMPT = """You are a research assistant helping a job applicant understand a company's current outlook and position.

Synthesize the following information sources about a company to create a comprehensive insight about its market position, recent developments, and public sentiment. This will help a job applicant understand the company's current state and trajectory.

Company: {company}

COMPANY BACKGROUND AND MISSION (from official website):
{company_info}

RECENT NEWS AND MARKET DEVELOPMENTS:
{news_and_trends}

PUBLIC SENTIMENT AND EMPLOYEE PERSPECTIVES:
{sentiment_and_reviews}

Based on all the above information, write a comprehensive 2-3 paragraph insight that covers:

1. MARKET POSITION & RECENT DEVELOPMENTS: What is the company's current position in their industry? What recent news or trends affect them?
2. COMPANY OUTLOOK: What is the trajectory? Are they growing, pivoting, facing challenges, or expanding?
3. CULTURE & SENTIMENT: What is the public and employee sentiment about the company? What stands out about their workplace?
4. RELEVANCE TO JOB APPLICANTS: What should a prospective employee know about the company's current state and direction?

Guidelines:
- Write naturally without preamble phrases like "Based on the information" or "According to"
- Use specific details and evidence from the sources provided
- Be balanced - mention both strengths and challenges if present
- Focus on information relevant to job applicants considering the company
- Keep it concise but informative (2-3 well-developed paragraphs)
- Do not use bullet points or markdown formatting
- If there is insufficient information for a comprehensive insight, state "No comprehensive insights could be generated about this company at this time."
"""
