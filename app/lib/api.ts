// Shared data layer for all examples. We hit JSONPlaceholder, a free fake REST
// API, so nobody needs credentials or a backend to run these.
//
// Keeping fetchers in one place (not inline in components) is the pattern worth
// copying: query keys and fetchers stay in sync, and they're reusable for
// server-side prefetching too.

const BASE = 'https://jsonplaceholder.typicode.com'

export interface Post {
  userId: number
  id: number
  title: string
  body: string
}

export async function fetchPosts(): Promise<Post[]> {
  const res = await fetch(`${BASE}/posts`)
  if (!res.ok) throw new Error('Failed to fetch posts')
  return res.json()
}

export async function fetchPostsPage({
  page,
  limit = 10,
}: {
  page: number
  limit?: number
}): Promise<Post[]> {
  const res = await fetch(`${BASE}/posts?_page=${page}&_limit=${limit}`)
  if (!res.ok) throw new Error('Failed to fetch posts page')
  return res.json()
}

export async function createPost(input: {
  title: string
  body: string
}): Promise<Post> {
  const res = await fetch(`${BASE}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...input, userId: 1 }),
  })
  if (!res.ok) throw new Error('Failed to create post')
  // NOTE: JSONPlaceholder fakes writes — it echoes back a new id (101) but
  // doesn't actually persist. Good enough to demo the mutation flow.
  return res.json()
}
