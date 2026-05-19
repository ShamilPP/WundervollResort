import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type BookingDraft = {
  roomId?: string
  checkIn?: string
  checkOut?: string
  guestCount: number
  adults: number
  children: number
  specialRequests: string
  setRoom: (roomId: string) => void
  setDates: (checkIn: string, checkOut: string) => void
  setGuestCount: (n: number) => void
  setGuestsSplit: (adults: number, children: number) => void
  setSpecialRequests: (note: string) => void
  clear: () => void
}

export const useBookingDraft = create<BookingDraft>()(
  persist(
    (set) => ({
      guestCount: 1,
      adults: 1,
      children: 0,
      specialRequests: '',
      setRoom: (roomId) => set({ roomId }),
      setDates: (checkIn, checkOut) => set({ checkIn, checkOut }),
      setGuestCount: (guestCount) => set({ guestCount }),
      setGuestsSplit: (adults, children) => set({ adults, children, guestCount: adults + children }),
      setSpecialRequests: (specialRequests) => set({ specialRequests }),
      clear: () =>
        set({ 
          roomId: undefined, 
          checkIn: undefined, 
          checkOut: undefined, 
          guestCount: 1,
          adults: 1,
          children: 0,
          specialRequests: ''
        }),
    }),
    { name: 'wundervoll-booking-draft' },
  ),
)
