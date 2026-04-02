import { useCallback } from 'react'

interface SearchControlsProps {
  radiusKm: number
  windowHours: number
  datetime: Date
  onRadiusChange: (km: number) => void
  onWindowChange: (hours: number) => void
  onDatetimeChange: (dt: Date) => void
  onSearch: () => void
  isLoading: boolean
  hasSource: boolean
}

const RADIUS_STEPS = [0.1, 0.25, 0.5, 1, 2, 5]
const WINDOW_STEPS = [0.25, 0.5, 1, 2, 4, 6, Infinity]

function formatRadius(km: number): string {
  return km < 1 ? `${km * 1000}m` : `${km}km`
}

function formatWindow(hours: number): string {
  if (!isFinite(hours)) return 'All time'
  return hours < 1 ? `±${hours * 60}min` : `±${hours}hr`
}

function toLocalISOString(date: Date): string {
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

export function SearchControls({
  radiusKm,
  windowHours,
  datetime,
  onRadiusChange,
  onWindowChange,
  onDatetimeChange,
  onSearch,
  isLoading,
  hasSource,
}: SearchControlsProps) {
  const radiusIdx = RADIUS_STEPS.indexOf(radiusKm)
  const windowIdx = WINDOW_STEPS.indexOf(windowHours)

  const handleRadiusChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const idx = parseInt(e.target.value, 10)
      onRadiusChange(RADIUS_STEPS[idx])
    },
    [onRadiusChange]
  )

  const handleWindowChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const idx = parseInt(e.target.value, 10)
      onWindowChange(WINDOW_STEPS[idx])
    },
    [onWindowChange]
  )

  const handleDatetimeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const dt = new Date(e.target.value)
      if (!isNaN(dt.getTime())) onDatetimeChange(dt)
    },
    [onDatetimeChange]
  )

  return (
    <div data-testid="search-controls" className="flex flex-col gap-4">
      <div>
        <div className="flex justify-between text-sm mb-1">
          <label htmlFor="radius-range" className="text-zinc-400">Radius</label>
          <span className="text-white">{formatRadius(radiusKm)}</span>
        </div>
        <input
          id="radius-range"
          type="range"
          min={0}
          max={5}
          step={1}
          value={radiusIdx === -1 ? 2 : radiusIdx}
          onChange={handleRadiusChange}
          aria-label="Search radius"
          className="w-full accent-white"
        />
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <label htmlFor="window-range" className="text-zinc-400">Time window</label>
          <span className="text-white">{formatWindow(windowHours)}</span>
        </div>
        <input
          id="window-range"
          type="range"
          min={0}
          max={6}
          step={1}
          value={windowIdx === -1 ? 6 : windowIdx}
          onChange={handleWindowChange}
          aria-label="Time window"
          className="w-full accent-white"
        />
      </div>

      {isFinite(windowHours) && (
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Date &amp; time</label>
          <input
            type="datetime-local"
            value={toLocalISOString(datetime)}
            onChange={handleDatetimeChange}
            className="w-full rounded-xl bg-zinc-800 px-4 py-2 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
          />
        </div>
      )}

      <button
        type="button"
        onClick={onSearch}
        disabled={!hasSource || isLoading}
        className="w-full rounded-xl bg-white text-zinc-900 font-semibold py-2 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
      >
        {isLoading ? 'Searching…' : 'Search'}
      </button>
    </div>
  )
}
