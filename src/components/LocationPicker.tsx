import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet"
import type { LatLngLiteral } from "leaflet"
import { useEffect } from "react"

interface Props {
  center: LatLngLiteral | null
  radius: number
}

interface RecenterMapProps {
  center: LatLngLiteral
}

function RecenterMap({ center }: RecenterMapProps) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom()) // keep current zoom
  }, [center, map])
  return null
}

export function LocationPicker({ center, radius }: Props) {
  return (
    <MapContainer
      center={center ?? { lat: 5.6037, lng: -0.187 }} // fallback if location fails
      zoom={18}
      className="h-[350px] w-full rounded-xl border border-slate-800 overflow-hidden"
      scrollWheelZoom={true}
      preferCanvas
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
            pathOptions={{ color: "lime", weight: 2, fillOpacity: 0.15 }}
          />
        </>
      )}
    </MapContainer>
  )
}
