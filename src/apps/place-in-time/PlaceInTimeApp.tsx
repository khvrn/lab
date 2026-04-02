import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import type { InputSource, SearchParams } from './place-in-time.types'
import { usePhotoSearch } from './usePhotoSearch'
import { PhotoDropzone } from './PhotoDropzone'
import { PlaceSearch } from './PlaceSearch'
import { SearchControls } from './SearchControls'
import { PhotoCard } from './PhotoCard'
import { PhotoMap } from './PhotoMap'

export function PlaceInTimeApp() {
  const [source, setSource] = useState<InputSource | null>(null)
  const [radiusKm, setRadiusKm] = useState(0.5)
  const [windowHours, setWindowHours] = useState(Infinity)
  const [datetime, setDatetime] = useState<Date>(() => new Date())
  const [lastParams, setLastParams] = useState<SearchParams | null>(null)

  const { state, search, selectPhoto } = usePhotoSearch()

  const handleSource = useCallback((incoming: InputSource | null) => {
    setSource(incoming)
    if (!incoming) return
    if (incoming.kind === 'exif') {
      setDatetime(incoming.takenAt)
      setWindowHours(1) // tight window — we have an exact timestamp
    } else {
      setDatetime(incoming.datetime)
      setWindowHours(Infinity) // no timestamp reference — show all photos at this place
    }
  }, [])

  const handleSearch = useCallback(() => {
    if (!source) return
    const params: SearchParams = {
      lat: source.lat,
      lon: source.lon,
      datetime,
      radiusKm,
      windowHours,
    }
    setLastParams(params)
    search(params)
  }, [source, datetime, radiusKm, windowHours, search])

  return (
    <div data-testid="place-in-time-app" className="min-h-screen bg-zinc-900 text-white">
      <div className="mx-auto max-w-7xl p-6 lg:p-8">
        <Link to="/" className="text-zinc-400 hover:text-white text-sm mb-6 inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400">
          ← Back to Lab
        </Link>

        <h1 className="text-3xl font-bold mb-1">📍 Place in Time</h1>
        <p className="text-zinc-400 mb-4">Browse public photos taken at the same place and time as you.</p>

        <div className="mb-8 rounded-xl border border-amber-700/60 bg-amber-900/20 px-4 py-3 text-sm text-amber-300">
          <p className="font-semibold mb-1">⚠️ POC — Data limitations apply</p>
          <p className="text-amber-400/80 leading-relaxed">
            This prototype searches <strong className="text-amber-300">Wikimedia Commons</strong> and{' '}
            <strong className="text-amber-300">Panoramax</strong> — free, open archives that cover famous
            landmarks but rarely index tourist or traveller photos. Results for specific dates are sparse
            (e.g. Alamo Square in SF has 50 photos, newest from 2022; Yasaka Kamimachi in Kyoto has photos
            from August 2024). The ideal source — <strong className="text-amber-300">Flickr</strong> — has
            exactly this data but now requires a paid Pro account for API access. Use{' '}
            <strong className="text-amber-300">"All time"</strong> in the time window to see what is
            available at any given location. GPS data is stripped from photos shared via email or messaging —
            use USB, AirDrop, or iCloud download to preserve it.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[340px_1fr]">
          {/* Left panel */}
          <div className="flex flex-col gap-4">
            <PhotoDropzone onSource={handleSource} />

            {source?.kind === 'exif' && (
              <div className="rounded-xl bg-zinc-800 p-4 text-sm">
                <p className="font-medium text-white truncate">{source.filename}</p>
                <p className="text-zinc-400 mt-1">
                  {source.lat.toFixed(5)}, {source.lon.toFixed(5)}
                </p>
                <p className="text-zinc-400">{source.takenAt.toLocaleString()}</p>
              </div>
            )}

            <PlaceSearch onSource={handleSource} datetime={datetime} />

            <SearchControls
              radiusKm={radiusKm}
              windowHours={windowHours}
              datetime={datetime}
              onRadiusChange={setRadiusKm}
              onWindowChange={setWindowHours}
              onDatetimeChange={setDatetime}
              onSearch={handleSearch}
              isLoading={state.status === 'loading'}
              hasSource={source !== null}
            />
          </div>

          {/* Right panel */}
          <div className="flex flex-col gap-6">
            {state.status === 'idle' && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <span className="text-5xl mb-4">🌍</span>
                <p className="text-zinc-400">Drop a photo or search a place to find historic public photos</p>
              </div>
            )}

            {state.status === 'loading' && (
              <div className="flex flex-col items-center justify-center h-64">
                <p className="text-zinc-400 animate-pulse">Searching public photo archives…</p>
              </div>
            )}

            {state.status === 'error' && (
              <div className="rounded-xl bg-red-900/30 border border-red-700 p-4 text-red-300">
                {state.message}
              </div>
            )}

            {state.status === 'results' && (
              <>
                {lastParams && (
                  <PhotoMap
                    params={lastParams}
                    photos={state.photos}
                    selectedId={state.selectedId}
                    onSelect={selectPhoto}
                  />
                )}

                {state.photos.length > 0 ? (
                  <>
                    <p className="text-sm text-zinc-400">{state.photos.length} photos found</p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {state.photos.map((photo) => (
                        <PhotoCard
                          key={photo.id}
                          photo={photo}
                          isSelected={state.selectedId === photo.id}
                          onSelect={selectPhoto}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-zinc-400">
                    No public photos found. Try widening the radius or time window.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
