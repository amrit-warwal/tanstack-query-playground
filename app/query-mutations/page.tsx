'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchPosts, createPost } from '../lib/api'

// Demonstrates the read + write loop: a useQuery to show the list, a
// useMutation to add to it, and invalidation to keep the list fresh.
export default function QueryMutationsPage() {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')

  const { data } = useQuery({ queryKey: ['posts'], queryFn: fetchPosts })

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      // Tell Query the ['posts'] cache is stale — it refetches automatically.
      // This is the bread-and-butter pattern: mutate, then invalidate.
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      setTitle('')
    },
  })

  return (
    <>
      <Link href="/" className="back-link">
        ← All examples
      </Link>
      <h1>Mutations + invalidation</h1>
      <p className="lead">
        Create a post with <code>useMutation</code>, then{' '}
        <code>invalidateQueries</code> so the list refetches. (JSONPlaceholder
        fakes the write, so the new item won&apos;t truly persist — watch the
        network tab and devtools to see the flow.)
      </p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault()
          if (title.trim()) mutation.mutate({ title, body: 'Written from the playground.' })
        }}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New post title…"
        />
        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving…' : 'Add post'}
        </button>
      </form>

      {mutation.isError && (
        <p className="status">Error: {mutation.error.message}</p>
      )}
      {mutation.isSuccess && (
        <p className="status">Created post #{mutation.data.id} ✓</p>
      )}

      <p className="status">{data?.length ?? 0} posts</p>
      {data?.slice(0, 8).map((post) => (
        <div key={post.id} className="card">
          <h3>{post.title}</h3>
        </div>
      ))}
    </>
  )
}
