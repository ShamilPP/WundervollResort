'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Hotel, Mail, Lock, ChevronRight } from 'lucide-react'

import { GoogleButton } from '@/components/auth/google-button'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const callbackUrl = params.get('callbackUrl') ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    setSubmitting(false)

    if (res?.error) {
      setError('Invalid email or password.')
      return
    }
    toast.success('Welcome back to the sanctuary')
    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-10"
      >
        {/* Branding */}
        <div className="text-center space-y-4">
          <Link href="/" className="inline-block group">
            <div className="h-16 w-16 bg-white border border-obsidian/5 rounded-3xl flex items-center justify-center text-accent shadow-sm group-hover:bg-accent group-hover:text-white transition-all duration-500">
              <Hotel className="h-8 w-8" />
            </div>
          </Link>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-accent" />
              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-accent">Account Access</span>
              <div className="h-px w-8 bg-accent" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-obsidian tracking-tighter">Welcome <span className="text-accent italic font-light">Back</span></h1>
            <p className="text-sm font-light text-obsidian/40 italic">{"\"Sign in to manage your bookings and stay details.\""}</p>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] border border-obsidian/5 p-6 md:p-10 shadow-sm space-y-8">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl bg-red-50 border border-red-100 p-4 text-center"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-red-600">{error}</p>
            </motion.div>
          )}

          <GoogleButton callbackUrl={callbackUrl} label="Sign in with Google" />

          <div className="relative flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-obsidian/20">
            <div className="h-px flex-1 bg-obsidian/5" />
            <span>OR EMAIL</span>
            <div className="h-px flex-1 bg-obsidian/5" />
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-4">
              <Field label="Email Address" icon={Mail}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Your email address"
                  className={inputCls}
                />
              </Field>
              <Field label="Password" icon={Lock}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className={inputCls}
                />
              </Field>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="group flex items-center justify-center gap-3 w-full rounded-2xl bg-accent py-6 text-[11px] font-black uppercase tracking-[0.3em] text-white transition-all duration-500 hover:bg-accent active:scale-95 shadow-xl shadow-obsidian/10"
            >
              {submitting ? 'Signing in…' : 'Sign In'}
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>
        </div>

        <div className="text-center space-y-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-obsidian/30">
            New Guest?{' '}
            <Link href="/signup" className="text-accent hover:underline underline-offset-4">
              Register your stay —
            </Link>
          </p>
          <p className="text-[9px] font-medium text-obsidian/20 uppercase tracking-[0.4em]">
            © Wundervoll Resort · Security Protocols Active
          </p>
        </div>
      </motion.div>
    </main>
  )
}

function Field({ label, icon: Icon, children }: { label: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <Icon className="h-3 w-3 text-accent" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-obsidian/40">{label}</span>
      </div>
      {children}
    </div>
  )
}

const inputCls = "w-full rounded-2xl border border-obsidian/5 bg-[#FDFCFB] px-6 py-4 text-sm font-bold text-obsidian placeholder:text-obsidian/10 focus:outline-none focus:border-accent transition-all duration-300"
