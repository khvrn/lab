import { useCallback, useState, useRef } from 'react'
import type { InputSource } from './place-in-time.types'
import { useExif } from './useExif'

interface PhotoDropzoneProps {
  onSource: (source: InputSource | null) => void
}

type DropzoneStatus = 'idle' | 'processing' | 'no-exif'

export function PhotoDropzone({ onSource }: PhotoDropzoneProps) {
  const [status, setStatus] = useState<DropzoneStatus>('idle')
  const [filename, setFilename] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const { extractFromFile } = useExif()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    async (file: File) => {
      setFilename(file.name)
      setStatus('processing')
      const source = await extractFromFile(file)
      if (source) {
        setStatus('idle')
        onSource(source)
      } else {
        setStatus('no-exif')
        onSource(null)
      }
    },
    [extractFromFile, onSource]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) void handleFile(file)
    },
    [handleFile]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) void handleFile(file)
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const borderClass = isDragging
    ? 'border-zinc-400 bg-zinc-700/50'
    : 'border-zinc-600 hover:border-zinc-500'

  return (
    <div
      data-testid="photo-dropzone"
      className={`rounded-2xl border-2 border-dashed p-10 text-center transition-colors cursor-pointer ${borderClass}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        aria-label="Upload photo"
        className="sr-only"
        onChange={handleChange}
      />

      {status === 'idle' && (
        <>
          <p className="text-lg font-medium text-white">Drop a photo here</p>
          <p className="mt-2 text-sm text-zinc-400">GPS read locally, never uploaded</p>
        </>
      )}

      {status === 'processing' && (
        <>
          <p className="text-sm text-zinc-400 truncate">{filename}</p>
          <p className="mt-2 text-sm text-zinc-400">Reading…</p>
        </>
      )}

      {status === 'no-exif' && (
        <>
          <p className="text-sm text-zinc-400 truncate">{filename}</p>
          <p className="mt-2 text-sm text-amber-400">No GPS data found</p>
          <p className="mt-1 text-xs text-zinc-500">
            Email &amp; messaging apps strip location. Transfer via USB, AirDrop, or iCloud instead.
          </p>
          <p className="mt-2 text-sm text-zinc-400">Search by place name below ↓</p>
        </>
      )}
    </div>
  )
}
