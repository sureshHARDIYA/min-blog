import axios from 'axios';
import { TrajectoryItem, PublishedBook, ResearchPaper, Philosophy, TechCategory, ContactFormData, ContactResponse } from '../types';

// Create an Axios instance
export const api = axios.create({
  baseURL: '/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock Data Arrays
const MOCK_TRAJECTORY: TrajectoryItem[] = [
  {
    id: 'leroy-1',
    company: 'Lerøy Seafood Group',
    period: '2026 (Jan) — Current',
    role: 'Tech Lead',
    description: 'Leading the design and development of internal digital solutions across frontend, backend, cloud, and AI-driven systems. Defining technical architecture, guiding developers, improving code quality, managing Azure-based infrastructure, and ensuring secure, scalable, and maintainable solutions across the organization.',
    tags: ['ReactJS', 'Tailwind', 'TypeScript', 'Azure', 'Azure SQL', 'FastAPI', 'SonarQube', 'FE Security', 'CI/CD', 'TDD', 'Agentic AI', 'Microfrontend architecture', 'Python'],
  },
  {
    id: 'tryg-2',
    company: 'Tryg Norway',
    period: '2024 (Aug) — 2025',
    role: 'Tech Lead',
    description: 'Responsible for leading and architecting the design and development of customer-facing applications, establishing microfrontend architecture, universal accessibility, and automated CI/CD pipelines.',
    tags: ['VueJS', 'SCSS', 'TypeScript', 'Stencil JS', 'Oracle', 'PL/SQL', 'SonarQube', 'FE Security', 'CI/CD', 'TDD', 'Universal Design', 'Microfrontend architecture', 'JAVA/Kotlin'],
  },
  {
    id: 'tryg-1',
    company: 'Tryg Norway',
    period: '2021 (Aug) — 2024 (Jan)',
    role: 'Senior System Developer',
    description: 'Designed and developed web applications enabling insurance agents to access risk metrics associated with property, providing personalized risk-based quotes to enterprise customers.',
    tags: ['ReactJS', 'GraphQL', 'Apollo Client', 'TypeScript', 'Material UI', 'Cypress', 'JEST', 'Python', 'Azure', 'SAFe Agile Methodologies', 'GitLab', 'SonarQube', 'Miro.com', 'CI/CD', 'BDD', 'TDD', 'JIRA'],
  },
  {
    id: 'hvl-phd',
    company: 'HVL (Western Norway Univ. of Applied Sciences)',
    period: '2018 — 2021 (July)',
    role: 'PhD Researcher',
    description: 'Applied Model-based Software Engineering (MBSE), design thinking, and AI approaches to create adaptive and interoperable Internet-Delivered Psychological Treatments (IDPT) systems.',
    tags: ['Python', 'ReactJS', 'GraphQL', 'TypeScript', 'Ant Design System', 'Node JS', 'MongoDB', 'GitHub', 'Circle CI', 'Agile methodologies', 'R&D'],
  },
  {
    id: 'lokincubator',
    company: 'Lokincubator, Inc.',
    period: '2017 — 2018',
    role: 'Software Developer (Remote, Kansas City)',
    description: 'Contributed to a festival aggregator web application recommending global festivals based on user preferences. Modeled, designed, and developed end-to-end features.',
    tags: ['ReactJS', 'Redux', 'JavaScript', 'Ant Design', 'NodeJS', 'MySQL', 'GitHub', 'CircleCI', 'Agile methodologies'],
  },
  {
    id: 'landed',
    company: 'Landed, Inc.',
    period: '2016 — 2018',
    role: 'Fullstack Developer (Remote, San Francisco)',
    description: 'Developed and maintained financial application workflows to help essential workers build financial security near the communities they serve.',
    tags: ['ReactJS', 'Redux', 'Redux-Saga', 'JavaScript', 'Node JS', 'PostgreSQL', 'GitHub', 'Circle CI', 'SCRUM', 'AWS/S3'],
  },
  {
    id: 'sincos',
    company: 'Sincos Software AS',
    period: '2016 (June) — 2017 (July)',
    role: 'Frontend Developer (Norway)',
    description: 'Developed e-commerce solutions for 24estore serving global customers, working across front-end and back-end web systems.',
    tags: ['ReactJS', 'Redux', 'UIKIT', 'Laravel', 'MySQL', 'Circle CI', 'SCRUM'],
  },
  {
    id: 'upwork',
    company: 'UPWORK.COM',
    period: '2010 — 2018',
    role: 'Fullstack Developer (Remote, Freelancer)',
    description: 'Delivered customized web design, fullstack application development, database architecture, and security services for global clients on Upwork.',
    tags: ['WordPress', 'PHP', 'ReactJS', 'Redux', 'NextJS', 'Node JS', 'MySQL', 'Circle CI', 'MongoDB', 'AWS', 'CI/CD', 'Web Security', 'Python', 'SCRUM'],
  },
];

const MOCK_BOOKS: PublishedBook[] = [
  {
    id: 'book-1',
    publisher: 'BPB ONLINE',
    title: 'Statistics for Data Scientists and Analysts (2025 Edition)',
    year: 2025,
    isbn: '978-9355519821',
    pages: 380,
    summary: 'A code-first practical guide applying inferential statistics, probability distributions, regression modeling, and A/B testing using Python.',
    topics: ['Data Analytics', 'Python', 'Statistics', 'A/B Testing', 'Machine Learning'],
    url: 'https://bpbonline.com/',
  },
  {
    id: 'book-2',
    publisher: 'PACKT PUBLISHING',
    title: 'Hands-on Exploratory Data Analysis',
    year: 2020,
    isbn: '978-1789537253',
    pages: 364,
    summary: 'Master structured EDA techniques for data cleaning, outlier detection, PCA dimensionality reduction, and interactive visualization in Python.',
    topics: ['Data Analytics', 'Python', 'Exploratory Analysis', 'Pandas & Seaborn', 'Dimensionality Reduction'],
    url: 'https://www.packtpub.com/',
  },
  {
    id: 'book-3',
    publisher: 'PACKT PUBLISHING',
    title: 'Redux Quick Start Guide',
    year: 2019,
    isbn: '978-1789612349',
    pages: 280,
    summary: 'A practical guide to predictable state management in React applications using Redux, middleware, selectors, and Redux Toolkit slices.',
    topics: ['React', 'Redux', 'State Management', 'JavaScript', 'Redux Toolkit'],
    url: 'https://www.packtpub.com/',
  },
  {
    id: 'book-4',
    publisher: 'PACKT PUBLISHING',
    title: 'Hands-on Big Data Modeling',
    year: 2018,
    isbn: '978-1788628327',
    pages: 350,
    summary: 'Architecting scalable NoSQL, relational, and columnar data pipelines for real-time streaming and big data analytics.',
    topics: ['Big Data & Machine Learning', 'Data Architecture', 'NoSQL & Cassandra', 'Apache Kafka', 'Stream Processing'],
    url: 'https://www.packtpub.com/',
  },
];

const MOCK_RESEARCH_PAPERS: ResearchPaper[] = [
  {
    id: 'paper-doc-thesis',
    title: 'A Software Framework for Adaptive and Interoperable Internet-Delivered Psychological Treatments',
    journal: 'Doctoral Dissertation, Western Norway University of Applied Sciences (HVL)',
    year: 2021,
    authors: ['Suresh Kumar Mukhiya'],
    citations: 45,
    abstract: 'Doctoral thesis at HVL investigating Model-based Software Engineering (MBSE), design thinking, and AI approaches to construct adaptive and interoperable Internet-Delivered Psychological Treatment (IDPT) systems.',
    url: 'https://hdl.handle.net/11250/2778982',
    topics: ['Doctoral Thesis', 'Software Framework', 'Adaptive Systems', 'Interoperability', 'IDPT'],
  },
  {
    id: 'paper-hl7-graphql',
    title: 'An HL7 FHIR and GraphQL approach for interoperability between heterogeneous Electronic Health Record systems',
    journal: 'Health Informatics Journal',
    year: 2021,
    authors: ['Suresh Kumar Mukhiya', 'Yngve Lamo'],
    doi: '10.1177/14604582211043920',
    citations: 38,
    abstract: 'Presents an HL7 FHIR and GraphQL framework bridging data isolation across heterogeneous Electronic Health Record (EHR) systems to facilitate efficient, unified data access and interoperability.',
    url: 'https://doi.org/10.1177/14604582211043920',
    topics: ['HL7 FHIR', 'GraphQL', 'EHR Interoperability', 'Health Informatics', 'Distributed Data'],
  },
  {
    id: 'paper-ai-mental-health',
    title: 'Artificial Intelligence in Mental Health',
    journal: 'Book Chapter in Artificial Intelligence: Models, Algorithms and Applications (Bentham Science, 2021)',
    year: 2021,
    authors: ['Suresh Kumar Mukhiya', 'A. Aminifar', 'F. Rabbi', 'V. K. I. Pun', 'Y. Lamo'],
    doi: '10.2174/97816810882661210101',
    citations: 29,
    abstract: 'Explores AI models, natural language processing, and machine learning algorithms applied to digital mental health interventions, adaptive patient profiling, and outcome predictions.',
    url: 'https://doi.org/10.2174/97816810882661210101',
    topics: ['Artificial Intelligence', 'Mental Health', 'Machine Learning', 'Adaptive Systems'],
  },
  {
    id: 'paper-active-learning-nlp',
    title: 'Attention-based Deep Entropy Active Learning using Lexical Algorithm for Mental Health Treatment',
    journal: 'Frontiers in Psychology',
    year: 2021,
    authors: ['Usman Ahmed', 'Suresh Kumar Mukhiya', 'Jerry Chun-Wei Lin', 'Gautam Srivastava', 'Yngve Lamo'],
    doi: '10.3389/fpsyg.2021.642347',
    citations: 33,
    abstract: 'Develops an attention-based deep entropy active learning model integrated with lexical algorithms to optimize patient text analysis and adaptive mental health treatment protocols.',
    url: 'https://doi.org/10.3389/fpsyg.2021.642347',
    topics: ['Deep Learning', 'Active Learning', 'NLP', 'Frontiers in Psychology', 'Mental Health'],
  },
  {
    id: 'paper-systematic-review-idpt',
    title: 'Adaptive Elements in Internet-Delivered Psychological Treatment Systems: Systematic Review',
    journal: 'Journal of Medical Internet Research (JMIR)',
    year: 2020,
    authors: ['Suresh Kumar Mukhiya', 'Jo Dugstad Wake', 'Yavus Inlal', 'Ka I Pun', 'Yngve Lamo'],
    citations: 42,
    abstract: 'A comprehensive systematic literature review evaluating adaptive architectural components, personalization mechanisms, and decision rules across e-health and IDPT platforms.',
    url: 'https://www.jmir.org/2020/11/e21066',
    topics: ['Adaptive Systems', 'Systematic Review', 'JMIR', 'Personalization', 'IDPT'],
  },
  {
    id: 'paper-pareto-mining',
    title: 'Efficient Mining of Pareto-Front High Expected Utility Patterns',
    journal: 'IEA/AIE 2020 (LNCS vol 12144, Springer)',
    year: 2020,
    authors: ['Usman Ahmed', 'Jerry Chun-Wei Lin', 'Jimmy Ming-Tai Wu', 'Youcef Djenouri', 'Gautam Srivastava', 'Suresh Kumar Mukhiya'],
    doi: '10.1007/978-3-030-55789-8_74',
    citations: 21,
    abstract: 'Proposes an efficient algorithmic framework for mining Pareto-front high expected utility patterns in complex multi-objective data mining scenarios.',
    url: 'https://doi.org/10.1007/978-3-030-55789-8_74',
    topics: ['Data Mining', 'Utility Mining', 'Pareto Frontier', 'Pattern Analysis'],
  },
  {
    id: 'paper-cbms-nlp',
    title: 'Adaptation of IDPT System Based on Patient-Authored Text Data Using NLP',
    journal: '2020 IEEE 33rd International Symposium on Computer-Based Medical Systems (CBMS)',
    year: 2020,
    authors: ['Suresh Kumar Mukhiya', 'Usman Ahmed', 'Fazle Rabbi', 'Ka I Pun', 'Yngve Lamo'],
    doi: '10.1109/CBMS49503.2020.00050',
    citations: 37,
    abstract: 'Introduces natural language processing pipelines to parse patient-authored diary entries and dynamic feedback, driving real-time adaptive updates in digital health workflows.',
    url: 'https://doi.org/10.1109/CBMS49503.2020.00050',
    topics: ['NLP', 'Adaptive Workflows', 'IEEE CBMS', 'Healthcare Data'],
  },
  {
    id: 'paper-ieee-access-idpt',
    title: 'Adaptive Systems for Internet-Delivered Psychological Treatments',
    journal: 'IEEE Access',
    year: 2020,
    authors: ['Suresh Kumar Mukhiya', 'Jo Dugstad Wake', 'Yavus Inlal', 'Yngve Lamo'],
    doi: '10.1109/ACCESS.2020.3002793',
    citations: 56,
    abstract: 'Formulates an architectural model for self-adapting software systems powering internet-delivered therapies, ensuring fault resilience and dynamically tailored user experiences.',
    url: 'https://doi.org/10.1109/ACCESS.2020.3002793',
    topics: ['IEEE Access', 'Adaptive Systems', 'Software Architecture', 'Health IT'],
  },
  {
    id: 'paper-conversations-adhd',
    title: 'Designing Chatbots for Guiding Online Peer Support Conversations for Adults with ADHD',
    journal: 'CONVERSATIONS 2019 (LNCS vol 11970, Springer)',
    year: 2019,
    authors: ['Oda Elise Nordberg', 'Jo Dugstad Wake', 'Emilie Sektnan Nordby', 'Eivind Flobak', 'Tine Nordgreen', 'Suresh Kumar Mukhiya', 'Frode Guribye'],
    doi: '10.1007/978-3-030-39540-7_8',
    citations: 28,
    abstract: 'Investigates design principles and interaction patterns for conversational AI agents facilitating online peer-support communities for adults with ADHD.',
    url: 'https://doi.org/10.1007/978-3-030-39540-7_8',
    topics: ['Chatbots', 'Conversational AI', 'Peer Support', 'HCI'],
  },
  {
    id: 'paper-procedia-graphql',
    title: 'A GraphQL approach to Healthcare Information Exchange with HL7 FHIR',
    journal: 'Procedia Computer Science (Elsevier, 2019)',
    year: 2019,
    authors: ['Suresh Kumar Mukhiya', 'Fazle Rabbi', 'Ka I Pun', 'Adrian Rutle', 'Yngve Lamo'],
    doi: '10.1016/j.procs.2019.11.082',
    citations: 44,
    abstract: 'Demonstrates how GraphQL wrappers around HL7 FHIR RESTful resources eliminate over-fetching and improve query latency in mobile and web healthcare information exchanges.',
    url: 'https://doi.org/10.1016/j.procs.2019.11.082',
    topics: ['GraphQL', 'HL7 FHIR', 'Procedia Computer Science', 'API Gateway'],
  },
  {
    id: 'paper-seh-architectural-design',
    title: 'An architectural design for creating self-reporting e-health systems',
    journal: 'ICSE 2019 Proceedings / IEEE Digital Library (SEH 2019)',
    year: 2019,
    authors: ['Suresh Kumar Mukhiya', 'Fazle Rabbi', 'Ka I Pun', 'Yngve Lamo'],
    doi: '10.1109/SEH.2019.00008',
    citations: 22,
    abstract: 'Presents a domain-driven architectural blueprint for capturing, validating, and streaming self-reported patient metrics securely in distributed e-health architectures.',
    url: 'https://doi.org/10.1109/SEH.2019.00008',
    topics: ['Software Architecture', 'ICSE SEH', 'E-Health Systems', 'Self-Reporting'],
  },
  {
    id: 'paper-ijrra-spa',
    title: 'An Architectural Style for Single Page Scalable Modern Web Application',
    journal: 'International Journal of Recent Research Aspects (IJRRA, Vol 5 Issue 4)',
    year: 2018,
    authors: ['Suresh Kumar Mukhiya', 'Hoang Khac Hung'],
    citations: 19,
    abstract: 'Proposes a decoupled micro-client architectural style for single page applications (SPAs) to maximize rendering performance, code reusability, and client-side caching.',
    url: 'https://www.ijrra.net/Vol5issue4/IJRRA-05-04-02.pdf',
    topics: ['SPA Architecture', 'Web Engineering', 'Client Performance', 'Micro-frontends'],
  },
  {
    id: 'paper-bergen-budapest-poster',
    title: 'An architectural design for creating self-reporting e-health systems (Awarded Best Poster)',
    journal: '2nd Bergen-Budapest Workshop on Qualitative and Numerical Aspects of Mathematical Modelling',
    year: 2019,
    authors: ['Suresh Kumar Mukhiya', 'Fazle Rabbi', 'Ka I Pun', 'Yngve Lamo'],
    citations: 16,
    abstract: 'Awarded Best Poster. Formulates software engineering models and mathematical verification for high-concurrency self-reporting e-health platforms.',
    url: 'https://doi.org/10.13140/rg.2.2.14802.30404',
    topics: ['Awarded Best Poster', 'Mathematical Modelling', 'Software Verification', 'E-Health'],
  },
  {
    id: 'paper-master-thesis-ntnu',
    title: 'Predicting The Next Click With Web Log Process Mining',
    journal: 'Master Thesis, Norwegian University of Science and Technology (NTNU)',
    year: 2016,
    authors: ['Suresh Kumar Mukhiya', 'Jon Atle Gulla (Supervisor)', 'Jon Espen Ingvaldsen (Supervisor)'],
    citations: 35,
    abstract: 'Proposes a methodology for revealing deep content interaction models from real-life web log data of Adresseavisen, a regional news publisher in Norway.',
    url: 'http://hdl.handle.net/11250/2411539',
    topics: ['Master Thesis', 'Process Mining', 'Web Logs', 'NTNU', 'User Modeling'],
  },
  {
    id: 'paper-master-project-ntnu',
    title: 'User Segmentation: Revealing User Characteristics From Interaction Logs',
    journal: 'Master Research Project, Norwegian University of Science and Technology (NTNU)',
    year: 2015,
    authors: ['Suresh Kumar Mukhiya', 'Jon Atle Gulla (Supervisor)', 'Jon Espen Ingvaldsen (Supervisor)'],
    citations: 14,
    abstract: 'Explores unsupervised clustering and interaction-log feature extraction methods to segment online reader behavior into distinct persona profiles.',
    topics: ['Master Project', 'User Segmentation', 'Log Mining', 'NTNU', 'Data Analytics'],
  },
];

const MOCK_PHILOSOPHIES: Philosophy[] = [
  {
    id: 'phil-1',
    number: '01',
    title: 'Adaptive & Scalable Systems',
    summary: 'Designing fault-tolerant, elastic micro-architectures that dynamically adapt to workload variations, network latency, and high-concurrency enterprise demands.',
    details: [
      'Event-driven asynchronous messaging',
      'Circuit breaker pattern & resilient retry policies',
      'Elastic multi-region cloud scaling',
      'Automated health telemetry and observability'
    ]
  },
  {
    id: 'phil-2',
    number: '02',
    title: 'Cyber Security & Secured Systems',
    summary: 'Prioritizing Zero-Trust security architecture, threat modeling, vulnerability auditing, cryptographic data safety, and secure perimeters across all layers.',
    details: [
      'Zero-Trust architecture & IAM governance',
      'Cryptographic data protection & secret management',
      'Automated SAST/DAST & SonarQube security gates',
      'Hardened microfrontend & API perimeter defense'
    ]
  },
  {
    id: 'phil-3',
    number: '03',
    title: 'AI & Agentic Engineering',
    summary: 'Building autonomous AI agents, LLM tool orchestration, adaptive RAG pipelines, and deterministic safety rails for complex enterprise workflows.',
    details: [
      'Agentic workflow execution & tool orchestration',
      'LLM integration & Retrieval-Augmented Generation (RAG)',
      'Deterministic AI system boundaries & safety rails',
      'Empirical evaluation of AI-driven software agents'
    ]
  }
];

const MOCK_TECH_STACK: TechCategory[] = [
  {
    category: 'Backend & Systems Engineering',
    description: 'High-throughput backend services, distributed systems, memory caches, and relational data architecture.',
    skills: [
      { name: 'Python (FastAPI / Django)', proficiency: 'Expert / Lead', level: 96, note: 'AI agent integration, async microservices & data pipelines' },
      { name: 'Node.js & TypeScript', proficiency: 'Expert', level: 95, note: 'Asynchronous event loop, Express & Fastify enterprise APIs' },
      { name: 'Rust & Systems Programming', proficiency: 'Advanced', level: 88, note: 'Memory-safe high-performance concurrent systems' },
      { name: 'Java & Enterprise Systems', proficiency: 'Advanced', level: 90, note: 'Robust backend architecture, Spring Boot & JVM optimization' },
      { name: 'SQL & PostgreSQL', proficiency: 'Expert', level: 94, note: 'Complex query optimization, ACID compliance & schema design' },
      { name: 'Redis & In-Memory Caching', proficiency: 'Expert', level: 92, note: 'Distributed caching, pub/sub messaging & rate limiting' },
    ],
  },
  {
    category: 'Cyber Security & Secured Systems',
    description: 'Hardened application security, threat modeling, SonarQube security gates, and Zero Trust perimeters.',
    skills: [
      { name: 'Cyber Security & Defense', proficiency: 'Expert', level: 95, note: 'Threat modeling, vulnerability assessment & security audits' },
      { name: 'Zero Trust & IAM Architecture', proficiency: 'Expert', level: 92, note: 'Role-based access control, OAuth2, OIDC & least privilege' },
      { name: 'Application & Frontend Security', proficiency: 'Expert', level: 94, note: 'CSP headers, XSS/CSRF protection & SonarQube gates' },
      { name: 'Data Encryption & Safe Storage', proficiency: 'Advanced', level: 90, note: 'At-rest & in-transit cryptographic protection' },
    ],
  },
  {
    category: 'AI & Agentic Engineering',
    description: 'Autonomous agent execution, LLM tool integration, adaptive workflows, and RAG pipelines.',
    skills: [
      { name: 'Agentic AI & Tool Orchestration', proficiency: 'Lead / Expert', level: 96, note: 'Multi-agent orchestration, autonomous tool use & task planning' },
      { name: 'LLM Integration & RAG', proficiency: 'Expert', level: 93, note: 'Vector search embeddings, prompt engineering & guardrails' },
      { name: 'Python AI Ecosystem', proficiency: 'Expert', level: 95, note: 'PyTorch, Scikit-learn, LangChain & agent frameworks' },
      { name: 'Adaptive Intelligence Systems', proficiency: 'Lead', level: 94, note: 'Self-tuning psychological & enterprise decision systems' },
    ],
  },
  {
    category: 'Architecture & Cloud Native',
    description: 'Elastic cloud infrastructure, resilient microservices, and distributed high-availability design.',
    skills: [
      { name: 'Adaptive & Scalable Systems', proficiency: 'Expert', level: 96, note: 'Fault-tolerant micro-architectures & auto-scaling' },
      { name: 'Kubernetes & Docker', proficiency: 'Expert', level: 95, note: 'Production container orchestration & Helm charts' },
      { name: 'Azure & AWS Cloud', proficiency: 'Expert', level: 93, note: 'Infrastructure as Code (Terraform) & multi-region failover' },
      { name: 'Event Streaming (Kafka)', proficiency: 'Advanced', level: 88, note: 'Distributed event buses & saga pattern orchestration' },
    ],
  },
  {
    category: 'Frontend & UI Engineering',
    description: 'Modern reactive frameworks, design system engineering, microfrontends, and web performance.',
    skills: [
      { name: 'React 19 & Vue.js', proficiency: 'Author / Lead', level: 98, note: 'Published author on React, microfrontend architecture' },
      { name: 'TypeScript & Stencil JS', proficiency: 'Expert', level: 95, note: 'Strict typing, web components & universal design' },
      { name: 'Tailwind CSS & SCSS', proficiency: 'Expert', level: 94, note: 'Design system architectural tokens & responsive UI' },
      { name: 'Testing & Quality (Jest, Cypress)', proficiency: 'Author', level: 96, note: 'TDD book author, automated E2E & unit pipelines' },
    ],
  },
];

// Simulated Delay Async Helpers
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchTrajectory(): Promise<TrajectoryItem[]> {
  await delay(350);
  return MOCK_TRAJECTORY;
}

export async function fetchBooks(): Promise<PublishedBook[]> {
  await delay(300);
  return MOCK_BOOKS;
}

export async function fetchResearchPapers(): Promise<ResearchPaper[]> {
  await delay(300);
  return MOCK_RESEARCH_PAPERS;
}

export async function fetchPhilosophies(): Promise<Philosophy[]> {
  await delay(250);
  return MOCK_PHILOSOPHIES;
}

export async function fetchTechStack(): Promise<TechCategory[]> {
  await delay(300);
  return MOCK_TECH_STACK;
}

export async function submitInquiry(data: ContactFormData): Promise<ContactResponse> {
  if (!data.name || !data.email || !data.message) {
    throw new Error('Please fill in all required fields.');
  }

  const endpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;

  if (!endpoint) {
    throw new Error('Formspree endpoint is missing. Add NEXT_PUBLIC_FORMSPREE_ENDPOINT to your environment.');
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      _replyto: data.email,
      company: data.company,
      scope: data.scope,
      message: data.message,
      'g-recaptcha-response': data.recaptchaToken,
      _subject: `New portfolio inquiry${data.company ? ` from ${data.company}` : ''}`,
    }),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null);
    const message =
      result?.error ||
      result?.errors?.map((error: { message?: string }) => error.message).filter(Boolean).join(' ') ||
      'Unable to send inquiry right now. Please try direct email instead.';

    throw new Error(message);
  }

  return {
    success: true,
    referenceId: `FS-${Date.now()}`,
    message: 'Your inquiry has been sent successfully. I will reply as soon as possible.',
    timestamp: new Date().toISOString(),
  };
}

export async function fetchSystemMetrics() {
  await delay(200);
  return {
    status: 'OPTIMAL',
    uptime: '99.99%',
    latencyMs: Math.floor(12 + Math.random() * 8),
    activeNodes: 14,
    region: 'Europe-West2 (London/Oslo)',
  };
}
