# Notes — Mutations + invalidation

## The core loop
`useMutation` for the write, then in `onSuccess` call
`queryClient.invalidateQueries({ queryKey: ['posts'] })`. Invalidation marks the
cache stale and triggers a refetch, so your list reflects the change without you
manually editing the cache.

## Things worth knowing
- **`mutate` vs `mutateAsync`.** `mutate` is fire-and-forget with callbacks
  (`onSuccess`/`onError`). `mutateAsync` returns a promise you can `await` — but
  then YOU own the try/catch, or an unhandled rejection escapes. Prefer `mutate`
  unless you specifically need to await.
- **`useQueryClient()` must be called inside a component** (it reads context).
  You can't grab the client at module scope.
- **Invalidate vs setQueryData.** Invalidation refetches (a round trip, always
  correct). `setQueryData` writes the cache directly (instant, no request) — the
  basis for optimistic updates. Start with invalidation; reach for optimistic
  updates only when the UX needs it.

## Where to go next
Optimistic updates: `onMutate` snapshots the cache and writes the new value
immediately, `onError` rolls back, `onSettled` invalidates. More moving parts —
add it once the simple invalidate flow is understood.
