/**
 * Case-study pages (/work/<slug>). Written from each project's README.
 * Anything starting with "TODO" is shown only while you run `npm run dev`,
 * so you can see what's missing without it ever reaching the live site.
 */
export interface CaseStudy {
  slug: string;
  tagline: string;
  role: string;
  timeline: string;
  problem: string[];
  built: { title: string; body: string }[];
  how: { title: string; body: string; code?: string }[];
  next: string[];
  learned: string[];
  /** screenshots in public/work/<slug>/ */
  shots: { src: string; caption: string }[];
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'brimbrowser',
    tagline: 'A native macOS browser that does less, on purpose.',
    role: 'Solo — design and development',
    timeline: '2025',
    problem: [
      'I wanted a browser that felt like it belonged on a Mac: native controls, fast to open, and none of the clutter that builds up in big browsers.',
      'Building one is also the best way to learn how SwiftUI and WebKit actually fit together.',
    ],
    built: [
      { title: 'Tabs', body: 'Open, close and switch tabs, with smooth animations between them.' },
      { title: 'Smart address bar', body: 'Type a URL and it loads; type anything else and it becomes a search.' },
      { title: 'Bookmarks', body: 'Save sites and get back to them from the home page.' },
      { title: 'Home page', body: 'A large search bar and a grid of favourites instead of a blank tab.' },
      { title: 'Native look', body: 'Frosted .ultraThinMaterial surfaces throughout, so it feels like part of macOS.' },
    ],
    how: [
      {
        title: 'SwiftUI ↔ WebKit bridge',
        body: 'SwiftUI has no web view of its own, so a small container wraps WKWebView and passes navigation state back up to the SwiftUI views.',
      },
      {
        title: 'Separated responsibilities',
        body: 'A TabManager owns the list of tabs, a WebViewManager owns each page’s WebKit state, and BookmarkManager handles storage — the views only render.',
        code: `Managers/TabManager.swift        // tab logic
Models/BrowserTab.swift          // tab model
Models/BookmarkManager.swift     // bookmark storage
Views/WebViewContainer.swift     // SwiftUI <-> WKWebView
WebViewStore/WebViewManager.swift`,
      },
    ],
    next: ['Page titles on tabs', 'Download manager', 'Private browsing', 'History'],
    learned: ['TODO: the hardest bug you hit, or what surprised you about WebKit.'],
    shots: [],
  },
  {
    slug: 'leavemanager-mcp',
    tagline: 'Giving Claude real tools to manage leave — over the Model Context Protocol.',
    role: 'Solo — design and development',
    timeline: '2026',
    problem: [
      'Language models are good at understanding a request like “take the 15th to the 17th off” but can’t act on it without tools.',
      'MCP is the standard way to hand a model those tools. I built a small, realistic one to learn how to design tools a model can use reliably.',
    ],
    built: [
      { title: 'get_leave_balance', body: 'Returns how much leave an employee has left.' },
      { title: 'apply_leave', body: 'Applies leave for a list of specific dates rather than a vague range.' },
      { title: 'get_leave_history', body: 'Returns everything an employee has taken so far.' },
      { title: 'Claude Desktop ready', body: 'Installs straight into Claude Desktop with the MCP CLI.' },
    ],
    how: [
      {
        title: 'Typed tools with FastMCP',
        body: 'Each tool is a plain Python function with typed inputs; FastMCP turns it into a tool the model can discover and call with structured arguments.',
      },
      {
        title: 'Try it',
        body: 'Ask Claude in plain language and it picks the right tool and fills in the arguments itself.',
        code: `Use the LeaveManager tool to apply leave
employee_id: E001
leave_dates: 2025-01-15, 2025-01-16, 2025-01-17`,
      },
    ],
    next: ['Approval / rejection flow', 'Persistent storage (SQLite)', 'Employee vs manager roles', 'Audit log'],
    learned: ['TODO: what you learned about designing tools for a model.'],
    shots: [],
  },
  {
    slug: 'echoscribe',
    tagline: 'Speech-to-notes that never leaves your laptop.',
    role: 'Solo — design and development',
    timeline: '2025',
    problem: [
      'Most transcription tools upload your audio to someone else’s server. For lectures, interviews and private notes, that’s a bad trade.',
      'EchoScribe does the whole thing — transcription and summary — locally, with no internet and no external APIs.',
    ],
    built: [
      { title: 'Transcription', body: 'Turns speech into text with a local speech-recognition model.' },
      { title: 'Summaries', body: 'Condenses a long transcript into a few lines.' },
      { title: 'Timestamps', body: 'Splits the transcript into time-stamped segments so it’s easy to scan.' },
      { title: 'Simple API', body: 'A FastAPI backend that any front end can call.' },
    ],
    how: [
      {
        title: 'Pipeline',
        body: 'Upload audio → speech recognition → time-stamped segments → summarisation. Each stage lives in its own module (asr.py, summarizer.py) behind one /process endpoint.',
        code: `curl -X POST -F "audio=@test.wav" http://127.0.0.1:8000/process
# → { "transcript": "…", "summary": "…", "segments": [{ "start": 6.38, "end": 12.38, … }] }`,
      },
    ],
    next: ['Speaker labels (who said what)', 'A front end for upload and playback', 'Choice of model size'],
    learned: ['TODO: a trade-off you made between speed and accuracy.'],
    shots: [],
  },
];

export const caseStudy = (slug: string) => CASE_STUDIES.find((c) => c.slug === slug);
