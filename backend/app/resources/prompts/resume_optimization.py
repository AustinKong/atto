"""
Prompt templates for optimizing individual resume sections using LLM.
One prompt per section type so the LLM only needs to handle one shape at a time.
"""

LISTING_CONTEXT = """
### THE TARGET (JOB LISTING)
Role: {listing_title}
Requirements:
{listing_requirements}
Keywords: {listing_skills}

### OPTIMIZATION RULES

1. **SKILL MAPPING & KEYWORD OPTIMIZATION**
   - Identify the top 3 technical requirements from the listing
   - Ensure they appear in the first 3 bullets of the Experience section
     by highlighting relevant projects
   - Aggressively weave in relevant keywords and skills from the listing
     into the resume bullets where they match the candidate's experience
   - Prioritize keyword density while maintaining authenticity
   - Weave keywords naturally where they fit the candidate's actual
     experience
   - Never hallucinate skills, tools, or technologies not in the source
   - Focus on rephrasing existing accomplishments to surface relevant
     keywords

2. **BREVITY AND IMPACT**
   - Do not increase the word count of a bullet point by more than 10%
   - Use the "Action + Problem + Result" (APR) format:
     [Action] → [Problem Solved] → [Result/Metric]
   - Avoid fluff phrases like "demonstrating strong performance" or
     "strong experience"
   - Let metrics and concrete outcomes speak for themselves
   - Remove redundancy and unnecessary adjectives

3. **BONUS/PLUS SKILLS (Finding Closest Matches)**
   - If the candidate lacks a specific required skill, find the most
     similar skill they possess
   - Add a phrase about "cross-language proficiency," "framework-agnostic
     expertise," or "rapid adoption of new [domain] frameworks"
   - Example: If lacking Go but have Java/Python, mention "polyglot
     backend development"
   - Only suggest this if there is genuine evidence of transferable skills
     in the resume

### STRICT GROUNDING RULES
- **NO HALLUCINATIONS:** Do NOT add any hard skills, tools, languages, or
  technologies that are not already present in the source content
- **EVIDENCE-BASED REWRITING:** Every claim must be supportable by the
  original text. Rephrasing and strengthening tone is fine; inventing
  specifics is not
- **PRESERVE STRUCTURE:** Preserve the item's `title` and `subtitle`
  exactly (do not change them)
""".strip()

OPTIMIZE_DETAILED_ITEM_PROMPT = """
You are an expert Resume Editor optimizing a single resume item.

{listing_context}

### THE SOURCE (RESUME ITEM)
Title: {item_title}
Subtitle: {item_subtitle}
Bullets:
{item_bullets}

### TASK
Rewrite the bullet points to surface relevant keywords from the listing and use stronger action
verbs. Preserve the item's `title` and `subtitle` exactly—only rewrite the bullets.
""".strip()

OPTIMIZE_PARAGRAPH_SECTION_PROMPT = """
You are an expert Resume Editor optimizing a single resume section.

{listing_context}

### THE SOURCE (RESUME SECTION — PARAGRAPH)
Section id: {section_id}
Section title: {section_title}
Content: {content}

### TASK
Rewrite the paragraph to better highlight alignment with the target role. Improve keyword usage
and impact while keeping the same core message.
""".strip()

OPTIMIZE_SIMPLE_SECTION_PROMPT = """
You are an expert Resume Editor optimizing a single resume section.

{listing_context}

### THE SOURCE (RESUME SECTION — SIMPLE LIST)
Section id: {section_id}
Section title: {section_title}
Items:
{items}

### TASK
Reorder the items so the most relevant ones (relative to the listing) appear first. You may NOT
add items that were not in the original list.
""".strip()
