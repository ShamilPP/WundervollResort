import type { RoomFeature } from '@prisma/client'

export const featureLabels: Record<RoomFeature, string> = {
  BEACHSIDE_VIEW: 'Beachside View',
  FRONT_VIEW: 'Front View',
  OCEAN_VIEW: 'Ocean View',
  GARDEN_VIEW: 'Garden View',
  POOL_VIEW: 'Pool View',
  MOUNTAIN_VIEW: 'Mountain View',
  PRIVATE_BALCONY: 'Private Balcony',
  PRIVATE_POOL: 'Private Pool',
  JACUZZI: 'Jacuzzi',
  KING_BED: 'King Bed',
  QUEEN_BED: 'Queen Bed',
  TWIN_BEDS: 'Twin Beds',
  WIFI: 'Wi-Fi',
  AIR_CONDITIONING: 'Air Conditioning',
  MINI_BAR: 'Mini Bar',
  ROOM_SERVICE: 'Room Service',
  SMART_TV: 'Smart TV',
  COFFEE_MACHINE: 'Coffee Machine',
  SAFE: 'In-Room Safe',
  BATHTUB: 'Bathtub',
}

export const allFeatures = Object.keys(featureLabels) as RoomFeature[]
