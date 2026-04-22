export function generateBookingCode() {
  const year = new Date().getUTCFullYear()
  const rand = Math.floor(Math.random() * 900000) + 100000
  return `WDV-${year}-${rand}`
}
