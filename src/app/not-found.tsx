import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          404
        </p>
        <h1 className="mt-3 font-serif text-5xl">Nothing here.</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          That page has drifted out with the tide.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-md bg-primary px-5 py-2.5 text-sm text-primary-foreground"
        >
          Back home
        </Link>
      </div>
    </div>
  )
}
