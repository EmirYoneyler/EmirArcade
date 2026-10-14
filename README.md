# EMIR-1 — a portfolio you can walk into

A cozy, late-night arcade room built with React Three Fiber. Every object
does something. EMIR-1, the big cabinet on its own stage, boots straight
into one of two playable games (RALLY or PATROL). Each project is a
cassette tape on the rack beside it: pick one and it flies into EMIR-1's
tape deck, the CRT reads it, and the camera dives into the screen to show
the project. The site
always opens in the arcade; a plain, fast **classic view** with the same
content is one click away (and is what browsers without WebGL get).

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check, client build, pre-render the classic view
npm run preview   # serve dist/
```

## Edit your content

Everything you'd want to change lives in **`src/data/content.ts`**:
about, projects (title, pitch, status, role, highlights, stack, links,
screenshots), CV, contact, skills → project mapping for the claw machine,
and every line BYTE says. Both the 3D arcade and the classic view read
from it.

- **Screenshots / GIFs**: put files in `public/` and list them in a
  project's `media: ['/mymood-1.png']`. The CRT page tints them amber.
- **Site URL**: set `site.url` — it is used for canonical / Open Graph
  tags, `robots.txt` and `sitemap.xml`.
- **OG image**: `public/og.jpg` (1200×630), rendered from the real scene.

## How it's put together

```
src/
  data/content.ts       all copy           data/secrets.ts   the 12 secrets
  theme/palette.ts      the only colours   config/camera.ts  poses, room size
  store/useApp.ts       Zustand: view, mode, dialog, secrets, sound…
  flow.ts               navigation (room → cabinet → loading → project)
  cameraBridge.ts       UI → camera without importing three.js
  mode.ts               arcade first; classic only without WebGL
  App.tsx               classic view, or lazy ArcadeApp + boot screen
  ArcadeApp.tsx         arcade UI shell, lazy-loads the 3D Scene
  classic/              classic view (also pre-rendered at build time)
  ui/                   HUD, dialog box, CRT project page, panels, boot
  audio/                synthesized SFX (Howler), original chiptune (Web Audio)
  scene/
    Scene.tsx Room.tsx Arcade.tsx Props.tsx Lighting.tsx Effects.tsx
    CameraRig.tsx flight.ts      GSAP camera moves, parallax
    Interactive.tsx actions.ts   hover/outline/tooltip, what each click does
    crt/                         CRT shader + pixel programs (attract, games, loading)
    parts/                       one component per object (Tapes.tsx: rack + tape flight)
    materials/                   toon / glow materials, canvas textures
```

**Swapping in Blender models**: each object in `scene/parts/` is
self-contained with its origin on the floor (or wall), facing +z. Replace
the primitives inside with `useGLTF('/models/x.glb')` and keep the
component's props and its `usePulse(...)` animation hook.

## Performance notes

- First paint loads ~55 kB (gzip) of JS; three.js and friends load only in
  arcade mode. Classic mode never downloads them.
- dpr is capped at 1.5 and drops to 1 (then cheaper post-processing) when
  `PerformanceMonitor` sees low frame rates. Rendering pauses while a
  project page covers the canvas.
- The floor is instanced; only large objects cast shadows. Roughly 300
  draw calls per frame including shadows and post-processing. If you need
  more headroom, merge the static props with `mergeGeometries`.

## Accessibility

Tab walks every object in the room (focus shows the same outline as
hover) and every cartridge in the menu; Enter activates, Esc goes back.
`prefers-reduced-motion` cuts camera flights, parallax, typing and dust.
The jukebox starts on the visitor's first click or key press (browsers
block audio before that); the speaker button mutes it, and a mute is
remembered. A skip link jumps to the classic view.

## Deploy (Vercel)

Import the repo in Vercel — `vercel.json` sets the build command, output
directory and long-lived caching for hashed assets. No env vars needed.
