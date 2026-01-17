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


COMPANY_INSIGHTS_PROMPT = """You are a research assistant helping a job applicant understand a company.

Based on the provided information, write a concise one-paragraph insight about this company.

Company: {company}

Information from company pages:
{page_contents}

Write a single paragraph (3-5 sentences) that summarizes:
- What the company does (their main business/products/services)
- Their mission or focus area
- Any notable aspects about their culture, values, or market position

Keep it factual, concise, and helpful for someone considering applying to work there.
Do not use phrases like "Based on the information" or "According to". Write directly and naturally.
Do not use bullet points. Do not use markdown formatting. Simply return the paragraph.
If there is insufficient information, state "No insights could be generated about this company at this time."
"""
