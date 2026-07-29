import type { Metadata } from 'next'
import Link from 'next/link'
import Providers from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'TanStack Query Playground',
  description: 'Internal examples for learning TanStack Query with Next.js App Router',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <header className="site-header">
            <Link href="/" className="site-title">
              TanStack Query Playground
            </Link>
          </header>
          <main className="container">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
