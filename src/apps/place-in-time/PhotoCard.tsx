import type { Photo } from './place-in-time.types'

interface PhotoCardProps {
  photo: Photo
  isSelected: boolean
  onSelect: (id: string) => void
}

function formatDate(date: Date | null): string {
  if (!date) return 'Unknown date'
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function PhotoCard({ photo, isSelected, onSelect }: PhotoCardProps) {
  const borderClass = isSelected
    ? 'border-white ring-1 ring-white'
    : 'border-zinc-700 hover:border-zinc-500'

  const sourceBadge = photo.source === 'wikimedia' ? 'Wikimedia' : 'Panoramax'

  return (
    <button
      data-testid={`photo-card-${photo.id}`}
      type="button"
      onClick={() => onSelect(photo.id)}
      className={`text-left w-full rounded-xl bg-zinc-800 border overflow-hidden transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${borderClass}`}
    >
      {photo.thumbnailUrl ? (
        <img
          src={photo.thumbnailUrl}
          alt={photo.title}
          loading="lazy"
          className="h-40 w-full object-cover bg-zinc-700"
        />
      ) : (
        <div className="h-40 w-full bg-zinc-700" />
      )}
      <div className="p-3 flex flex-col gap-1">
        <p className="text-sm font-medium text-white truncate">{photo.title}</p>
        <p className="text-xs text-zinc-400">{formatDate(photo.takenAt)}</p>
        <p className="text-xs text-zinc-500 truncate">{photo.attribution}</p>
        <span className="self-start rounded-full bg-zinc-700 px-2 py-0.5 text-xs text-zinc-300">
          {sourceBadge}
        </span>
      </div>
    </button>
  )
}
