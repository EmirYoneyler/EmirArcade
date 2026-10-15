/**
 * All site copy lives here. Edit freely — both the 3D arcade and the
 * classic view read from this single file.
 */

export type Status = 'LIVE' | 'IN DEV' | 'DONE'

export type Project = {
  id: string
  title: string
  pitch: string
  status: Status
  role: string
  about: string
  highlights: string[]
  stack: string[]
  links: { label: string; href: string }[]
  /** Drop screenshot/GIF paths (in /public) here. */
  media: string[]
  /** Short cartridge label for the SELECT GAME menu (max ~14 chars). */
  cartridge: string
}

export const about = {
  name: 'Emir Yöneyler',
  title: 'Software Engineer',
  location: 'Istanbul, Türkiye',
  summary:
    'Computer Science student at Istanbul Aydın University. I build backends in Java/Spring Boot and Go, and full-stack products with React and Python. Currently interning on an AI photo booth, with freelance web projects on the side.',
  email: 'emiryoneyler@gmail.com',
  github: [
    { label: 'EmirYoneyler', href: 'https://github.com/EmirYoneyler' },
  ],
}

export const skills = ['Go', 'Java', 'Python', 'React', 'PostgreSQL', 'Docker'] as const
export type Skill = (typeof skills)[number]

/** Which projects use which skill — BYTE reads this out at the claw machine. */
export const skillProjects: Record<Skill, string[]> = {
  Go: ['mymood', 'alagems'],
  Java: ['bulletin-service'],
  Python: ['coachai', 'critic-que', 'uniasistan'],
  React: ['critic-que'],
  PostgreSQL: ['mymood', 'bulletin-service', 'uniasistan'],
  Docker: ['mymood', 'critic-que', 'bulletin-service'],
}

const gh = (repo: string) => ({ label: 'GitHub', href: `https://github.com/EmirYoneyler/${repo}` })

/**
 * The tapes on the rack, in order: the two live sites, then the pinned repos
 * on github.com/EmirYoneyler. `media` paths point into /public/projects.
 */
export const projects: Project[] = [
  {
    id: 'mymood',
    title: 'MyMood',
    cartridge: 'MYMOOD',
    pitch: 'A social mood tracker: rate your day 1–10 and see how your friends are doing.',
    status: 'LIVE',
    role: 'Solo developer — design, backend, deploy',
    about:
      'Users score their day, add friends and follow a feed of their days. One Go binary serves everything: server-rendered pages with HTMX, no separate frontend build.',
    highlights: [
      'Single Go + Fiber binary; HTMX and hand-written CSS, mobile-first with light/dark themes',
      'Hand-written, parameterised SQL with pgx (no ORM); migrations embedded and run on boot',
      'JWT sessions in HttpOnly, SameSite=Strict cookies; bcrypt; rate-limited login and register',
      'Premium-ready: subscription column and middleware already in place',
    ],
    stack: ['Go', 'Fiber', 'HTMX', 'PostgreSQL (Neon)', 'pgx', 'JWT', 'Docker', 'Render'],
    links: [{ label: 'Live site', href: 'https://mymood-5bh2.onrender.com/' }, gh('mymood2')],
    media: ['/projects/mymood/home.jpg', '/projects/mymood/register.jpg', '/projects/mymood/mobile.jpg'],
  },
  {
    id: 'alagems',
    title: 'ALAGEMS',
    cartridge: 'ALAGEMS',
    pitch: 'Website and backend for a valuable-cargo logistics company in Kazakhstan.',
    status: 'LIVE',
    role: 'Freelance — backend & admin',
    about:
      'Client work for ALAGEMS, a logistics hub for valuable cargo in Almaty. The public site runs in Russian and English; its content is managed through an admin CMS backed by a Go API.',
    highlights: [
      'Go + Fiber backend serving the site content and an admin CMS',
      'Russian / English content managed from the admin panel',
      'Live in production at alagems.kz',
      'Private client repository — code available on request',
    ],
    stack: ['Go', 'Fiber', 'Admin CMS', 'RU / EN'],
    links: [{ label: 'Live site', href: 'https://alagems.kz/' }],
    media: ['/projects/alagems/home.jpg', '/projects/alagems/services.jpg'],
  },
  {
    id: 'coachai',
    title: 'CoachAI',
    cartridge: 'COACHAI',
    pitch: 'A webcam fitness coach that counts your reps and checks your form.',
    status: 'DONE',
    role: 'Solo developer — computer vision & AI',
    about:
      'MediaPipe Pose tracks your joints through the webcam, joint angles drive a rep counter and form checks for squats, curls and push-ups, and GPT turns a recorded set into coaching feedback.',
    highlights: [
      'Real-time pose tracking with MediaPipe; skeleton overlay with OpenCV',
      'Angle-based rep counting and form feedback for squats, curls and push-ups',
      'Record a set, then get a GPT analysis of the movement data',
      'Add a new exercise by name — the AI suggests landmarks and angle thresholds',
    ],
    stack: ['Python', 'MediaPipe', 'OpenCV', 'NumPy', 'OpenAI API', 'Streamlit'],
    links: [gh('COACHAIprototip')],
    media: ['/projects/coachai/pose.jpg', '/projects/coachai/app.jpg'],
  },
  {
    id: 'critic-que',
    title: 'The Critic Que',
    cartridge: 'CRITIC QUE',
    pitch: 'Movie intelligence: IMDb, Letterboxd, Rotten Tomatoes, Metacritic and Reddit in one place.',
    status: 'DONE',
    role: 'Solo developer — full-stack',
    about:
      'Search any film and get enriched metadata, rating bars from five sources and review snippets with attribution — plus a Top 10 feed and director-focused discovery.',
    highlights: [
      'Multi-source rating bars and external review cards with source attribution',
      'Director discovery: click a director to load their best films',
      'Resilient scraping with fallbacks for when Letterboxd pages are blocked',
      'FastAPI backend with typed Pydantic models; React + Tailwind dashboard; Docker Compose',
    ],
    stack: ['Python', 'FastAPI', 'Pydantic', 'BeautifulSoup', 'React', 'Vite', 'Tailwind', 'Docker'],
    links: [gh('The-Critic-Que')],
    media: ['/projects/critic-que/home.jpg'],
  },
  {
    id: 'uniasistan',
    title: 'UniAsistan',
    cartridge: 'UNIASISTAN',
    pitch: 'A Turkish Q&A assistant for university regulations that cites the exact article.',
    status: 'IN DEV',
    role: 'Solo developer — AI / retrieval',
    about:
      "Students ask things like \"how many days is my internship?\" and get an answer grounded in Istanbul Aydın University's regulations, with the article it comes from.",
    highlights: [
      'PDF extraction and cleaning tuned for Turkish legal text',
      'Structure-aware chunking by article (MADDE)',
      'Planned: hybrid search (pgvector + full-text) with reranking and an evaluation set of real student questions',
      'Every answer cites its source article',
    ],
    stack: ['Python', 'PostgreSQL', 'pgvector', 'RAG', 'FastAPI (planned)'],
    links: [gh('uniasistan')],
    media: ['/projects/uniasistan/pipeline.jpg'],
  },
  {
    id: 'bulletin-service',
    title: 'Fund Bulletin Services',
    cartridge: 'BULLETIN SVC',
    pitch: 'Three Spring Boot microservices that publish investment-fund bulletins.',
    status: 'DONE',
    role: 'Solo developer — backend',
    about:
      'An auth-service issues JWTs and the bulletin-service manages fund data in PostgreSQL. A third pdf-service (iText7) is scaffolded to render the bulletin as a PDF.',
    highlights: [
      'Separate auth-service with JWT login and registration',
      'Fund CRUD over REST with Spring Data JPA and PostgreSQL',
      'pdf-service with iText7 scaffolded for the PDF bulletin (next step)',
      'Popular funds by size, search by name, filter by category',
      'Each service independently deployable; Dockerfile included',
    ],
    stack: ['Java 17', 'Spring Boot', 'Spring Security', 'PostgreSQL', 'JWT', 'iText7', 'Docker'],
    links: [
      { label: 'bulletin-service', href: 'https://github.com/EmirYoneyler/bulletin-service' },
      { label: 'auth-service', href: 'https://github.com/EmirYoneyler/auth-service' },
      { label: 'pdf-service', href: 'https://github.com/EmirYoneyler/pdf-service' },
    ],
    media: ['/projects/bulletin/architecture.jpg', '/projects/bulletin/api.jpg'],
  },
]

export const site = {
  url: 'https://emirarcade.vercel.app',
  ogImage: '/og.jpg',
}

/** CV shown when the cork board is clicked (and in the classic view). */
export const cv = {
  education: [
    { title: 'B.Sc. Computer Science', place: 'Istanbul Aydın University', when: 'in progress' },
  ],
  experience: [
    {
      title: 'Software Engineering Intern',
      place: 'AI photo booth',
      when: 'current',
      detail: 'Face-swap pipeline on Modal.com: 5–10 AI portrait templates per guest in ~10 seconds.',
    },
    {
      title: 'Freelance Web Developer',
      place: 'Self-employed',
      when: 'ongoing',
      detail: 'Backends and sites for clients — e.g. a Go/Fiber backend and admin CMS for a Kazakhstan logistics company.',
    },
  ],
  focus: ['Backend: Java / Spring Boot, Go / Fiber', 'Full-stack: React, Python / FastAPI', 'Data: PostgreSQL', 'Ops: Docker, Render, Modal'],
}

/**
 * BYTE's lines. {x} placeholders are filled in at runtime.
 * Keep them short — the dialog box types them out letter by letter.
 */
export const byteLines = {
  welcome: "Hi, I'm BYTE. Emir built this place, and the jukebox is already on (speaker up top to mute). Poke around — almost everything does something.",
  claw: 'Got one! {skill}. Emir used it in: {projects}.',
  clawNone: "Got one! {skill}. It's in the toolbox — just waiting for the right project.",
  jukeboxOn: 'Now playing: "{song}". Chiptune made for this room — no copyrights were harmed.',
  jukeboxMuted: "It's playing… but sound is off. Hit the speaker up in the corner.",
  jukeboxOff: 'Ahh, silence. The cat approves.',
  listeningNow: 'Right now Emir is listening to {title} by {artist}. Taste: approved.',
  listenedLast: 'The last thing Emir played was {title} by {artist}.',
  cat: ['Mrrp.', "That's Kernel. She's in sleep mode.", "Kernel doesn't do standups."],
  clock: "It's {time} in Istanbul right now.",
  window: 'Make a wish. Mine is more RAM.',
  cork: "Emir's CV. Pinned it up so it doesn't get lost.",
  sign: "Yes — Emir's open for work. Here's how to reach him.",
  plant: ['The plant is thriving. Mostly on screen light.', 'Watered by the monitor glow. Allegedly.'],
  switchOff: 'Lights out. Screens only — the proper way to play.',
  switchOn: "Lights back on. Don't tell the cat.",
  rally: 'RALLY is loaded. Up/Down or the mouse moves your paddle. Want a project instead? Grab a tape from the rack.',
  patrol: 'PATROL is loaded. Left/Right to move, Space to fire. Want a project instead? Grab a tape from the rack.',
  konami: 'Cheat code accepted. +30 lives. Emir would be proud.',
  allSecrets: "That's all 12 secrets. You're officially a regular here.",
}

export const contact = {
  pitch: 'Open to internships, junior backend roles and freelance projects.',
  email: about.email,
  links: about.github,
}
