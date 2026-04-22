'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Error
        </p>
        <h1 className="mt-3 font-serif text-4xl">Something went wrong.</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          {error.message || 'An unexpected error occurred.'}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-md bg-primary px-5 py-2.5 text-sm text-primary-foreground"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-md border px-5 py-2.5 text-sm hover:bg-muted"
          >
            Back home
          </Link>
        </div>
      </div>
    </div>
  )
}
