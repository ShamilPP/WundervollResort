'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { RoomType, type Room, type RoomImage, type RoomFeature as RF } from '@prisma/client'

import { allFeatures, featureLabels } from '@/lib/features'
import { toPaise, toRupees } from '@/lib/money'

type Props = {
  mode: 'create' | 'edit'
  initial?: Room & { images: RoomImage[] }
}

export function RoomForm({ mode, initial }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [form, setForm] = useState({
    slug: initial?.slug ?? '',
    name: initial?.name ?? '',
    type: initial?.type ?? RoomType.DELUXE,
    description: initial?.description ?? '',
    shortDesc: initial?.shortDesc ?? '',
    maxGuests: initial?.maxGuests ?? 2,
    bedType: initial?.bedType ?? 'King',
    sizeSqft: initial?.sizeSqft ?? 400,
    basePriceRupees: initial ? toRupees(initial.basePrice) : 10000,
    weekendPriceRupees: initial?.weekendPrice ? toRupees(initial.weekendPrice) : 0,
    isActive: initial?.isActive ?? true,
    sortOrder: initial?.sortOrder ?? 10,
    features: (initial?.features ?? []) as RF[],
    imageUrls: (initial?.images?.map((i) => i.url) ?? []).join('\n'),
  })

  function upd<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function toggleFeature(f: RF) {
    setForm((s) => ({
      ...s,
      features: s.features.includes(f)
        ? s.features.filter((x) => x !== f)
        : [...s.features, f],
    }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const body = {
        slug: form.slug,
        name: form.name,
        type: form.type,
        description: form.description,
        shortDesc: form.shortDesc,
        maxGuests: Number(form.maxGuests),
        bedType: form.bedType,
        sizeSqft: Number(form.sizeSqft),
        basePrice: toPaise(Number(form.basePriceRupees)),
        weekendPrice: form.weekendPriceRupees
          ? toPaise(Number(form.weekendPriceRupees))
          : null,
        isActive: form.isActive,
        sortOrder: Number(form.sortOrder),
        features: form.features,
        imageUrls: form.imageUrls
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
      }
      const url = mode === 'create' ? '/api/admin/rooms' : `/api/admin/rooms/${initial!.id}`
      const res = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Save failed')
      toast.success('Room saved')
      router.push('/admin/rooms')
      router.refresh()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!initial) return
    if (!confirm(`Delete "${initial.name}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/rooms/${initial.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Delete failed')
      toast.success('Room deleted')
      router.push('/admin/rooms')
      router.refresh()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <Section title="Basic info">
        <div className="grid gap-4 md:grid-cols-2">
          <F label="Name"><input required value={form.name} onChange={(e) => upd('name', e.target.value)} className={ic} /></F>
          <F label="Slug"><input required value={form.slug} onChange={(e) => upd('slug', e.target.value)} className={ic} /></F>
          <F label="Type">
            <select value={form.type} onChange={(e) => upd('type', e.target.value as RoomType)} className={ic}>
              {Object.values(RoomType).map((t) => <option key={t}>{t}</option>)}
            </select>
          </F>
          <F label="Bed type"><input value={form.bedType} onChange={(e) => upd('bedType', e.target.value)} className={ic} /></F>
          <F label="Short description (card)"><input value={form.shortDesc} onChange={(e) => upd('shortDesc', e.target.value)} className={ic} /></F>
          <F label="Size (sq ft)"><input type="number" value={form.sizeSqft} onChange={(e) => upd('sizeSqft', Number(e.target.value))} className={ic} /></F>
          <F label="Max guests"><input type="number" value={form.maxGuests} onChange={(e) => upd('maxGuests', Number(e.target.value))} className={ic} /></F>
          <F label="Sort order"><input type="number" value={form.sortOrder} onChange={(e) => upd('sortOrder', Number(e.target.value))} className={ic} /></F>
        </div>
        <F label="Long description" className="mt-4">
          <textarea rows={4} value={form.description} onChange={(e) => upd('description', e.target.value)} className={`${ic} resize-none`} />
        </F>
      </Section>

      <Section title="Pricing (₹)">
        <div className="grid gap-4 md:grid-cols-2">
          <F label="Base price per night"><input type="number" value={form.basePriceRupees} onChange={(e) => upd('basePriceRupees', Number(e.target.value))} className={ic} /></F>
          <F label="Weekend price (optional)"><input type="number" value={form.weekendPriceRupees} onChange={(e) => upd('weekendPriceRupees', Number(e.target.value))} className={ic} /></F>
        </div>
      </Section>

      <Section title="Features">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {allFeatures.map((f) => (
            <label key={f} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.features.includes(f)} onChange={() => toggleFeature(f)} />
              {featureLabels[f]}
            </label>
          ))}
        </div>
      </Section>

      <Section title="Images">
        <p className="text-xs text-muted-foreground">
          One URL per line (Cloudinary integration will replace this).
        </p>
        <textarea
          rows={5}
          value={form.imageUrls}
          onChange={(e) => upd('imageUrls', e.target.value)}
          placeholder="https://..."
          className={`${ic} mt-2 resize-none`}
        />
      </Section>

      <Section title="Visibility">
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={(e) => upd('isActive', e.target.checked)} />
          Active (visible on public site)
        </label>
      </Section>

      <div className="flex items-center justify-between border-t pt-6">
        <div>
          {mode === 'edit' && (
            <button
              type="button"
              onClick={remove}
              disabled={deleting}
              className="rounded-md border border-destructive px-4 py-2 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Delete room'}
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving…' : mode === 'create' ? 'Create room' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border bg-card p-6">
      <h2 className="mb-4 font-serif text-xl">{title}</h2>
      {children}
    </section>
  )
}
function F({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block space-y-1.5 ${className}`}>
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  )
}
const ic = 'w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring'
