// Which files the "View source code" overlay is allowed to serve, per example.
//
// Server-side only — imported by app/api/source/route.ts and nothing else. In a
// bigger app you'd add the `server-only` package and `import 'server-only'` here
// so an accidental client import fails the build; skipped here to keep the
// dependency list as short as the README claims.
//
// SECURITY: this map is the whole defence. The browser sends an example *slug*
// ("query-basic"), never a path, so there is no user-controlled string anywhere
// near the filesystem. Sanitising a caller-supplied path instead ("strip ..")
// is the version that gets you a traversal bug — `....//` defeats naive strip,
// and path.normalize alone doesn't help.

export interface SourceEntry {
  /**
   * Path relative to `app/` — NOT to the repo root. The route handler joins
   * this onto a literal `app` segment, which keeps Turbopack's static analysis
   * happy: a fully dynamic `path.resolve(process.cwd(), anything)` makes it
   * trace the entire project into the server bundle, and it fails the build
   * rather than let that happen quietly.
   */
  path: string
  /** One-line "what this file is", shown above the code. */
  note?: string
}

const NOTES_BLURB = 'The gotchas — the part beyond the docs.'

export const EXAMPLE_SOURCES: Record<string, SourceEntry[]> = {
  'query-basic': [
    { path: 'query-basic/page.tsx' },
    { path: 'query-basic/notes.md', note: NOTES_BLURB },
  ],
  // page.tsx first: the server side is where the story starts, and the split
  // between these two files IS the lesson on this page.
  'query-hydration': [
    {
      path: 'query-hydration/page.tsx',
      note: 'Server Component — prefetches, then dehydrates the cache.',
    },
    {
      path: 'query-hydration/posts.tsx',
      note: 'Client Component — same queryKey, reads the hydrated cache.',
    },
    { path: 'query-hydration/notes.md', note: NOTES_BLURB },
  ],
  'query-mutations': [
    { path: 'query-mutations/page.tsx' },
    { path: 'query-mutations/notes.md', note: NOTES_BLURB },
  ],
  'query-infinite': [
    { path: 'query-infinite/page.tsx' },
    { path: 'query-infinite/notes.md', note: NOTES_BLURB },
  ],
}
