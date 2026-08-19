import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { EXAMPLE_SOURCES } from '../../lib/example-sources'
import { highlight, type Token } from '../../lib/highlight'

// Serves an example's own source files to the "View source code" overlay,
// already tokenized for syntax highlighting.
//
// The client sends `?example=query-basic` — a key, never a path. Anything not
// in EXAMPLE_SOURCES is a 404, so there is no traversal surface. The resolve +
// prefix check below is belt-and-braces in case the map itself ever grows a
// bad entry.
//
// Highlighting happens HERE rather than in the browser, so no tokenizer code
// ships to the client. See app/lib/highlight.ts.
//
// Route Handlers are dynamic by default, so no `dynamic` export is needed.

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get('example') ?? ''
  const entries = Object.prototype.hasOwnProperty.call(EXAMPLE_SOURCES, slug)
    ? EXAMPLE_SOURCES[slug]
    : undefined

  if (!entries) {
    return Response.json({ error: `Unknown example: ${slug}` }, { status: 404 })
  }

  // The literal 'app' segment matters. With a fully dynamic path, Turbopack's
  // static analysis traces the WHOLE project into the server bundle and fails
  // the build; scoping to a known subfolder keeps the trace to app/.
  const appDir = path.join(process.cwd(), 'app')

  try {
    const files = await Promise.all(
      entries.map(async (entry) => {
        const abs = path.join(appDir, entry.path)
        if (!abs.startsWith(appDir + path.sep)) {
          throw new Error(`Refusing to read outside app/: ${entry.path}`)
        }
        const name = path.basename(entry.path)
        const code = await readFile(abs, 'utf8')

        // Highlighting is decoration. If the tokenizer ever throws, this file
        // still opens as plain text instead of taking the whole overlay down —
        // and per-file, so one bad file can't blank the other tabs.
        let tokens: Token[]
        try {
          tokens = highlight(code, name)
        } catch (err) {
          console.error(`[source] highlight failed for ${name}:`, err)
          tokens = [['plain', code]]
        }

        // Only `tokens` goes over the wire. Sending `code` too would ship the
        // whole source twice, and since the fallback above is itself a single
        // plain token, the client never needs the raw string.
        return { name, tokens, note: entry.note, shared: entry.shared }
      }),
    )
    return Response.json({ files })
  } catch (err) {
    // The response stays vague so fs paths and stack traces don't reach the
    // browser — but log it, or a mis-registered path in EXAMPLE_SOURCES is an
    // opaque 500 with nothing to debug from.
    console.error(`[source] could not read files for "${slug}":`, err)
    return Response.json({ error: 'Could not read source files' }, { status: 500 })
  }
}
