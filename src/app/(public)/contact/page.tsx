import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export const metadata: Metadata = {
  title: 'Contact · Wundervoll Resort',
}

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24">
        <div className="container py-16">
          <div className="mx-auto max-w-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Contact
            </p>
            <h1 className="mt-3 font-serif text-5xl">Get in touch.</h1>
            <p className="mt-6 text-muted-foreground">
              For reservations, private events, and press, write to us below.
            </p>

            <div className="mt-10 space-y-2 text-sm">
              <p><strong>Email:</strong> stay@wundervoll.com</p>
              <p><strong>Phone:</strong> +91 9000 000 000</p>
              <p><strong>Address:</strong> Konkan Coast, Maharashtra, India</p>
            </div>

            <form className="mt-10 space-y-4 rounded-lg border bg-card p-6">
              <input className={ic} placeholder="Your name" />
              <input type="email" className={ic} placeholder="Email" />
              <textarea rows={4} className={`${ic} resize-none`} placeholder="Message" />
              <button type="button" className="w-full rounded-md bg-primary py-2.5 text-sm text-primary-foreground">
                Send message
              </button>
              <p className="text-center text-xs text-muted-foreground">
                Form submission is stubbed until the email provider is configured.
              </p>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

const ic = 'w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
