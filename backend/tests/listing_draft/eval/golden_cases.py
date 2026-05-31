from dataclasses import dataclass
from enum import StrEnum

from pydantic import HttpUrl


class GoldenCaseId(StrEnum):
  CLEAN_MARKDOWN_LISTING = 'clean_markdown_listing'
  MESSY_PASTED_PAGE = 'messy_pasted_page'
  INTERNSHIP_JUNIOR = 'internship_junior'
  SALARY_RANGE = 'salary_range'
  INVALID_PAGE = 'invalid_page'


@dataclass(frozen=True)
class GoldenCase:
  purpose: str
  url: HttpUrl
  content: str


# Clean markdown produced by crawler
CLEAN_MARKDOWN_LISTING_CONTENT = """
# Software Engineer, Acme Pay, Growth

**Company:** Acme Corp
**Location:** Singapore

Acme Corp will prioritize applicants who have a current right to work in Singapore and do not
require company sponsorship for a visa.

## Minimum qualifications

- Bachelor's degree or equivalent practical experience.
- 2 years of experience with software programming in C++, Java, Python, or Go.
- Experience in software development.

## Preferred qualifications

- Master's degree or PhD in Computer Science or a related technical field.
- Experience with mobile apps, web, full-stack, or back-end development.
- Experience building systems that scale to users globally.
- Experience working with Product Management and User Experience (UX) to drive end-to-end features.

## About the job

Acme Pay serves over 250 million users across Asia. Our Singapore-based team owns reliability and
growth for critical consumer app surfaces, driving engagement and multi-million dollar revenue
streams.

You will lead technical execution for growth initiatives that scale the user base. You will own the
full feature lifecycle, from designing scalable Remote Procedure Call (RPC) interfaces and
high-performance User Interface (UI) components to optimizing system health through data-driven
insights.

## Responsibilities

- Design and deploy features across Acme Pay's mobile, web, and back-end ecosystems, focusing on
  Remote Procedure Call (RPC) integration and UI excellence.
- Lead technical designs for back-end services and data processing pipelines that support growth
  experiments.
- Ensure feature reliability by building monitoring, alerting, and automated performance tracking.
- Contribute to engineering excellence by participating in design reviews, improving code quality,
  and contributing to technical discussions within the team.
""".strip()


# Plain copied webpage text, not markdown. Keep UI chrome, prompts, upsells, and company boilerplate
# so a later eval can check whether extraction ignores noisy paste artifacts.
MESSY_PASTED_PAGE_CONTENT = """
Company logo for, Acme Corp.
Acme Corp


Software Engineer, Acme Pay, Growth

Singapore - Reposted 2 weeks ago - Over 100 people clicked apply

Promoted by hirer - Responses managed off JobBoard

On-site
Full-time
Apply

Saved
Did you finish applying?

You'll find this job under In progress in your job tracker until you confirm.

Yes

No
Your profile and resume match the required qualifications well

Show match details

BETA - Is this information helpful?

People you can reach out to

School alumni from Acme University

Show all
About the job
Acme Corp will prioritize applicants who have a current right to work in Singapore and do not
require Acme Corp sponsorship for a visa.

Minimum qualifications:

Bachelor's degree or equivalent practical experience.
2 years of experience with software programming in C++, Java, Python, or Go.
Experience in software development.

Preferred qualifications:

Master's degree or PhD in Computer Science or a related technical field.
Experience with mobile apps, web, full-stack, or back-end development.
Experience building systems that scale to users globally.
Experience working with Product Management/User Experience (UX) to drive end-to-end features.

About The Job

Acme Corp software engineers develop next-generation technologies that help billions of users
connect, explore, and interact with information. Our products handle information at massive scale
and extend beyond search.

Acme Pay serves over 250M users in Asia. Our Singapore-based team owns reliability and growth for
critical user surfaces, driving engagement and multi-million dollar revenue streams.

Join us to make a direct, large-scale impact. You will take full ownership of key product areas,
building the next generation of features to scale our massive user base even further.

You will lead the technical execution of growth initiatives to scale our user base. You will own
the full feature lifecycle, from designing scalable Remote Procedure Call (RPC) interfaces and
high-performance User Interface (UI) components to optimizing system health through data-driven
insights.

Responsibilities

Design and deploy features across Acme Pay's mobile, web, and back-end ecosystems, focusing on
Remote Procedure Call (RPC) integration and UI excellence.
Lead technical designs for back-end services and data processing pipelines that support growth
experiments.
Ensure feature reliability by building monitoring, alerting, and automated performance tracking.
Contribute to engineering excellence by participating in design reviews, improving code quality,
and contributing to technical discussions within the team.

Acme Corp is proud to be an equal opportunity workplace. We consider qualified applicants
regardless of background, consistent with legal requirements.

Job search faster with Premium

Access company insights like strategic priorities, headcount trends, and more

Alex and millions of other members use Premium

Try Premium for SGD 0
1-month free trial. Cancel with ease. We'll remind you 7 days before your trial ends.

About the company

Acme Corp

41,732,941 followers

Following
Software Development

10001+ employees

179,315 on JobBoard

Acme teams build products that create opportunities for everyone. Bring your insight,
imagination, and a healthy disregard for the impossible.
""".strip()


# Clean crawl-like markdown for a junior/internship role. This case stresses different semantics
# from the senior/full-time listing: student eligibility, internship windows, Kubernetes infra,
# observability, and preferred-but-not-required hands-on project experience.
INTERNSHIP_JUNIOR_CONTENT = """
# Backend Software Engineer Intern, Foundational Technology - 2026 Start

**Company:** Acme Corp
**Location:** Singapore

## About the team

The Foundational Technology team builds Acme Corp's cloud-native infrastructure, which powers all
of the company's products. The team works on Kubernetes cluster management, runtime resource
optimization, multi-cloud and multi-cluster systems, and cloud-native infrastructure stability.

The team also contributes to open-source infrastructure projects and researches core technologies
around resource pooling, elasticity, and large-scale cluster performance.

## Internship details

We are looking for students to join us for an internship in 2026. The internship is designed to
offer industry exposure and hands-on engineering experience.

Candidates can apply to a maximum of two positions and will be considered for roles in the order
they apply. Applications will be reviewed on a rolling basis, so early applications are encouraged.

Successful candidates must be able to commit to at least a 3-month internship period.

Successful candidates must be able to commit to one of the following internship windows:

- January to June, onboarding by 12 January 2026.
- May to August, onboarding by 11 May 2026.

## Key responsibilities

- Build and optimize large-scale Kubernetes clusters.
- Design and evolve system architectures for ultra-large-scale Kubernetes clusters.
- Improve the performance and stability of control systems in big data and machine learning
  scenarios.
- Define and enhance Kubernetes Service Level Objectives (SLOs).
- Analyze end-to-end latency, identify performance bottlenecks, propose solutions, and implement
  them in production environments.
- Build and enhance observability systems to improve issue diagnosis efficiency.
- Create observability data warehouses and use data-driven approaches to optimize cluster
  performance.

## Minimum qualifications

- Currently pursuing an undergraduate or postgraduate degree in Software Development, Computer
  Science, Computer Engineering, or a related technical discipline.

## Preferred qualifications

- Experience developing or contributing to cloud-native open-source projects.
- Hands-on project experience with containerized applications through internships, coursework, or
  personal projects.
- Familiarity with observability tools and frameworks such as Prometheus, Grafana, or distributed
  tracing systems.
- Knowledge of big data or machine learning workflows in a Kubernetes environment.

## About Acme Corp

Acme Corp builds products that help people create, connect, and work at global scale. We value
curiosity, humility, and practical impact, and we aim to create an inclusive workplace for people
with different skills, experiences, and perspectives.
""".strip()


# Clean crawl-like markdown for an advertised compensation case. This keeps the role broadly
# technical while making the salary range explicit so evals can check midpoint and currency.
SALARY_RANGE_CONTENT = """
# Senior Backend Engineer, Marketplace Platform

**Company:** Acme Corp
**Location:** New York, USA
**Compensation:** USD 160,000 - USD 190,000 base salary per year

## About the role

Acme Corp is hiring a Senior Backend Engineer for the Marketplace Platform team. This team builds
the services that power search, checkout, pricing, and seller operations for a global commerce
product.

You will design Python and Go services, build REST APIs, maintain PostgreSQL-backed workflows, and
improve reliability for high-throughput event processing systems. You will partner with product,
data, and infrastructure teams to ship platform capabilities used by millions of customers.

## Responsibilities

- Design and maintain backend services for marketplace search, checkout, and pricing workflows.
- Build REST APIs and asynchronous event processing pipelines for seller and buyer experiences.
- Improve PostgreSQL query performance, data model reliability, and transactional correctness.
- Own production health through metrics, dashboards, alerting, incident response, and runbooks.
- Review technical designs and mentor engineers on backend architecture and operational quality.

## Minimum qualifications

- 5 years of professional backend software engineering experience.
- Experience building production services in Python, Go, Java, or a similar language.
- Experience designing APIs, data models, and PostgreSQL-backed systems.
- Experience operating cloud services on AWS, Google Cloud, or Azure.
- Ability to debug production incidents and improve system reliability.

## Preferred qualifications

- Experience with Kafka, distributed systems, or high-throughput event processing.
- Experience with Kubernetes, Docker, Terraform, or infrastructure-as-code workflows.
- Experience mentoring engineers or leading technical design reviews.

## Compensation and benefits

The annual base salary range for this role is USD 160,000 to USD 190,000. Actual compensation may
vary based on skills, experience, and location. This role is also eligible for equity, health
benefits, paid time off, and a learning budget.
""".strip()


INVALID_APPLICATION_FORM_CONTENT = """
# You are applying for Software Engineer (R0327093)

**Company:** Acme Corp
**Language selected:** English
**Country:** Global

Sign up

## Application progress

- My information
- Application questions
- Voluntary Disclosures
- Review

Previous
Next

## Upload options

Make completing your job application easier by uploading your resume or CV.

Upload either DOC, DOCX, PDF, or TXT file types, 5MB max.

Please note, the fields will be directly updated with the information present in your CV once it
has been uploaded.

or

## My Information

How did you hear about us?
Please Select

Country
Singapore

Prefix
Please Select

Full Name

Given Name(s) - Western Script

Family Name - Western Script

I have a preferred name
No

Street name

City

Postal Code

Email address

Phone Device Type
Please Select

Country Phone Code
Singapore (+65)

Phone number

We will process your personal data according to our Privacy Notice. Please read it and understand
your data protection rights.

I have read the Privacy Notice.

Please Select

By checking this box, I consent to receive transactional and marketing text messages regarding
employment opportunities.

By checking this box, I consent to receive transactional and marketing email messages regarding
employment opportunities.

How would you rate your experience popup
""".strip()


GOLDEN_CASES: dict[GoldenCaseId, GoldenCase] = {
  GoldenCaseId.CLEAN_MARKDOWN_LISTING: GoldenCase(
    purpose='Clean crawl-like markdown listing with broad technical qualifications.',
    url=HttpUrl('https://acme.example/careers/software-engineer-acme-pay-growth'),
    content=CLEAN_MARKDOWN_LISTING_CONTENT,
  ),
  GoldenCaseId.MESSY_PASTED_PAGE: GoldenCase(
    purpose='Noisy pasted page text with UI chrome and company boilerplate.',
    url=HttpUrl('https://acme.example/careers/software-engineer-acme-pay-growth'),
    content=MESSY_PASTED_PAGE_CONTENT,
  ),
  GoldenCaseId.INTERNSHIP_JUNIOR: GoldenCase(
    purpose='Clean internship listing with student eligibility and infra responsibilities.',
    url=HttpUrl('https://acme.example/careers/backend-software-engineer-intern-2026'),
    content=INTERNSHIP_JUNIOR_CONTENT,
  ),
  GoldenCaseId.SALARY_RANGE: GoldenCase(
    purpose='Clean listing with explicit advertised salary range and currency.',
    url=HttpUrl('https://acme.example/careers/senior-backend-engineer-marketplace'),
    content=SALARY_RANGE_CONTENT,
  ),
  GoldenCaseId.INVALID_PAGE: GoldenCase(
    purpose='Application form page that names a role but does not contain a job listing.',
    url=HttpUrl('https://acme.example/careers/software-engineer-r0327093/apply'),
    content=INVALID_APPLICATION_FORM_CONTENT,
  ),
}
