// Everything the site says lives in this file. Edit copy here, not in components.

export const PROFILE = {
  name: 'Devansh Rai',
  email: 'idevanshrai@gmail.com',
  location: 'India',
  github: 'https://github.com/idevanshrai',
  linkedin: 'https://www.linkedin.com/in/idevanshrai/',
  resume: '/resume.pdf',
  // One sentence, plain words. Says what you do, not what you are "passionate" about.
  intro:
    'Software developer building agentic AI systems and native apps. Final-year CS (AI/ML) at VIT, currently interning at IBM India Software Labs.',
  about: [
    'I got into building through robotics — line followers, maze solvers and a RoboRace car that took second at the University of Waterloo’s IARRC in 2019. That habit of making things that have to work in the real world stuck.',
    'These days most of my time goes into AI that is useful rather than impressive: agents that call real tools, retrieval that cites its sources, speech-to-text that never leaves your laptop. On the side I write small, native macOS apps in Swift because I like software that feels fast.',
  ],
  facts: [
    { k: 'Based in', v: 'India' },
    { k: 'Studying', v: 'B.Tech CSE (AI/ML), VIT · ’27' },
    { k: 'Currently', v: 'Intern, IBM India Software Labs' },
    { k: 'Works in', v: 'Python · Swift · TypeScript' },
  ],
};

export interface Role {
  org: string;
  role: string;
  period: string;
  place?: string;
  points: string[];
  tags?: string[];
}

export const EXPERIENCE: Role[] = [
  {
    org: 'IBM India Software Labs',
    role: 'Intern — Agentic AI',
    // Certificate: 8-week Summer Internship Program 2026 from 6 July 2026; continued as an intern after it.
    period: 'Jul 2026 — Present',
    points: [
      'Completed the 8-week Summer Internship Program 2026, working on the design and development of agentic AI solutions — and stayed on as an intern afterwards.',
      'Recognised by the lab for technical excellence, innovation and teamwork.',
    ],
    tags: ['Agentic AI'],
  },
  {
    org: 'Centre for e-Governance, U.P.',
    role: 'Software Development Intern',
    period: 'May — Jun 2025',
    points: [
      'Built digital tools for AI Pragya, an AI-awareness and digital-literacy programme that reached thousands of citizens.',
      'Improved its outreach and feedback systems so they worked for a wider range of users.',
    ],
    tags: ['Web', 'AI outreach'],
  },
  {
    org: 'CodeDay',
    role: 'Social Media Lead & Volunteer',
    period: 'Apr — Aug 2024',
    points: [
      'Helped organise hackathons for 2,000+ high-school students and ran workshops on Python, Git and AI.',
    ],
    tags: ['Community'],
  },
];

export const EDUCATION = [
  { school: 'Vellore Institute of Technology', what: 'B.Tech Computer Science (AI & ML)', period: '2023 — 2027' },
  { school: 'City Montessori School', what: 'ISC · Student Government, Robotics Club', period: '2021 — 2023' },
];

export const AWARDS = [
  { what: 'Commended by India’s Defence Minister', where: 'Top 3% academic performance nationally', year: '' },
  { what: '2nd place, RoboRace + Judge’s Choice', where: 'IARRC, University of Waterloo', year: '2019' },
  { what: '1st place, RoboSumo & Robo War', where: 'Robotex India', year: '' },
  { what: '1st place, RoboRace', where: 'Entente', year: '2022' },
  { what: '1st place, Zonal round', where: 'Techfest', year: '2020' },
];

export interface Project {
  name: string;
  year: string;
  kind: string;
  blurb: string;
  stack: string[];
  repo: string;
  live?: string;
  /** case-study page at /work/<slug> (see src/content/caseStudies.ts) */
  slug?: string;
  /** screenshot shown when hovering the project — put the file in public/work/ */
  preview?: string;
}

// Featured — the three you'd want an interviewer to ask about.
export const WORK: Project[] = [
  {
    name: 'BrimBrowser',
    slug: 'brimbrowser',
    year: '2025',
    kind: 'macOS app',
    blurb:
      'A small, fast browser for macOS built on SwiftUI and WKWebView — tabs, bookmarks, and nothing you didn’t ask for. My most-starred repo.',
    stack: ['Swift', 'SwiftUI', 'WebKit'],
    repo: 'https://github.com/idevanshrai/BrimBrowser-MacOS',
  },
  {
    name: 'LeaveManager MCP',
    slug: 'leavemanager-mcp',
    year: '2026',
    kind: 'MCP server',
    blurb:
      'A Model Context Protocol server that lets Claude Desktop check leave balances, apply for leave on specific dates and read history — typed tools over a small Python backend.',
    stack: ['Python', 'MCP'],
    repo: 'https://github.com/idevanshrai/mcp-playground',
  },
  {
    name: 'EchoScribe',
    slug: 'echoscribe',
    year: '2025',
    kind: 'Local AI service',
    blurb:
      'Transcribes and summarises audio entirely on your machine. No internet, no external APIs — built for notes you don’t want leaving the laptop.',
    stack: ['Python', 'FastAPI', 'ASR', 'NLP'],
    repo: 'https://github.com/idevanshrai/EchoScribe',
  },
];

// Smaller builds and experiments — all real repos.
export const LAB: Project[] = [
  {
    name: 'Contrail',
    year: '2026',
    kind: 'macOS',
    blurb: 'A focus timer disguised as a flight simulator. Pick a destination, board, stay focused until you land.',
    stack: ['Swift'],
    repo: 'https://github.com/idevanshrai/Contrail',
  },
  {
    name: 'Tabby',
    year: '2026',
    kind: 'macOS',
    blurb: 'Menu-bar app that attaches notes and Calendar reminders to open browser tabs.',
    stack: ['Swift'],
    repo: 'https://github.com/idevanshrai/Tabby-MacOS',
  },
  {
    name: 'PredictEdge',
    year: '2026',
    kind: 'ML',
    blurb: 'Predicts remaining useful life of turbofan engines from sensor data.',
    stack: ['Python', 'ML'],
    repo: 'https://github.com/idevanshrai/PredictEdge',
  },
  {
    name: 'Orbital Analysis',
    year: '2025',
    kind: 'Web · 3D',
    blurb: 'Flags possible satellite collisions from real TLE data, with a Three.js globe.',
    stack: ['Flask', 'Three.js'],
    repo: 'https://github.com/idevanshrai/satellite-collsion-predictor',
  },
  {
    name: 'Sudoku Solver',
    year: '2025',
    kind: 'Vision',
    blurb: 'Reads a Sudoku from your webcam, recognises digits with a custom CNN, solves it live.',
    stack: ['Python', 'OpenCV', 'CNN'],
    repo: 'https://github.com/idevanshrai/sudoku-solver-ml',
  },
  {
    name: 'AlignAI',
    year: '2025',
    kind: 'Web',
    blurb: 'Scores a résumé against a job description and suggests what to fix.',
    stack: ['JavaScript', 'NLP'],
    repo: 'https://github.com/idevanshrai/AlignAI',
    live: 'https://align-ai-eight.vercel.app/splash.html',
  },
  {
    name: 'Moodify',
    year: '2024',
    kind: 'Web',
    blurb: 'Builds a Spotify playlist from your mood and the time of day.',
    stack: ['JavaScript', 'Spotify API'],
    repo: 'https://github.com/idevanshrai/Moodify',
    live: 'https://moodify-lake.vercel.app',
  },
  {
    name: 'Maze Solver',
    year: '2024',
    kind: 'Robotics',
    blurb: 'Arduino robot that solves mazes with an ultrasonic sensor and the right-hand rule.',
    stack: ['Arduino', 'C++'],
    repo: 'https://github.com/idevanshrai/Maze-Solver',
  },
];

/* ── Now ───────────────────────────────────────────────────────────────────
 * What I'm up to this month. Update `updated` whenever you change it.
 * Lines starting with TODO only show in `npm run dev`.
 */
export const NOW = {
  updated: 'September 2026',
  items: [
    { k: 'Building', v: 'Agentic AI systems as an intern at IBM India Software Labs.' },
    { k: 'Studying', v: 'Final year of B.Tech CSE (AI/ML) at VIT, plus a group capstone project.' },
    { k: 'Tinkering', v: 'Small native macOS apps in SwiftUI after hours.' },
    { k: 'Reading', v: 'TODO: a book or paper you’re into right now.' },
    { k: 'Learning', v: 'TODO: one thing you’re learning outside work.' },
  ],
};

/* ── Certificates ──────────────────────────────────────────────────────────
 * Put the file (PDF or image) in public/certificates/ and add a line here.
 * `thumb` is a small preview image (optional).
 */
export const CERTIFICATES: { title: string; issuer: string; date: string; file: string; thumb?: string }[] = [
  {
    title: 'Summer Internship Program 2026 — Agentic AI',
    issuer: 'IBM India Software Labs',
    date: '2026',
    file: '/certificates/ibm-summer-internship-2026.pdf',
    thumb: '/certificates/ibm-summer-internship-2026.jpg',
  },
];

/* ── Book a call ───────────────────────────────────────────────────────────
 * Your Cal.com link, e.g. 'https://cal.com/devanshrai/20min'. Empty = hidden.
 */
export const CAL_LINK = '';
