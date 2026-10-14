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
  ogImage: '/og.png',
}
