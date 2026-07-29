'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchPosts } from '../lib/api'

// Client component. It calls useQuery with the exact same queryKey the server
// prefetched (['posts']). Because <HydrationBoundary> already seeded the cache,
// `data` is populated on the very first render — no loading state on load.
export default function Posts() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  })

  // In practice this branch won't show on initial load thanks to hydration,
  // but keep it — it still runs on client-side navigations to this route.
  if (isPending) return <p className="status">Loading…</p>
  if (isError) return <p className="status">Error: {error.message}</p>

  return (
    <>
      <p className="status">{data.length} posts (prefetched on the server)</p>
      {data.slice(0, 10).map((post) => (
        <div key={post.id} className="card">
          <h3>{post.title}</h3>
          <p>{post.body}</p>
        </div>
      ))}
    </>
  )
}
