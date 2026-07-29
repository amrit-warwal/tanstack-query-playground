# Notes — Basic query

## The point
The minimum viable `useQuery`. Data is fetched **in the browser** after the
component mounts, so you get a loading flash on first paint. That's fine for
dashboards behind auth; it's not great for public/SEO pages — for those, see
example 2 (server prefetch + hydration).

## Things worth knowing
- **`queryKey` is the cache identity.** `['posts']` here. Anything with the same
  key shares the same cache entry across the whole app. Keep keys in a
  predictable shape (array, most-specific-last).
- **`isPending` vs `isFetching`.** `isPending` = no data yet (first load).
  `isFetching` = a request is in flight *right now*, including background
  refetches when data already exists. Show `isPending` for the big spinner,
  `isFetching` for a subtle "refreshing" indicator.
- **The fetcher lives in `lib/api.ts`, not inline.** So the exact same function
  can be reused for server prefetching in example 2.

## Common mistake
Putting `"use client"` too high (e.g. on the layout) so everything becomes a
client component. Only the component that actually calls the hook needs it.
