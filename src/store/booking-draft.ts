import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type BookingDraft = {
  roomId?: string
  checkIn?: string
  checkOut?: string
  guestCount: number
  setRoom: (roomId: string) => void
  setDates: (checkIn: string, checkOut: string) => void
  setGuests: (n: number) => void
  clear: () => void
}

export const useBookingDraft = create<BookingDraft>()(
  persist(
    (set) => ({
      guestCount: 1,
      setRoom: (roomId) => set({ roomId }),
      setDates: (checkIn, checkOut) => set({ checkIn, checkOut }),
      setGuests: (guestCount) => set({ guestCount }),
      clear: () =>
        set({ roomId: undefined, checkIn: undefined, checkOut: undefined, guestCount: 1 }),
    }),
    { name: 'wundervoll-booking-draft' },
  ),
)
