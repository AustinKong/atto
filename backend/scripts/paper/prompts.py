from textwrap import dedent

LISTING_TARGETS_PROMPT = dedent(
  """
  Generate exactly {count} company/title pairs for realistic Atto Paper Mode job
  application demo records.

  Requirements:
  - Use real, recognizable company names.
  - Every company/title pair must be unique.
  - Prefer using each company at most once.
  - Vary seniority and role family across frontend, backend, full-stack, data, platform, AI,
    infrastructure, security, product engineering, and developer tools.
  - Include realistic roles for the named company.
  - Include roles across the US, Europe, and Singapore indirectly through company mix, but do
    not include locations in this response.
  - Do not include domains, descriptions, research, dates, salaries, or listing URLs.

  Return only structured data matching the provided schema.
  """
).strip()

LISTING_PROMPT = dedent(
  """
  Generate one realistic job application demo record for Atto Paper Mode.

  Use exactly this company and role:
  - Company: {company}
  - Role: {title}

  This is item {listing_number} in the planned dataset.

  Requirements:
  - Do not change the company or role.
  - domain must be the actual company website domain only, such as stripe.com, github.com,
    nvidia.com, or aws.amazon.com. Do not use industry categories, job board domains,
    source domains, URLs, protocols, paths, or text like "Cloud Communications".
  - Use realistic locations across the US, Europe, and Singapore.
  - Write original synthetic content only. Do not copy real job descriptions or real quotes.
  - Research source URLs and titles may point to real sites, but prefer durable pages that are
    likely to exist: company engineering blog homepages, company newsrooms, investor pages,
    careers pages, official product blogs, Levels.fyi company pages, Crunchbase profiles, or
    broad reputable news/category pages. Avoid invented deep article URLs.
  - Research source content should be synthetic, specific, and source-like. Mention concrete
    signals such as product launches, AI/platform investments, infrastructure scale, developer
    ecosystem, hiring momentum, compensation bands, or market risk.
  - marketSummary should be 3 to 4 sentences and read like the "Recent News & Market Position"
    section of a research tab. Include the company's market position, a recent business/product
    signal, why this role matters now, and one risk or watch item.
  - researchNotes should be written as the candidate's saved notes for this listing. Use
    3 concise plain-text bullet lines covering why the role is interesting, what to tailor in
    the resume/interview story, and one follow-up question or concern.
  - timelineNotes should read like a real candidate's private application tracker notes, not
    generated status labels. Write every status field even though only some statuses will be
    used. Each note should be 1 to 2 concrete sentences about what happened, what was discussed,
    what was changed in the resume, who followed up, what feedback was received, or why the
    candidate deprioritized the role. Make the notes specific to the company, role, research
    notes, and required skills. Avoid formulaic phrases like "lines up with resume strengths",
    "tailored application", and "maps to the requirements".
  - Keep descriptions concise, specific, and useful in a product demo.
  - Skills, requirements, keywords, and applicant insights should be varied.
  - Avoid repetitive generic phrases like "leader in the market", "scalable systems", and
    "collaborate with cross-functional teams" unless they are made specific to the company.
  - Use exact brand and technology casing such as TypeScript, GitHub, NVIDIA, AWS, Kubernetes.
  - Make this response distinct from the other planned listings so the final demo does not feel
    copied across companies.
  - Do not include dates, IDs, status history, salaries, or listing URLs.

  Return only structured data matching the provided schema.
  """
).strip()
