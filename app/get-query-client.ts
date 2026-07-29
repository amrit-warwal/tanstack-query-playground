import {
  QueryClient,
  isServer,
  defaultShouldDehydrateQuery,
} from '@tanstack/react-query'

// Factory for a fresh QueryClient. Kept separate so both the server and the
// browser can create one with identical defaults.
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR we usually want a non-zero staleTime so the client doesn't
        // immediately refetch data that was just prefetched on the server.
        staleTime: 60 * 1000,
      },
      dehydrate: {
        // Also dehydrate queries that are still pending, so streaming +
        // prefetch-without-await works. (Default only dehydrates settled ones.)
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

// GOTCHA: on the server, always make a brand-new client per request so data
// never leaks between users. In the browser, reuse a singleton so we don't
// blow away the cache on re-renders (e.g. React suspense).
export function getQueryClient() {
  if (isServer) {
    return makeQueryClient()
  }
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}
