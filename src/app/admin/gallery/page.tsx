'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Trash2, Image as ImageIcon, Plus, X, Loader2, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface GalleryImage {
  id: string
  url: string
  category: string
  alt?: string
}

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const fetchImages = async () => {
    try {
      const res = await fetch('/api/admin/gallery')
      const data = await res.json()
      if (Array.isArray(data)) {
        setImages(data)
      } else {
        setImages([])
        console.error('Expected array of images, received:', data)
      }
    } catch (err) {
      toast.error('Failed to load gallery manifestations')
      setImages([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchImages()
  }, [])

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploading(true)
    const formData = new FormData()
    Array.from(files).forEach((file) => {
      formData.append('images', file)
    })

    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        toast.success('Manifestations vaulted successfully')
        fetchImages()
      } else {
        toast.error('Failed to upload images')
      }
    } catch (err) {
      toast.error('An error occurred during upload')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this manifestation?')) return

    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setImages(images.filter((img) => img.id !== id))
        toast.success('Image removed from sanctuary')
      } else {
        toast.error('Failed to delete image')
      }
    } catch (err) {
      toast.error('An error occurred')
    }
  }

  return (
    <div className="space-y-10 p-6 lg:p-10">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-4xl text-obsidian tracking-tight">Gallery Vault</h1>
          <p className="text-sm font-light text-obsidian/40 italic mt-1">
            {"\"Manage the visual manifestations of the sanctuary.\""}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full bg-accent/5 px-4 py-2 border border-accent/10">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-accent">
              {Array.isArray(images) ? images.length : 0} Manifestations
            </span>
          </div>
        </div>
      </div>

      {/* Upload Command Center */}
      <div 
        className={cn(
          "relative group overflow-hidden rounded-[3rem] border-2 border-dashed transition-all duration-500",
          dragActive ? "border-accent bg-accent/5" : "border-obsidian/10 bg-white hover:border-accent/30",
          uploading && "pointer-events-none opacity-60"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); handleUpload(e.dataTransfer.files) }}
      >
        <div className="flex flex-col items-center justify-center py-20 px-10 text-center space-y-6">
          <div className="h-20 w-20 rounded-full bg-accent/5 flex items-center justify-center text-accent transition-transform group-hover:scale-110 duration-500">
            {uploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Upload className="h-8 w-8" />}
          </div>
          <div className="space-y-2">
            <p className="text-xl font-serif text-obsidian tracking-tight">
              {uploading ? 'Vaulting Assets...' : 'Add New Manifestations'}
            </p>
            <p className="text-xs font-light text-obsidian/40 uppercase tracking-[0.3em]">
              Drag and drop or click to upload
            </p>
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleUpload(e.target.files)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Manifestation Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <AnimatePresence mode="popLayout">
          {Array.isArray(images) && images.map((img) => (
            <motion.div
              key={img.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative aspect-square overflow-hidden rounded-[2.5rem] bg-obsidian/5 border border-obsidian/5"
            >
              <Image
                src={img.url}
                alt={img.alt || 'Gallery Manifestation'}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-obsidian/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-sm">
                <button
                  onClick={() => handleDelete(img.id)}
                  className="h-14 w-14 rounded-full bg-red-500 text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all"
                >
                  <Trash2 className="h-6 w-6" />
                </button>
              </div>
              <div className="absolute top-4 left-4">
                <span className="rounded-full bg-white/20 backdrop-blur-md border border-white/20 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-white">
                  {img.category}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-[2.5rem] bg-obsidian/5 animate-pulse" />
          ))
        )}
      </div>

      {!loading && images.length === 0 && (
        <div className="py-40 text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-obsidian/5 text-obsidian/20 mb-6">
            <ImageIcon className="h-8 w-8" />
          </div>
          <p className="text-lg font-serif text-obsidian/40 italic">
            {"\"The vault is currently empty. Add your first manifestation above.\""}
          </p>
        </div>
      )}
    </div>
  )
}
