# Notes — Server prefetch + hydration (the App Router pattern)

This is the one example that's genuinely different in Next.js App Router, and
the one people get wrong. Read this twice.

## The flow
1. **Server component** (`page.tsx`) creates a per-request QueryClient via
   `getQueryClient()`, calls `prefetchQuery`, then serializes the cache with
   `dehydrate(queryClient)`.
2. `<HydrationBoundary state={...}>` ships that serialized cache to the browser.
3. **Client component** (`posts.tsx`) calls `useQuery` with the **same
   queryKey**. It finds the prefetched data already in cache → renders instantly,
   no loading flash, and the posts are in the server-rendered HTML.

## The gotchas (all in `get-query-client.ts`)
- **New client per request on the server.** If you reuse one QueryClient across
  requests on the server, one user's data leaks into another's. `isServer ?
  makeQueryClient() : singleton`.
- **Singleton in the browser.** Do NOT make a new client on every render, or
  React Suspense re-renders wipe your cache. Reuse `browserQueryClient`.
- **Same queryKey + same queryFn on both sides.** The key is what links the
  prefetch to the `useQuery`. A typo in the key = cache miss = loading flash and
  a duplicate fetch. This is why the fetcher lives in `lib/api.ts`.
- **`staleTime > 0`.** With `staleTime: 0` the client immediately refetches the
  data the server just prefetched. We set 60s so it trusts the fresh data.

## await or not?
`await queryClient.prefetchQuery(...)` blocks render until data is ready (simple,
what we do here). Drop the `await` to stream — the `shouldDehydrateQuery`
override in `get-query-client.ts` (which also dehydrates *pending* queries) is
what makes streaming work.

## How to verify it's working
View page source (not devtools DOM) — you should see the post titles in the raw
HTML. And the React Query Devtools should show `['posts']` as already-fetched on
first paint, not loading.
