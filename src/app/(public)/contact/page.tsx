import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import * as motion from 'framer-motion/m'

export const metadata: Metadata = {
  title: 'Contact · Wundervoll Resort',
}

export default function ContactPage() {
  return (
    <div className="bg-[#FDFCFB] min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="container max-w-6xl">

          {/* Header Section */}
          <div className="mb-20 space-y-6 text-center">
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-12 bg-accent" />
              <span className="text-[11px] font-black uppercase tracking-[0.8em] text-accent">
                Concierge
              </span>
              <div className="h-px w-12 bg-accent" />
            </div>

            <h1 className="font-serif text-6xl md:text-8xl text-obsidian tracking-tighter leading-none">
              Let’s Begin a <br />
              <span className="text-accent italic font-light">Conversation</span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg font-light text-obsidian/40 italic">
              {"\"For reservations, private events, or simply to learn more about our philosophy, our team is here to assist you.\""}
            </p>
          </div>

          <div className="grid gap-16 lg:grid-cols-12 items-start">

            {/* Contact Details Manifesto */}
            <div className="lg:col-span-5 space-y-12">
              <div className="space-y-10">
                <ContactCard
                  icon={Mail}
                  label="Email Us"
                  value="stay@wundervoll.com"
                  description="General inquiries & reservations"
                />
                <ContactCard
                  icon={Phone}
                  label="Call Us"
                  value="+91 9000 000 000"
                  description="Direct line to our concierge"
                />
                <ContactCard
                  icon={MapPin}
                  label="Visit Us"
                  value="Konkan Coast, India"
                  description="Maharashtra, India — View on Map"
                />
              </div>

              <div className="bg-obsidian text-white rounded-[2.5rem] p-10 shadow-2xl space-y-6 border border-white/5">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Our Promise</p>
                <p className="font-serif text-2xl leading-relaxed text-accent">
                  {"\"Every inquiry is treated with the same care and attention as a guest at our resort.\""}
                </p>
                <p className="text-xs font-light text-white/40 italic">Response time: Usually within 2 hours</p>
              </div>
            </div>

            {/* Inquiry Form */}
            <div className="lg:col-span-7">
              <form className="bg-white rounded-[2.5rem] border border-obsidian/5 p-12 shadow-sm space-y-8">
                <div className="grid gap-8 sm:grid-cols-2">
                  <Field label="Full Name">
                    <input className={ic} placeholder="Your name" />
                  </Field>
                  <Field label="Email Address">
                    <input type="email" className={ic} placeholder="you@example.com" />
                  </Field>
                </div>

                <Field label="Subject">
                  <select className={ic}>
                    <option>General Inquiry</option>
                    <option>Room Reservation</option>
                    <option>Private Event</option>
                    <option>Media & Press</option>
                  </select>
                </Field>

                <Field label="Message">
                  <textarea rows={6} className={`${ic} resize-none`} placeholder="How can we assist you?" />
                </Field>

                <button type="button" className="group flex items-center justify-center gap-3 w-full rounded-2xl bg-accent py-6 text-[11px] font-black uppercase tracking-[0.3em] text-white transition-all duration-500 hover:bg-accent active:scale-95 shadow-xl">
                  <Send className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  Send Inquiry
                </button>

                <p className="text-center text-[10px] font-bold uppercase tracking-widest text-obsidian/20">
                  Your information is protected by our privacy policy.
                </p>
              </form>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function ContactCard({ icon: Icon, label, value, description }: { icon: any, label: string, value: string, description: string }) {
  return (
    <div className="flex gap-6 group">
      <div className="h-14 w-14 rounded-3xl bg-white border border-obsidian/5 flex items-center justify-center text-accent shadow-sm transition-all group-hover:bg-accent group-hover:text-white group-hover:-rotate-3">
        <Icon className="h-6 w-6" />
      </div>
      <div className="space-y-1 pt-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-obsidian/20">{label}</p>
        <p className="text-xl font-bold text-obsidian">{value}</p>
        <p className="text-xs text-obsidian/40 italic font-light">{description}</p>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-3">
      <span className="text-[11px] font-black uppercase tracking-[0.3em] text-obsidian/30">{label}</span>
      {children}
    </label>
  )
}

const ic = 'w-full rounded-2xl border border-obsidian/5 bg-[#FDFCFB] px-6 py-4 text-sm font-bold text-obsidian placeholder:text-obsidian/20 focus:outline-none focus:border-accent transition-all duration-300'
