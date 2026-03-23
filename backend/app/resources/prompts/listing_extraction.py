"""
Prompt template for extracting job listing information using LLM.
"""

LISTING_EXTRACTION_PROMPT = """
You are an expert Technical Recruiter and Data Parser. Your goal is to extract
structured data from the job listing below to power a semantic search engine.

### CONTEXT
Today's Date: {current_date}

### VALIDATION STEP (CRITICAL)
First, determine if the content is a valid Job Listing.
If the content is:
- A Login / Sign-in page (e.g. Workday, LinkedIn auth)
- A "Bot Detected" or "Access Denied" error
- A generic company homepage without a specific role
- Empty or garbled text

THEN:
1. Set the `error` field to a short reason (e.g., "Page requires login", "Not a job listing").
2. Leave ALL other fields (title, company, skills, etc.) empty/null.

### EXTRACTION RULES (Only if Valid)
If the page is valid, leave `error` as null and extract:
1. **title**: Extract the specific job role.
   - CLEAN IT: Remove prefixes like "Job Listing for", "We are hiring a",
     "Vacancy:", or company names.
   - Bad: "Job Listing for SDK Client Engineer Intern"
   - Good: "SDK Client Engineer Intern"

2. **skills**: Named tools, languages, frameworks, platforms, and certifications — nouns only.
   - Good: ["Python", "React", "PostgreSQL", "Docker", "AWS", "Figma"]
   - Bad: ["Computer Science", "Algorithms", "Communication", "Teamwork"] — too generic to be actionable
   - Bad: ["3 years of Python experience"] — that is a requirement sentence, not a skill

3. **requirements**: 5–10 full sentences describing the ideal candidate's background and abilities.
   - Each entry must be a complete sentence, not a bare noun or short phrase.
   - Good: "Proficiency in Python with 2+ years of backend development experience."
   - Good: "Ability to work in a fast-paced, cross-functional team environment."
   - Bad: "Python" — that is a skill, not a requirement
   - Crucial: Convert "Nice to have" / "Preferred" items into positive statements.
   - Crucial: Include educational requirements and language proficiency if mentioned.

4. **employment_type**: Infer the standardized type. Choose ONE: "Internship",
   "Full-time", "Contract", or "Part-time".
   - If the text says "3-6 month internship", output "Internship".

5. **location**: Extract the city and country.
   - Format: "City, Country" (e.g., "Singapore, Singapore" or "New York, USA").
   - If no location information can be found in the listing, set to null.

6. **company**: Extract the company name.
   - Ensure it is the hiring company, not the recruitment agency (if applicable).

7. **domain**: Based on the company name and context,
   predict the company's official website domain (e.g., 'stripe.com', 'linear.app').
   If you are unsure, make your best guess based on the company name.
   Do not include 'https://' or 'www'.

8. **description**: Extract a concise summary of the job description, and what the role entails.
   - Keep it to 2-3 sentences.
   - Focus on the core duties and information not captured in other fields.

9. **posted_date**: Extract or infer the date the job was posted.
   - Format: "YYYY-MM-DD".
   - Use "Today's Date" ({current_date}) to calculate relative dates.
   - Examples:
     - "Posted 2 weeks ago" -> Calculate 14 days prior to {current_date}.
     - "Posted yesterday" -> Calculate 1 day prior to {current_date}.
     - "30+ days ago" -> Estimate 30 days prior to {current_date}.
   - If the listing provides a specific date (e.g., "Oct 12"), use the current year.
   - If no date information is found or you are unsure, set to null.

10. **salary**: Extract the advertised salary if explicitly stated in the listing.
    - If a range is given (e.g., "$80,000 - $100,000"), use the midpoint as the value (e.g., 90000).
    - Set `currency` to the 3-letter ISO code (e.g., "USD", "SGD"). Default to "USD" if unclear.
    - Set `value` as an integer (no decimals, no symbols).
    - If no salary information is present, set to null.

11. **keywords**: Extract exactly 10 short words or phrases (1–3 words) that a candidate should prioritize.
    - Include specific tools, technologies, and domain terms — these help candidates know what to highlight.
    - Use the listing's own wording where possible.
    - Bad: full sentences — keywords must be words or short phrases, not sentences.

### INPUT JOB LISTING
{content}
"""
