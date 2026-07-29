import Link from 'next/link'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '../get-query-client'
import { fetchPosts } from '../lib/api'
import Posts from './posts'

// This is a SERVER component (no "use client"). It runs on the server, where we
// prefetch the query into a per-request QueryClient, then serialize that cache
// with `dehydrate` and pass it through <HydrationBoundary>.
//
// The client component <Posts> below calls useQuery with the SAME queryKey and
// finds the data already in the cache — so there's no loading flash and the
// HTML is fully rendered on the server.
export default async function QueryHydrationPage() {
  const queryClient = getQueryClient()

  // Prefetch on the server. `await` here means the data is ready before we
  // render; drop the await (and rely on the pending-dehydration config) if you
  // want to stream instead.
  await queryClient.prefetchQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  })

  return (
    <>
      <Link href="/" className="back-link">
        ← All examples
      </Link>
      <h1>
        Server prefetch + hydration <span className="badge">App Router</span>
      </h1>
      <p className="lead">
        Data is fetched on the server and handed to the client already warm. View
        source — the posts are in the initial HTML.
      </p>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <Posts />
      </HydrationBoundary>
    </>
  )
}
