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
    { label: 'realmeric', href: 'https://github.com/realmeric' },
  ],
}

export const skills = ['Go', 'Java', 'Python', 'React', 'PostgreSQL', 'Docker'] as const
export type Skill = (typeof skills)[number]

/** Which projects use which skill — BYTE reads this out at the claw machine. */
export const skillProjects: Record<Skill, string[]> = {
  Go: ['mymood', 'alagems'],
  Java: ['bulletin-service'],
  Python: ['coachai', 'photo-booth'],
  React: ['coachai'],
  PostgreSQL: ['mymood', 'bulletin-service'],
  Docker: ['photo-booth', 'bulletin-service'],
}

export const projects: Project[] = [
  {
    id: 'mymood',
    title: 'MyMood',
    cartridge: 'MYMOOD',
    pitch: 'A live social mood tracker.',
    status: 'LIVE',
    role: 'Solo developer — design, backend, deploy',
    about: 'Visitors log how they feel and watch the crowd mood update live.',
    highlights: ['Server-rendered with HTMX for instant updates', 'Neon serverless Postgres', 'GA4 analytics', 'Deployed on Render'],
    stack: ['Go', 'Fiber', 'HTMX', 'Tailwind', 'PostgreSQL (Neon)', 'Render', 'GA4'],
    links: [],
    media: [],
  },
  {
    id: 'coachai',
    title: 'CoachAI',
    cartridge: 'COACH AI',
    pitch: 'An AI fitness coach with in-browser pose detection.',
    status: 'DONE',
    role: 'Solo developer — full-stack',
    about: 'Counts and checks your reps from the webcam. Rebuilt from a Streamlit prototype into a real React + FastAPI app.',
    highlights: ['Pose detection runs in the browser (MediaPipe)', 'Async SQLAlchemy data layer', 'JWT auth', 'Progress charts with Recharts'],
    stack: ['React', 'FastAPI', 'MediaPipe', 'SQLAlchemy (async)', 'JWT', 'Recharts'],
    links: [],
    media: [],
  },
  {
    id: 'photo-booth',
    title: 'AI Photo Booth',
    cartridge: 'PHOTO BOOTH',
    pitch: 'Face swap onto AI portrait templates in about ten seconds.',
    status: 'IN DEV',
    role: 'Intern — backend & pipeline',
    about:
      "Internship project running on Modal.com. A guest's face is swapped onto 5–10 AI-generated portrait templates using classic (non-diffusion) face swap.",
    highlights: ['~10 second end-to-end turnaround', '5–10 templates per guest', 'Classic face swap, no diffusion at runtime', 'Serverless GPU on Modal'],
    stack: ['Python', 'Modal.com', 'Face swap'],
    links: [],
    media: [],
  },
  {
    id: 'bulletin-service',
    title: 'Bulletin Service',
    cartridge: 'BULLETIN SVC',
    pitch: 'A fintech-style Spring Boot microservice.',
    status: 'DONE',
    role: 'Solo developer — backend',
    about: 'Bulletin microservice with companion auth-service and pdf-service.',
    highlights: ['Separate auth-service issuing JWTs', 'pdf-service generating reports with iText7', 'PostgreSQL persistence'],
    stack: ['Java 17', 'Spring Boot', 'PostgreSQL', 'JWT', 'iText7'],
    links: [{ label: 'GitHub', href: 'https://github.com/EmirYoneyler/bulletin-service' }],
    media: [],
  },
  {
    id: 'alagems',
    title: 'ALAGEMS',
    cartridge: 'ALAGEMS',
    pitch: 'Backend for a Kazakhstan logistics company website.',
    status: 'IN DEV',
    role: 'Freelance — backend',
    about: 'Client work: API and admin CMS for a logistics company, in Russian and English.',
    highlights: ['Admin CMS', 'Russian / English content', 'Go + Fiber API'],
    stack: ['Go', 'Fiber'],
    links: [],
    media: [],
  },
]

export const site = {
  url: 'https://emir-arcade.vercel.app',
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
  welcome: "Hi, I'm BYTE. Emir built this place. Poke around — almost everything does something.",
  claw: 'Got one! {skill}. Emir used it in: {projects}.',
  clawNone: "Got one! {skill}. It's in the toolbox — just waiting for the right project.",
  jukeboxOn: 'Original chiptune — Emir wrote it. No copyrights were harmed.',
  jukeboxMuted: "It's playing… but sound is off. Hit the speaker up in the corner.",
  jukeboxOff: 'Ahh, silence. The cat approves.',
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
