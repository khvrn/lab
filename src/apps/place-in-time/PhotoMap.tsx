import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Photo, SearchParams } from './place-in-time.types'

const referenceIcon = L.divIcon({
  className: '',
  html: '<div style="width:16px;height:16px;border-radius:50%;background:#60a5fa;border:3px solid white;box-shadow:0 0 0 2px #3b82f6;"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

const photoIcon = L.divIcon({
  className: '',
  html: '<div style="width:10px;height:10px;border-radius:50%;background:#f87171;border:2px solid white;"></div>',
  iconSize: [10, 10],
  iconAnchor: [5, 5],
})

const selectedIcon = L.divIcon({
  className: '',
  html: '<div style="width:14px;height:14px;border-radius:50%;background:#fb923c;border:3px solid white;box-shadow:0 0 0 2px #f97316;"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

interface RecenterProps {
  lat: number
  lon: number
}

function Recenter({ lat, lon }: RecenterProps) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lon])
  }, [map, lat, lon])
  return null
}

interface PhotoMapProps {
  params: SearchParams
  photos: Photo[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function PhotoMap({ params, photos, selectedId, onSelect }: PhotoMapProps) {
  return (
    <div data-testid="photo-map" className="h-72 rounded-xl overflow-hidden border border-zinc-700">
      <MapContainer
        center={[params.lat, params.lon]}
        zoom={14}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Recenter lat={params.lat} lon={params.lon} />
        <Marker position={[params.lat, params.lon]} icon={referenceIcon}>
          <Popup>📍 Your location</Popup>
        </Marker>
        {photos.map((photo) => (
          <Marker
            key={photo.id}
            position={[photo.lat, photo.lon]}
            icon={photo.id === selectedId ? selectedIcon : photoIcon}
            eventHandlers={{ click: () => onSelect(photo.id) }}
          >
            <Popup>
              <span>{photo.title}</span>
              <br />
              <a href={photo.pageUrl} target="_blank" rel="noopener noreferrer">
                View on source
              </a>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
