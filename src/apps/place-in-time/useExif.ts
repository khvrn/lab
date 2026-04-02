import { useCallback } from 'react'
import exifr from 'exifr'
import type { InputSource } from './place-in-time.types'

export interface UseExifReturn {
  extractFromFile: (file: File) => Promise<InputSource | null>
}

export function useExif(): UseExifReturn {
  const extractFromFile = useCallback(async (file: File): Promise<InputSource | null> => {
    try {
      const [gps, tags] = await Promise.all([
        exifr.gps(file),
        exifr.parse(file, ['DateTimeOriginal']),
      ])
      if (!gps?.latitude || !gps?.longitude) return null
      const takenAt = tags?.DateTimeOriginal instanceof Date ? tags.DateTimeOriginal : new Date()
      return { kind: 'exif', lat: gps.latitude, lon: gps.longitude, takenAt, filename: file.name }
    } catch {
      return null
    }
  }, [])

  return { extractFromFile }
}
