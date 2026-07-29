'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { fetchPosts } from '../lib/api'

// The simplest possible example: a client component that fetches on mount.
// Everything happens in the browser — no server prefetch here (see example 2
// for that). This is the mental model to start from.
export default function QueryBasicPage() {
  const { data, isPending, isError, error, isFetching } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  })

  return (
    <>
      <Link href="/" className="back-link">
        ← All examples
      </Link>
      <h1>Basic query</h1>
      <p className="lead">
        A client-side <code>useQuery</code>. Note the three states:{' '}
        <code>isPending</code>, <code>isError</code>, and success.
      </p>

      {isPending && <p className="status">Loading…</p>}
      {isError && <p className="status">Error: {error.message}</p>}

      {data && (
        <>
          <p className="status">
            {data.length} posts {isFetching && '· refetching…'}
          </p>
          {data.slice(0, 10).map((post) => (
            <div key={post.id} className="card">
              <h3>{post.title}</h3>
              <p>{post.body}</p>
            </div>
          ))}
        </>
      )}
    </>
  )
}
