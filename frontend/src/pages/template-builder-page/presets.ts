import type { Profile } from '@/types/profile';
import type { Section } from '@/types/resume';
import { ISOYearMonth } from '@/utils/date';

interface EdgeCasePreset {
  name: string;
  profile: Profile;
  sections: Section[];
}

export const EDGE_CASE_PRESETS: Record<string, EdgeCasePreset> = {
  minimalDataStates: {
    name: 'Minimal Data States',
    profile: {
      fullName: 'John Doe',
      email: '',
      phone: '',
      location: '',
      website: '',
      baseSections: [],
    },
    sections: [
      {
        id: 'min-1',
        type: 'simple',
        title: 'Empty Simple Section',
        content: [],
      },
      {
        id: 'min-2',
        type: 'detailed',
        title: 'Empty Detailed Section',
        content: [
          {
            title: 'Job Title Only',
            subtitle: '',
            startDate: null,
            endDate: null,
            bullets: [],
          },
        ],
      },
    ],
  },

  textOverflowAndFormatting: {
    name: 'Text Overflow and Formatting',
    profile: {
      fullName: 'Maximus-Very-Long-Name-With-Hyphens-To-Test-Wrapping',
      email: 'this-is-an-unreasonably-long-email-address-for-testing@example.com',
      phone: '+1 (555) 555-5555',
      location: 'City, State, Country, Planet Earth',
      website: 'https://extremely-long-website-url-that-should-probably-wrap.com/subpath/testing',
      baseSections: [],
    },
    sections: [
      {
        id: 'flow-1',
        type: 'paragraph',
        title: 'Text Flow Test',
        content:
          'This is a long paragraph.\n\nIt has double newlines to test spacing.\nIt also has a single newline.\nFinally, we include a very long word: Donaudampfschifffahrtselektrizitätenhauptbetriebswerkbauunterbeamtengesellschaft.',
      },
      {
        id: 'flow-2',
        type: 'detailed',
        title: 'Flexbox Collision',
        content: [
          {
            title: 'Lead Software Engineer and Architectural Design Consultant for Cloud Systems',
            subtitle: 'Global Consolidated Industries and Technologies Corporation',
            startDate: ISOYearMonth.parse('2020-01'),
            endDate: 'present',
            bullets: ['Unbroken_string_test_01234567890123456789012345678901234567890123456789'],
          },
        ],
      },
    ],
  },

  dateRangeConditions: {
    name: 'Date Range Conditions',
    profile: {
      fullName: 'Date Tester',
      email: 'test@example.com',
      phone: '',
      location: '',
      website: '',
      baseSections: [],
    },
    sections: [
      {
        id: 'date-1',
        type: 'detailed',
        title: 'Date Logic',
        content: [
          {
            title: 'Standard Present',
            subtitle: '',
            startDate: ISOYearMonth.parse('2022-01'),
            endDate: 'present',
            bullets: [],
          },
          {
            title: 'Incomplete Range',
            subtitle: '',
            startDate: ISOYearMonth.parse('2021-01'),
            endDate: null,
            bullets: [],
          },
          {
            title: 'No Start Date',
            subtitle: '',
            startDate: null,
            endDate: ISOYearMonth.parse('2020-12'),
            bullets: [],
          },
          {
            title: 'No Dates',
            subtitle: '',
            startDate: null,
            endDate: null,
            bullets: [],
          },
        ],
      },
    ],
  },

  normalProfile: {
    name: 'Normal — Software Engineer',
    profile: {
      fullName: 'Alex Mercer',
      email: 'alex.mercer@example.com',
      phone: '+1 (415) 555-0132',
      location: 'San Francisco, CA, USA',
      website: 'https://alexmercer.dev',
      baseSections: [],
    },
    sections: [
      {
        id: 'summary-1',
        type: 'paragraph',
        title: 'Summary',
        content:
          'Practical full-stack software engineer with 5+ years building web applications and APIs. Strong background in Python and TypeScript, experience with cloud platforms and containerized deployments. Passionate about clean code, pragmatic testing, and mentoring junior engineers.',
      },
      {
        id: 'skills-1',
        type: 'simple',
        title: 'Skills',
        content: [
          'Languages: Python, TypeScript, JavaScript, SQL',
          'Frameworks: React, Next.js, FastAPI, Django',
          'Databases: PostgreSQL, Redis, MongoDB',
          'DevOps: Docker, GitHub Actions, AWS (S3, Lambda)',
          'Testing: pytest, Jest, Playwright',
        ],
      },
      {
        id: 'exp-1',
        type: 'detailed',
        title: 'Experience',
        content: [
          {
            title: 'Software Engineer',
            subtitle: 'BrightLayer Inc. — San Francisco, CA',
            startDate: ISOYearMonth.parse('2022-06'),
            endDate: 'present',
            bullets: [
              'Led migration of monolithic API to microservices using FastAPI and Docker, reducing deploy time significantly.',
              'Built a metrics-backed feature flag system to enable gradual rollouts and reduce incidents.',
              'Mentored junior engineers and ran code reviews to raise team standards.',
            ],
          },
          {
            title: 'Full-Stack Engineer',
            subtitle: 'Orbit Labs — Remote',
            startDate: ISOYearMonth.parse('2019-09'),
            endDate: ISOYearMonth.parse('2022-05'),
            bullets: [
              'Developed client dashboards with React and TypeScript, improving retention.',
              'Implemented GraphQL endpoints and optimized DB indexes to reduce query latency.',
              'Owned payments integration and subscription flows.',
            ],
          },
          {
            title: 'Software Engineer (Intern)',
            subtitle: 'University Research Lab — Sacramento, CA',
            startDate: ISOYearMonth.parse('2018-06'),
            endDate: ISOYearMonth.parse('2019-08'),
            bullets: [
              'Built ETL pipelines in Python to normalize and visualize experimental datasets.',
              'Created an internal dashboard for researchers to run queries and export visualizations.',
            ],
          },
        ],
      },
      {
        id: 'edu-1',
        type: 'detailed',
        title: 'Education',
        content: [
          {
            title: 'B.S. in Computer Science',
            subtitle: 'State University — Sacramento, CA',
            startDate: ISOYearMonth.parse('2014-09'),
            endDate: ISOYearMonth.parse('2018-06'),
            bullets: [
              'Relevant coursework: Algorithms, Databases, Operating Systems, Software Engineering.',
            ],
          },
        ],
      },
      {
        id: 'projects-1',
        type: 'simple',
        title: 'Projects',
        content: [
          'TaskFlow — lightweight task manager with real-time collaboration (React, TypeScript).',
          'LogInsight — CLI and web utility for parsing and visualizing structured logs (Python, FastAPI).',
        ],
      },
    ],
  },
  multiPageResume: {
    name: 'Multi-Page Résumé (Long)',
    profile: {
      fullName: 'Eleanor Shellstrop',
      email: 'eleanor@example.com',
      phone: '+1 (555) 987-6543',
      location: 'Phoenix, AZ, USA',
      website: 'https://eleanor.dev',
      baseSections: [],
    },
    sections: [
      {
        id: 'multi-summary-1',
        type: 'paragraph',
        title: 'Summary',
        content:
          'Highly experienced Principal Software Architect with over 15 years of experience in designing, building, and scaling enterprise-level applications. Proven track record of leading large, cross-functional teams to deliver mission-critical software solutions. Expert in cloud-native architectures, distributed systems, and high-performance computing. Adept at navigating complex technical challenges, fostering a culture of engineering excellence, and driving strategic technology initiatives that align with business objectives.',
      },
      {
        id: 'multi-skills-1',
        type: 'simple',
        title: 'Skills',
        content: [
          'Languages: Python, Go, TypeScript, Java, Rust, C++, C#, Kotlin, Scala, Ruby, Swift, Haskell, SQL, Bash',
          'Cloud & Infrastructure: AWS, GCP, Azure, Kubernetes, Docker, Terraform, Helm, Istio, Consul, Envoy, Unix/Linux',
          'Databases: PostgreSQL, MySQL, Cassandra, MongoDB, DynamoDB, Redis, Memcached, Elasticsearch, Kafka, Elasticsearch',
          'Messaging & Streaming: Kafka, RabbitMQ, ActiveMQ, SQS, SNS, Kinesis, Google Pub/Sub, gRPC, Protocol Buffers',
          'Observability & APM: Prometheus, Grafana, Datadog, Jaeger, OpenTelemetry, New Relic, Splunk, Elastic Stack',
          'Practices: Domain-Driven Design (DDD), Test-Driven Development (TDD), CI/CD, Agile/Scrum, SRE, Chaos Engineering',
        ],
      },
      {
        id: 'multi-exp-1',
        type: 'detailed',
        title: 'Experience',
        content: [
          {
            title: 'Principal Software Architect',
            subtitle: 'Global Tech Innovators — New York, NY',
            startDate: ISOYearMonth.parse('2018-05'),
            endDate: 'present',
            bullets: [
              'Spearheaded the architectural redesign of the flagship e-commerce platform, transitioning from a monolithic architecture to a fully distributed microservices ecosystem using Go and Kubernetes.',
              'Designed and implemented a multi-region active-active deployment strategy on AWS, achieving 99.999% uptime and reducing latency for international users by 40%.',
              'Developed a proprietary distributed tracing library using OpenTelemetry, which became the standard across 50+ engineering teams, drastically reducing Mean Time To Resolution (MTTR) for complex system outages.',
              'Mentored a team of 15 senior engineers and tech leads, establishing comprehensive engineering guidelines, RFC processes, and architecture review boards.',
              'Led the evaluation and adoption of Apache Kafka as the central event bus, successfully migrating legacy message queues with zero downtime and supporting 5M+ events per second.',
              'Championed the introduction of Chaos Engineering practices, implementing automated resilience tests that surfaced and mitigated over a dozen critical hidden failures before they impacted production.',
            ],
          },
          {
            title: 'Senior Staff Engineer / Tech Lead',
            subtitle: 'DataSphere Analytics — Boston, MA',
            startDate: ISOYearMonth.parse('2014-08'),
            endDate: ISOYearMonth.parse('2018-04'),
            bullets: [
              'Architected a massive-scale data ingestion and processing pipeline using Apache Spark, AWS EMR, and S3, capable of processing petabytes of telemetry data daily.',
              'Designed a high-throughput, low-latency querying engine on top of Elasticsearch and DynamoDB, serving real-time analytics dashboards for Fortune 500 clients.',
              'Reduced infrastructure costs by 35% ($2M+ annually) through aggressive resource optimization, spot instance utilization, and efficient data retention lifecycle policies.',
              'Spearheaded the migration of the critical billing system from on-premise infrastructure to GCP, navigating stringent compliance and security requirements (PCI-DSS, SOC 2).',
              'Created and maintained a suite of internal developer tools (CLI and Web interfaces) that automated repetitive DevOps tasks, boosting engineering productivity across the entire organization.',
              'Managed vendor relationships with cloud providers and technology partners, negotiating enterprise agreements and influencing product roadmaps to benefit internal use cases.',
            ],
          },
          {
            title: 'Senior Software Engineer',
            subtitle: 'FinTech Solutions LLC — Chicago, MA',
            startDate: ISOYearMonth.parse('2010-02'),
            endDate: ISOYearMonth.parse('2014-07'),
            bullets: [
              'Developed core transaction processing modules in Java and Spring Boot, handling millions of financial transactions daily with stringent consistency guarantees.',
              'Implemented a robust fraud detection engine using early machine learning models and complex rules-engine logic, reducing fraudulent transaction rates by 22%.',
              'Optimized legacy Oracle database queries and materialized views, improving batch processing job performance by over 60%.',
              'Introduced Test-Driven Development (TDD) and continuous integration practices to a team of 20+ developers, significantly reducing production defect rates.',
              'Collaborated closely with product managers and trading desk stakeholders to translate complex financial and regulatory rules into actionable software requirements.',
            ],
          },
          {
            title: 'Software Engineer',
            subtitle: 'Nexus Networking — Seattle, WA',
            startDate: ISOYearMonth.parse('2006-06'),
            endDate: ISOYearMonth.parse('2010-01'),
            bullets: [
              'Built foundational components for a proprietary network load balancing appliance using C++ and Linux kernel network stack features.',
              'Developed an automated test suite framework for hardware-in-the-loop (HIL) testing, reducing manual QA time by 80%.',
              'Contributed to the development of a web-based administrative console using early JavaScript frameworks and RESTful APIs.',
              'Diagnosed and resolved complex memory leaks and concurrency issues in high-performance, multi-threaded C++ applications.',
            ],
          },
          {
            title: 'Junior Software Engineer',
            subtitle: 'StartUp Alpha — Austin, TX',
            startDate: ISOYearMonth.parse('2004-05'),
            endDate: ISOYearMonth.parse('2006-05'),
            bullets: [
              'Maintained and extended legacy PHP and Ruby on Rails applications, fixing bugs and implementing new user-facing features.',
              'Assisted in the migration of bare-metal servers to early virtualized environments (Xen/VMware).',
              'Wrote comprehensive technical documentation and system architecture diagrams for previously undocumented legacy systems.',
            ],
          },
        ],
      },
      {
        id: 'multi-edu-1',
        type: 'detailed',
        title: 'Education',
        content: [
          {
            title: 'M.S. in Computer Science',
            subtitle: 'Massachusetts Institute of Technology (MIT) — Cambridge, MA',
            startDate: ISOYearMonth.parse('2002-09'),
            endDate: ISOYearMonth.parse('2004-06'),
            bullets: [
              'Specialization in Distributed Systems and Advanced Cryptography.',
              'Thesis: "Optimizing Consensus Protocols in High-Latency Networks".',
            ],
          },
          {
            title: 'B.S. in Computer Engineering',
            subtitle: 'University of Texas — Austin, TX',
            startDate: ISOYearMonth.parse('1998-09'),
            endDate: ISOYearMonth.parse('2002-05'),
            bullets: ['Graduated Magna Cum Laude.', 'Minor in Mathematics.'],
          },
        ],
      },
      {
        id: 'multi-projects-1',
        type: 'detailed',
        title: 'Open Source & Projects',
        content: [
          {
            title: 'DistributedTracer (Open Source)',
            subtitle: 'Creator and Maintainer',
            startDate: ISOYearMonth.parse('2019-01'),
            endDate: 'present',
            bullets: [
              'Created an open-source lightweight distributed tracing library in Go designed for edge computing environments.',
              'Achieved 10,000+ GitHub stars and widespread adoption within the CNCF community.',
            ],
          },
          {
            title: 'KubeDeploy Automation',
            subtitle: 'Personal Project',
            startDate: ISOYearMonth.parse('2017-06'),
            endDate: ISOYearMonth.parse('2018-12'),
            bullets: [
              'Developed a CLI tool to automate complex Kubernetes cluster provisioning and workload deployment across multiple cloud providers.',
              'Integrated custom operators and CRDs for advanced stateful workload management.',
            ],
          },
        ],
      },
      {
        id: 'multi-publications-1',
        type: 'simple',
        title: 'Publications & Talks',
        content: [
          'Keynote Speaker: QCon 2022 - "Scaling Microservices Beyond the Breaking Point"',
          'Author: "The Pragmatic Architect", published by O\'Reilly Media (2020)',
          'Speaker: AWS re:Invent 2019 - "Active-Active Multi-Region Deployments made Easy"',
          'Guest Lecturer: Advanced Distributed Systems, MIT (2018-2021)',
        ],
      },
    ],
  },
};
