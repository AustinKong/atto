from textwrap import dedent

LISTING_EXTRACTION_PROMPT = dedent(
  """
  Extract a job listing into structured data for a job application tracker.

  ### CONTEXT
  Today's Date: {current_date}

  ### VALIDATION
  First decide whether the content is a complete job listing.
  If the content is mostly:
  - A Login / Sign-in page (e.g. Workday, LinkedIn auth)
  - A "Bot Detected" or "Access Denied" error
  - An application form, resume upload form, or applicant information page
  - A generic company homepage without a specific role
  - Empty or garbled text

  THEN:
  1. Set the `error` field to a short reason (e.g., "Page requires login", "Not a job listing").
  2. Leave ALL other fields (title, company, skills, etc.) empty/null.

  ### EXTRACTION RULES
  If the page is valid, leave `error` as null and extract:
  1. **title**: Extract the specific job role.
     - CLEAN IT: Remove prefixes like "Job Listing for", "We are hiring a",
       "Vacancy:", or company names.
     - Preserve meaningful seniority, product, team, function, and specialization qualifiers.
     - Bad: "Job Listing for SDK Client Engineer Intern"
     - Good: "SDK Client Engineer Intern"
     - Bad: "Manager" when the listing title is "Store Manager, Luxury Retail"
     - Good: "Store Manager, Luxury Retail"

  2. **skills**: Candidate-profile signals that a person could highlight in an application:
     named tools, software, languages, methods, platforms, domain practices, certifications,
     licenses, equipment, and specialized techniques - nouns only.
     - Good: ["Python", "Excel", "Salesforce", "Inventory management", "Customer support"]
     - Good: ["Nursing license", "Financial modeling", "Food safety", "Forklift operation"]
     - Include industry-specific tools and practices when present.
     - Include concrete technical methods such as "RPC", "Machine Learning", "CI/CD", or
       "REST APIs" only when they are candidate-profile signals in the listing.
     - Do not force responsibilities into skills unless the listing clearly presents them as skills.
     - Aim for 8-15 skills when the listing contains that many.
     - Bad: ["Computer Science", "Algorithms", "Communication", "Teamwork"]
       That is too generic to be actionable.
     - Bad: ["3 years of Python experience"] - that is a requirement sentence, not a skill.

  3. **requirements**: 5-10 concise full sentences describing candidate qualifications,
     responsibilities, constraints, and role-specific expectations.
     - Include must-have qualifications, preferred qualifications, commitment/location constraints,
       and the most important responsibilities.
     - Do not include generic company boilerplate, equal-opportunity text, benefits, application
       instructions, or marketing copy.
     - Each entry must be a complete sentence, not a bare noun or short phrase.
     - Good: "Proficiency in Python with 2+ years of backend development experience."
     - Good: "Experience managing daily store operations and coaching retail associates."
     - Good: "Ability to work rotating weekend shifts in an on-site customer-facing role."
     - Bad: "Python" - that is a skill, not a requirement.
     - Crucial: Convert "Nice to have" / "Preferred" items into positive statements.
     - Crucial: Include educational requirements and language proficiency if mentioned.

  4. **location**: Extract the city and country.
     - Format: "City, Country" (e.g., "Singapore, Singapore" or "New York, USA").
     - If no location information can be found in the listing, set to null.

  5. **company**: Extract the company name.
     - Ensure it is the hiring company, not the recruitment agency (if applicable).

  6. **domain**: Based on the company name and context,
     predict the company's official website domain (e.g., 'stripe.com', 'linear.app').
     If you are unsure, make your best guess based on the company name.
     Do not include 'https://' or 'www'.

  7. **description**: Extract a concise, role-specific summary of what the person will do.
     - Keep it to 2-3 sentences.
     - Prioritize concrete work from the role sections: team or department, product/service area,
       users/customers served, core duties, ownership, and business context.
     - Mention the actual responsibilities when present, such as building features, managing
       operations, supporting customers, designing processes, selling to accounts, analyzing data,
       leading projects, improving reliability, or working with specific tools/systems.
     - Do not merely paraphrase broad company boilerplate, mission statements, or generic "About
       us" text when the listing contains role-specific duties.
     - Ignore apply buttons, job-board chrome, premium upsells, legal boilerplate, and company
       boilerplate unless it explains the role.
     - Bad: "The company builds products used by many customers and is looking for a candidate."
     - Good: "This role owns growth features for Acme Pay across mobile, web, and back-end
       systems, including RPC integrations and UI components. The engineer will support growth
       experiments by designing services, data pipelines, monitoring, and performance tracking."

  8. **posted_date**: Extract or infer the date the job was posted.
     - Format: "YYYY-MM-DD".
     - Use "Today's Date" ({current_date}) to calculate relative dates.
     - Examples:
       - "Posted 2 weeks ago" -> Calculate 14 days prior to {current_date}.
       - "Posted yesterday" -> Calculate 1 day prior to {current_date}.
       - "30+ days ago" -> Estimate 30 days prior to {current_date}.
     - If the listing provides a specific date (e.g., "Oct 12"), use the current year.
     - If no date information is found or you are unsure, set to null.

  9. **salary**: Extract the advertised salary if explicitly stated in the listing.
      - If a range is given (e.g., "$80,000 - $100,000"), use the midpoint as
        the value (e.g., 90000).
      - Set `currency` to the 3-letter ISO code (e.g., "USD", "SGD"). Default to "USD" if unclear.
      - Set `value` as an integer (no decimals, no symbols).
      - If no salary information is present, set to null.

  10. **keywords**: Extract exactly 10 short words or phrases (1-3 words)
      that a candidate should prioritize.
      - Keywords are source-backed role-relevant terms that help the candidate see what the
        listing emphasizes.
      - Prefer terms that appear repeatedly in the listing after ignoring stopwords, section labels,
        job-board metadata, company names, and locations.
      - Prioritize tools, role domains, product/service area, industry-specific practices, and
        distinctive responsibilities.
      - Use the listing's own wording where possible.
      - Good: ["Python", "Growth", "Inventory management", "Patient care"]
      - Good: ["Financial modeling", "Customer support", "Food safety", "B2B sales"]
      - Good: ["Mobile", "Web", "Back-end", "Development"]
      - Bad: full sentences - keywords must be words or short phrases, not sentences.
      - Bad: polished filler phrases like "Technical execution" if simpler repeated terms capture
        the emphasis.
      - Bad: generic sections or metadata like "About the job", "Apply", "Full-time",
        "Singapore", or the company name.

  ### INPUT JOB LISTING
  {content}
  """
).strip()
