import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMap,
  useMapEvents,
} from "react-leaflet"
import type { LatLngLiteral } from "leaflet"
import { useEffect } from "react"
import L from "leaflet"

interface Props {
  center: LatLngLiteral | null
  radius: number
  onChange: (value: LatLngLiteral) => void
}

// Custom icon for marker
const customIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6" width="24" height="24">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 24],
})

// Recenters map when center changes
function RecenterMap({ center }: { center: LatLngLiteral | null }) {
  const map = useMap()

  useEffect(() => {
    if (center) {
      map.setView(center, 18, { animate: true })
    }
  }, [center, map])

  return null
}

// Handles clicking on map
function MapClickHandler({
  onChange,
}: {
  onChange: (v: LatLngLiteral) => void
}) {
  useMapEvents({
    click(e) {
      onChange(e.latlng)
    },
  })

  return null
}

export function LocationPicker({ center, radius, onChange }: Props) {
  const fallback = { lat: 5.6037, lng: -0.187 }
  const mapCenter = center || fallback

  return (
    <MapContainer
      center={mapCenter}
      zoom={18}
      scrollWheelZoom
      className="h-[250px] md:h-[350px] w-full rounded-xl border border-gray-300 overflow-hidden shadow-sm"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <RecenterMap center={center} />

      <MapClickHandler onChange={onChange} />

      {center && (
        <>
          <Marker
            position={center}
            icon={customIcon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const pos = e.target.getLatLng()
                onChange({ lat: pos.lat, lng: pos.lng })
              },
            }}
          />

          <Circle
            center={center}
            radius={radius}
            pathOptions={{
              color: "#3b82f6",
              weight: 2,
              fillOpacity: 0.15,
              fillColor: "#3b82f6",
            }}
          />
        </>
      )}
    </MapContainer>
  )
}
