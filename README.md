# TanStack Query Playground

Internal, runnable examples for learning **TanStack Query** with **Next.js App
Router**. Built as *one app with one `package.json`* — each example is a route,
so there's a single `pnpm install` and a single dev server. No monorepo, no
per-example packages.

## Run it

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000 — the home page lists every example.

## Examples

| # | Route | What it teaches |
|---|-------|-----------------|
| 1 | [`/query-basic`](app/query-basic) | The simplest `useQuery` in a client component. Loading / error / data states. |
| 2 | [`/query-hydration`](app/query-hydration) | **The App Router pattern** — prefetch on the server, hand off with `HydrationBoundary`. No loading flash. |
| 3 | [`/query-mutations`](app/query-mutations) | `useMutation` + `invalidateQueries` to keep a list fresh after a write. |
| 4 | [`/query-infinite`](app/query-infinite) | `useInfiniteQuery` with "Load more" pagination. |

Each example folder has a **`notes.md`** capturing the gotchas and the "why" —
that's the part that goes beyond the official docs.

## How it's wired

- **`app/get-query-client.ts`** — the QueryClient factory. New client per request
  on the server (no data leaks), singleton in the browser. This is where the
  SSR-safety rules live.
- **`app/providers.tsx`** — `"use client"` wrapper mounting `QueryClientProvider`
  + Devtools, used from the root layout.
- **`app/lib/api.ts`** — all data fetchers in one place, so query keys and
  fetchers stay in sync and can be reused for server prefetching.

## Adding an example

1. Create `app/<your-example>/page.tsx` (add `"use client"` only if it uses hooks).
2. Add the fetcher to `app/lib/api.ts`.
3. Drop a `notes.md` next to it with the gotchas.
4. Register its files in `app/lib/example-sources.ts`, and drop
   `<ViewSource example="<your-example>" />` under the `.lead` paragraph.
5. Add a row to the list in `app/page.tsx` and the table above.

## View source code

Every example has a **View Source Code** link under its description that opens
its own source — plus its `notes.md` — in an overlay, so the code and the "why"
are one click from the running demo.

After the example's own files, and separated by a divider in the tab row, come
the **shared** files it leans on: `app/lib/api.ts` (the fetcher behind the
query) and `app/components/view-source.tsx` (the overlay itself). A `page.tsx`
on its own only tells half the story — the fetch it calls lives elsewhere. Add
a file to the `SHARED` list in `app/lib/example-sources.ts` and every example
picks it up.

`app/api/source/route.ts` serves the files and `app/lib/example-sources.ts` is
the allowlist of what it may read. The browser sends an example *slug*, never a
path, so there's no traversal surface.

The overlay fetches with `useQuery` and `enabled: open`, which makes the feature
its own small lazy-query example — nothing is requested until you click, and
it's cached per example after that. Worth watching in the Devtools.

Highlighting is a small tokenizer in `app/lib/highlight.ts`, not a library:
Shiki would have cost ~14 MB installed and three dependencies for four short
files. It runs on the server and emits tokens rather than HTML, so no
highlighter code reaches the browser and the client renders each token as a
`<span>` — React escapes those, so there's no `dangerouslySetInnerHTML` and no
hand-rolled HTML escaping to get wrong. Being a regex tokenizer it will mis-read
genuinely ambiguous syntax (a regex literal vs. division); that's a cosmetic
limitation, noted in the file. Comments render at full `--muted` weight rather
than the dim grey most dark themes use — in this repo the comments are the lesson.

## Packages (deliberately few)

Runtime: `next`, `react`, `react-dom`, `@tanstack/react-query`. Dev-only:
`@tanstack/react-query-devtools`, `typescript`, and types. That's it.

Data comes from [JSONPlaceholder](https://jsonplaceholder.typicode.com) — a free
fake API, so no backend or credentials needed to run the examples.
