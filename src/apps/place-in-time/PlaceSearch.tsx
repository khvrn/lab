import { useCallback, useRef, useState } from 'react'
import type { InputSource } from './place-in-time.types'

interface PlaceSearchProps {
  onSource: (source: InputSource) => void
  datetime: Date
}

interface NominatimResult {
  display_name: string
  lat: string
  lon: string
}

export function PlaceSearch({ onSource, datetime }: PlaceSearchProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([])
  const abortRef = useRef<AbortController | null>(null)

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setQuery(value)

      if (value.length < 3) {
        setSuggestions([])
        return
      }

      if (abortRef.current) {
        abortRef.current.abort()
      }
      const controller = new AbortController()
      abortRef.current = controller

      try {
        const url = new URL('https://nominatim.openstreetmap.org/search')
        url.searchParams.set('q', value)
        url.searchParams.set('format', 'json')
        url.searchParams.set('limit', '5')

        const res = await fetch(url.toString(), {
          signal: controller.signal,
          headers: { 'Accept-Language': 'en' },
        })
        const data: NominatimResult[] = await res.json()
        setSuggestions(data)
      } catch {
        // aborted or network error — ignore
      }
    },
    []
  )

  const handleSelect = useCallback(
    (result: NominatimResult) => {
      setQuery(result.display_name)
      setSuggestions([])
      onSource({
        kind: 'place',
        label: result.display_name,
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
        datetime,
      })
    },
    [onSource, datetime]
  )

  return (
    <div data-testid="place-search" className="relative">
      <label className="block text-sm text-zinc-400 mb-1">Or search by place name</label>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="e.g. Eiffel Tower, Times Square…"
        aria-label="Search by place name"
        className="w-full rounded-xl bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-xl bg-zinc-800 border border-zinc-700 overflow-hidden">
          {suggestions.map((result, i) => (
            <li key={i}>
              <button
                type="button"
                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                onClick={() => handleSelect(result)}
              >
                {result.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
