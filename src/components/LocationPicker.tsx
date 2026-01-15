import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet"
import type { LatLngLiteral } from "leaflet"
import { useEffect } from "react"

interface Props {
  center: LatLngLiteral | null
  radius: number
}

function RecenterMap({ center }: { center: LatLngLiteral }) {
  const map = useMap()

  useEffect(() => {
    map.setView(center, 18, { animate: true }) // ~300% zoom
  }, [center, map])

  return null
}

export function LocationPicker({ center, radius }: Props) {
  const fallback = { lat: 5.6037, lng: -0.187 }

  return (
    <MapContainer
      center={center ?? fallback}
      zoom={18}
      scrollWheelZoom
      className="h-[350px] w-full rounded-xl border border-slate-800 overflow-hidden"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {center && (
        <>
          <RecenterMap center={center} />
          <Marker position={center} />
          <Circle
            center={center}
            radius={radius}
            pathOptions={{
              color: "red",
              weight: 2,
              fillOpacity: 0.25,
            }}
          />
        </>
      )}
    </MapContainer>
  )
}
