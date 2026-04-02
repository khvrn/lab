import { useCallback, useRef, useState } from 'react'
import type { AppState, Photo, SearchParams } from './place-in-time.types'

interface WikiImageInfo {
  url: string
  thumburl?: string
  timestamp: string
  mediatype?: string
  extmetadata?: {
    Artist?: { value: string }
    DateTimeOriginal?: { value: string }
  }
}

interface WikiPage {
  pageid: number
  title: string
  coordinates?: Array<{ lat: number; lon: number }>
  imageinfo?: WikiImageInfo[]
}

interface WikiResponse {
  query?: {
    pages?: Record<string, WikiPage>
  }
}

interface PanoramaxFeature {
  id: string
  geometry?: { coordinates?: [number, number] }
  properties?: { datetime?: string; 'pers:org_name'?: string }
  assets?: { thumb?: { href: string }; overview?: { href: string }; image?: { href: string } }
}

interface PanoramaxResponse {
  features?: PanoramaxFeature[]
}

function parseWikimediaDate(raw: string | undefined): Date | null {
  if (!raw) return null
  const normalized = raw.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3')
  const d = new Date(normalized)
  return isNaN(d.getTime()) ? null : d
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

async function fetchWikimedia(params: SearchParams, signal: AbortSignal): Promise<Photo[]> {
  const radiusMeters = Math.min(params.radiusKm * 1000, 10000)
  const url = new URL('https://commons.wikimedia.org/w/api.php')
  url.searchParams.set('action', 'query')
  url.searchParams.set('generator', 'geosearch')
  url.searchParams.set('ggscoord', `${params.lat}|${params.lon}`)
  url.searchParams.set('ggsradius', String(radiusMeters))
  url.searchParams.set('ggsnamespace', '6')
  url.searchParams.set('ggslimit', '50')
  url.searchParams.set('prop', 'imageinfo|coordinates')
  url.searchParams.set('iiprop', 'url|timestamp|extmetadata|mediatype')
  url.searchParams.set('iiurlwidth', '400')
  url.searchParams.set('iilimit', '50')
  url.searchParams.set('format', 'json')
  url.searchParams.set('origin', '*')

  const res = await fetch(url.toString(), { signal })
  const data: WikiResponse = await res.json()
  const pages = data.query?.pages ?? {}

  return Object.values(pages).flatMap((page): Photo[] => {
    const info = page.imageinfo?.[0]
    if (!info) return []
    const mediatype = info.mediatype?.toUpperCase()
    if (mediatype !== 'BITMAP' && mediatype !== 'DRAWING') return []

    const coords = page.coordinates?.[0]
    if (!coords) return []

    const rawArtist = info.extmetadata?.Artist?.value ?? ''
    const attribution = stripHtml(rawArtist) || 'Wikimedia contributor'
    const rawDate = info.extmetadata?.DateTimeOriginal?.value
    const takenAt = parseWikimediaDate(rawDate) ?? parseWikimediaDate(info.timestamp)

    const rawTitle = page.title.replace(/^File:/, '').replace(/\.[^.]+$/, '')

    const pageUrl = `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`

    return [
      {
        id: `wiki-${page.pageid}`,
        title: rawTitle,
        thumbnailUrl: info.thumburl ?? info.url,
        fullUrl: info.url,
        pageUrl,
        lat: coords.lat,
        lon: coords.lon,
        takenAt,
        attribution,
        source: 'wikimedia',
      },
    ]
  })
}

async function fetchPanoramax(params: SearchParams, signal: AbortSignal): Promise<Photo[]> {
  const degPerKm = 1 / 111
  const latDelta = params.radiusKm * degPerKm
  const lonDelta = params.radiusKm * degPerKm / Math.cos((params.lat * Math.PI) / 180)
  const minLat = params.lat - latDelta
  const maxLat = params.lat + latDelta
  const minLon = params.lon - lonDelta
  const maxLon = params.lon + lonDelta

  const windowMs = params.windowHours * 3600 * 1000
  const startISO = new Date(params.datetime.getTime() - windowMs).toISOString()
  const endISO = new Date(params.datetime.getTime() + windowMs).toISOString()

  const url = new URL('https://api.panoramax.xyz/api/search')
  url.searchParams.set('bbox', `${minLon},${minLat},${maxLon},${maxLat}`)
  url.searchParams.set('datetime', `${startISO}/${endISO}`)
  url.searchParams.set('limit', '50')

  const res = await fetch(url.toString(), { signal })
  const data: PanoramaxResponse = await res.json()
  const features = data.features ?? []

  return features.flatMap((f): Photo[] => {
    const coords = f.geometry?.coordinates
    if (!coords) return []
    const [lon, lat] = coords
    const thumbUrl = f.assets?.thumb?.href ?? f.assets?.overview?.href ?? ''
    const fullUrl = f.assets?.image?.href ?? f.assets?.overview?.href ?? thumbUrl
    const rawDatetime = f.properties?.datetime
    const takenAt = rawDatetime ? new Date(rawDatetime) : null
    const orgName = f.properties?.['pers:org_name'] ?? 'Panoramax contributor'
    const pageUrl = `https://panoramax.xyz/#focus=pic&pic=${f.id}`

    return [
      {
        id: `pano-${f.id}`,
        title: `Panoramax ${f.id.slice(0, 8)}`,
        thumbnailUrl: thumbUrl,
        fullUrl,
        pageUrl,
        lat,
        lon,
        takenAt,
        attribution: orgName,
        source: 'panoramax',
      },
    ]
  })
}

export interface UsePhotoSearchReturn {
  state: AppState
  search: (params: SearchParams) => void
  selectPhoto: (id: string | null) => void
}

export function usePhotoSearch(): UsePhotoSearchReturn {
  const [state, setState] = useState<AppState>({ status: 'idle' })
  const abortRef = useRef<AbortController | null>(null)

  const search = useCallback((params: SearchParams) => {
    if (abortRef.current) {
      abortRef.current.abort()
    }
    const controller = new AbortController()
    abortRef.current = controller

    setState({ status: 'loading' })

    Promise.allSettled([
      fetchWikimedia(params, controller.signal),
      fetchPanoramax(params, controller.signal),
    ]).then(([wikiResult, panoResult]) => {
      if (controller.signal.aborted) return

      const wikiPhotos = wikiResult.status === 'fulfilled' ? wikiResult.value : []
      const panoPhotos = panoResult.status === 'fulfilled' ? panoResult.value : []

      const seenUrls = new Set<string>()
      const merged: Photo[] = []
      for (const photo of [...wikiPhotos, ...panoPhotos]) {
        if (!seenUrls.has(photo.pageUrl)) {
          seenUrls.add(photo.pageUrl)
          merged.push(photo)
        }
      }

      const windowMs = params.windowHours * 3600000
      const filtered = merged.filter((photo) => {
        if (!isFinite(params.windowHours)) return true // "All time" — no date filter
        if (!photo.takenAt) return true
        return Math.abs(photo.takenAt.getTime() - params.datetime.getTime()) <= windowMs
      })

      filtered.sort((a, b) => {
        if (!a.takenAt && !b.takenAt) return 0
        if (!a.takenAt) return 1
        if (!b.takenAt) return -1
        return a.takenAt.getTime() - b.takenAt.getTime()
      })

      setState({ status: 'results', photos: filtered, selectedId: null })
    }).catch((err: unknown) => {
      if (controller.signal.aborted) return
      const message = err instanceof Error ? err.message : 'Unknown error'
      setState({ status: 'error', message })
    })
  }, [])

  const selectPhoto = useCallback((id: string | null) => {
    setState((prev) => {
      if (prev.status !== 'results') return prev
      return { ...prev, selectedId: id }
    })
  }, [])

  return { state, search, selectPhoto }
}
