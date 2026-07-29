# Notes — Infinite scroll

## The shape of the data
`useInfiniteQuery` doesn't give you a flat array. `data.pages` is an array of
pages (each the result of one `queryFn` call), and `data.pageParams` tracks the
param used for each. Flatten with `data.pages.flat()` for rendering.

## The three required bits
- **`initialPageParam`** — the param for the first page (here `1`).
- **`queryFn: ({ pageParam }) => ...`** — receives the current page param.
- **`getNextPageParam: (lastPage, allPages) => ...`** — returns the next param,
  or `undefined` to signal "no more pages" (which sets `hasNextPage` to false).
  Returning `undefined` is how you stop; forgetting it = infinite fetches.

## Turning the button into real infinite scroll
Replace the "Load more" button with an `IntersectionObserver` on a sentinel div
at the bottom of the list; call `fetchNextPage()` when it enters the viewport.
Guard with `hasNextPage && !isFetchingNextPage` so you don't fire duplicate
requests.

## Gotcha
`isFetchingNextPage` is separate from `isFetching`. Use it to disable the button
/ show the bottom spinner without affecting the rest of the UI.
