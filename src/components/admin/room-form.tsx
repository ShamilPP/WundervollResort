'use client'

import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { RoomType, type Room, type RoomImage, type RoomFeature as RF } from '@prisma/client'
import Image from 'next/image'
import { X, Upload, Loader2, ImagePlus } from 'lucide-react'

import { allFeatures, featureLabels } from '@/lib/features'
import { toPaise, toRupees } from '@/lib/money'

type Props = {
  mode: 'create' | 'edit'
  initial?: Room & { images: RoomImage[] }
}

type LocalImage = {
  file: File
  preview: string
}

type ExistingImage = {
  url: string
  publicId: string
  id?: string
}

export function RoomForm({ mode, initial }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)

  // Existing images from DB
  const [existingImages, setExistingImages] = useState<ExistingImage[]>(
    initial?.images?.map((i) => ({ url: i.url, publicId: i.publicId, id: i.id })) ?? []
  )

  // New images to be uploaded
  const [localImages, setLocalImages] = useState<LocalImage[]>([])

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
  })

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      localImages.forEach(img => URL.revokeObjectURL(img.preview))
    }
  }, [localImages])

  function upd<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newLocal: LocalImage[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      newLocal.push({
        file,
        preview: URL.createObjectURL(file)
      })
    }
    setLocalImages(prev => [...prev, ...newLocal])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removeLocalImage(index: number) {
    setLocalImages(prev => {
      const updated = [...prev]
      URL.revokeObjectURL(updated[index].preview)
      updated.splice(index, 1)
      return updated
    })
  }

  function removeExistingImage(publicId: string) {
    setExistingImages(prev => prev.filter(img => img.publicId !== publicId))
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this residence? This action cannot be undone.')) return
    
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/rooms/${initial!.id}`, {
        method: 'DELETE',
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Delete failed')

      toast.success('Room deleted successfully')
      router.push('/admin/rooms')
      router.refresh()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const formData = new FormData()

      // Append basic fields
      formData.append('slug', form.slug)
      formData.append('name', form.name)
      formData.append('type', form.type)
      formData.append('description', form.description)
      formData.append('shortDesc', form.shortDesc)
      formData.append('maxGuests', form.maxGuests.toString())
      formData.append('bedType', form.bedType)
      formData.append('sizeSqft', form.sizeSqft.toString())
      formData.append('basePrice', toPaise(Number(form.basePriceRupees)).toString())
      formData.append('weekendPrice', form.weekendPriceRupees ? toPaise(Number(form.weekendPriceRupees)).toString() : '')
      formData.append('isActive', form.isActive.toString())
      formData.append('sortOrder', form.sortOrder.toString())
      formData.append('features', JSON.stringify(form.features))

      // Append existing images metadata (for updates)
      formData.append('existingImages', JSON.stringify(existingImages))

      // Append new image files
      localImages.forEach(img => {
        formData.append('images', img.file)
      })

      const url = mode === 'create' ? '/api/admin/rooms' : `/api/admin/rooms/${initial!.id}`
      const res = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        body: formData, // Send as FormData
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Save failed')

      toast.success('Room saved successfully')
      router.push('/admin/rooms')
      router.refresh()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6 pb-20">
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
            <label key={f} className="flex items-center gap-2 text-sm cursor-pointer hover:text-accent transition-colors">
              <input type="checkbox" checked={form.features.includes(f)} onChange={() => {
                const updated = form.features.includes(f)
                  ? form.features.filter((x) => x !== f)
                  : [...form.features, f]
                upd('features', updated)
              }} />
              {featureLabels[f]}
            </label>
          ))}
        </div>
      </Section>

      <Section title="Residence Gallery">
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Existing Images */}
            {existingImages.map((img) => (
              <div key={img.publicId} className="group relative aspect-square rounded-2xl overflow-hidden border border-obsidian/5 bg-muted">
                <Image src={img.url} alt="Room" fill className="object-cover opacity-60" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-[8px] font-black uppercase tracking-widest text-obsidian/40 bg-white/80 px-2 py-1 rounded-full">Stored</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeExistingImage(img.publicId)}
                  className="absolute top-2 right-2 h-8 w-8 bg-white/90 text-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-destructive hover:text-white pointer-events-auto"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}

            {/* Local Previews */}
            {localImages.map((img, idx) => (
              <div key={idx} className="group relative aspect-square rounded-2xl overflow-hidden border border-accent/20 bg-accent/5">
                <Image src={img.preview} alt="Preview" fill className="object-cover" />
                <div className="absolute inset-0 bg-accent/10 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => removeLocalImage(idx)}
                  className="absolute top-2 right-2 h-8 w-8 bg-white/90 text-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-destructive hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-2xl border-2 border-dashed border-obsidian/10 flex flex-col items-center justify-center gap-2 text-obsidian/40 hover:border-accent hover:text-accent hover:bg-accent/5 transition-all"
            >
              <ImagePlus className="h-6 w-6" />
              <span className="text-[10px] font-black uppercase tracking-widest">Select Files</span>
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/*"
            className="hidden"
          />

          <p className="text-[10px] text-obsidian/30 uppercase tracking-[0.2em] font-bold">
            Select residence photos from your computer to vault them in the sanctuary.
          </p>
        </div>
      </Section>

      <Section title="Visibility">
        <label className="flex items-center gap-3 text-sm cursor-pointer">
          <input type="checkbox" checked={form.isActive} onChange={(e) => upd('isActive', e.target.checked)} />
          Active (visible on public site)
        </label>
      </Section>

      <div className="flex items-center justify-between border-t border-obsidian/5 pt-8">
        <div>
          {mode === 'edit' && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="rounded-xl border border-destructive/20 px-6 py-3 text-[11px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/5 disabled:opacity-50 transition-colors"
            >
              Delete residence
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-accent px-10 py-4 text-[11px] font-black uppercase tracking-[0.3em] text-white hover:bg-accent disabled:opacity-50 shadow-xl shadow-obsidian/10 transition-all active:scale-95"
        >
          {saving ? 'Saving…' : mode === 'create' ? 'Create residence' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[2.5rem] border border-obsidian/5 bg-white p-10 shadow-sm">
      <h2 className="mb-8 font-serif text-2xl text-obsidian">{title}</h2>
      {children}
    </section>
  )
}

function F({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block space-y-2 ${className}`}>
      <span className="text-[10px] font-black uppercase tracking-widest text-obsidian/40">{label}</span>
      {children}
    </label>
  )
}

const ic = 'w-full rounded-xl border border-obsidian/10 bg-[#FDFCFB] px-4 py-3 text-sm text-obsidian focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all'
