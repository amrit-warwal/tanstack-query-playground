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
4. Add a row to the list in `app/page.tsx` and the table above.

## Packages (deliberately few)

Runtime: `next`, `react`, `react-dom`, `@tanstack/react-query`. Dev-only:
`@tanstack/react-query-devtools`, `typescript`, and types. That's it.

Data comes from [JSONPlaceholder](https://jsonplaceholder.typicode.com) — a free
fake API, so no backend or credentials needed to run the examples.
