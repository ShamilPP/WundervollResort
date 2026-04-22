export function normalizeDate(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : date
  const normalized = new Date(d)
  normalized.setUTCHours(0, 0, 0, 0)
  return normalized
}

export function nightsBetween(checkIn: Date, checkOut: Date): number {
  const ms = normalizeDate(checkOut).getTime() - normalizeDate(checkIn).getTime()
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)))
}
