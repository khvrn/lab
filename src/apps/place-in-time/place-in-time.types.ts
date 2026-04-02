export type InputSource =
  | { kind: 'exif'; lat: number; lon: number; takenAt: Date; filename: string }
  | { kind: 'place'; label: string; lat: number; lon: number; datetime: Date }

export interface SearchParams {
  lat: number
  lon: number
  datetime: Date
  radiusKm: number
  windowHours: number
}

export interface Photo {
  id: string
  title: string
  thumbnailUrl: string
  fullUrl: string
  pageUrl: string
  lat: number
  lon: number
  takenAt: Date | null
  attribution: string
  source: 'wikimedia' | 'panoramax'
}

export type AppState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'results'; photos: Photo[]; selectedId: string | null }
  | { status: 'error'; message: string }
