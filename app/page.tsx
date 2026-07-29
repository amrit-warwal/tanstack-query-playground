import Link from 'next/link'

const examples = [
  {
    href: '/query-basic',
    title: '1 · Basic query',
    desc: 'The simplest useQuery in a client component. Loading / error / data states.',
  },
  {
    href: '/query-hydration',
    title: '2 · Server prefetch + hydration',
    desc: 'The App Router pattern: prefetch on the server, hand off to the client with HydrationBoundary. No loading flash.',
  },
  {
    href: '/query-mutations',
    title: '3 · Mutations + invalidation',
    desc: 'useMutation to create data, then invalidate queries so the list refetches automatically.',
  },
  {
    href: '/query-infinite',
    title: '4 · Infinite scroll',
    desc: 'useInfiniteQuery with a "Load more" button and paginated fetching.',
  },
]

export default function Home() {
  return (
    <>
      <h1>TanStack Query Playground</h1>
      <p className="lead">
        Internal examples for learning TanStack Query with Next.js App Router.
        One app, one <code>package.json</code> — each example is a route. Read
        the code, and check the <code>notes.md</code> in each folder for the
        gotchas.
      </p>
      <ul className="example-list">
        {examples.map((ex) => (
          <li key={ex.href}>
            <Link href={ex.href} className="example-card">
              <h3>{ex.title}</h3>
              <p>{ex.desc}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
