'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Percent, Save } from 'lucide-react'

export function SettingsForm({ initialAdvance }: { initialAdvance: number }) {
  const [advance, setAdvance] = useState(initialAdvance)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const promise = fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ advancePercentage: Number(advance) }),
    }).then(async (res) => {
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Save failed')
      return data
    })

    toast.promise(promise, {
      loading: 'Saving configuration settings...',
      success: () => {
        router.refresh()
        return 'Configuration successfully updated!'
      },
      error: (err) => (err as Error).message,
    })

    try {
      await promise
    } catch (err) {
      // Handled by toast.promise
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="rounded-2xl border border-obsidian/5 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Percent className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-obsidian">Advance Payment Setup</h3>
            <p className="text-xs text-obsidian/40">Control the percentage required to secure booking.</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-obsidian/40">
              Required Advance Deposit Percentage
            </span>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={advance}
                onChange={(e) => setAdvance(Number(e.target.value))}
                className="flex-1 accent-accent h-2 bg-[#FDFCFB] rounded-lg cursor-pointer border border-obsidian/5"
              />
              <div className="relative flex items-center w-24">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={advance}
                  onChange={(e) => setAdvance(Math.max(0, Math.min(100, Number(e.target.value))))}
                  className="w-full rounded-xl border border-obsidian/5 bg-[#FDFCFB] px-4 py-3 text-sm font-bold text-obsidian focus:outline-none focus:border-accent text-center"
                />
                <span className="absolute right-3 text-xs text-obsidian/30 font-bold">%</span>
              </div>
            </div>
          </label>

          <p className="text-[11px] font-light text-obsidian/50 leading-relaxed italic">
            {"* Note: When guests place room reservations, their checkout invoice will automatically calculate and charge this set deposit amount."}
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-white hover:bg-accent/95 transition-all duration-300 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          Save System Settings
        </button>
      </div>
    </form>
  )
}
