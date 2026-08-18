'use client'

import Link from 'next/link'
import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchPostsPage } from '../lib/api'
import ViewSource from '../components/view-source'

const LIMIT = 10

// useInfiniteQuery manages a list of "pages" and knows how to fetch the next
// one. Here we drive it with a "Load more" button; swap that for an
// IntersectionObserver to get true infinite scroll.
export default function QueryInfinitePage() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['posts', 'infinite'],
    queryFn: ({ pageParam }) => fetchPostsPage({ page: pageParam, limit: LIMIT }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // JSONPlaceholder has 100 posts total. Stop when the last page came back
      // short (means we hit the end).
      if (lastPage.length < LIMIT) return undefined
      return allPages.length + 1
    },
  })

  // data.pages is an array of pages; flatten for rendering.
  const posts = data?.pages.flat() ?? []

  return (
    <>
      <Link href="/" className="back-link">
        ← All examples
      </Link>
      <h1>Infinite scroll</h1>
      <p className="lead">
        <code>useInfiniteQuery</code> with a &quot;Load more&quot; button.
        <code>getNextPageParam</code> computes the next page and returns{' '}
        <code>undefined</code> to signal the end.
      </p>
      <ViewSource example="query-infinite" />

      {isPending && <p className="status">Loading…</p>}
      {isError && <p className="status">Error: {error.message}</p>}

      {data && (
        <p className="status">
          {posts.length} posts across {data.pages.length} page(s)
        </p>
      )}

      {posts.map((post) => (
        <div key={post.id} className="card">
          <h3>{post.title}</h3>
        </div>
      ))}

      {data && (
        <div style={{ marginTop: 16 }}>
          <button
            onClick={() => fetchNextPage()}
            disabled={!hasNextPage || isFetchingNextPage}
          >
            {isFetchingNextPage
              ? 'Loading more…'
              : hasNextPage
                ? 'Load more'
                : 'No more posts'}
          </button>
        </div>
      )}
    </>
  )
}
