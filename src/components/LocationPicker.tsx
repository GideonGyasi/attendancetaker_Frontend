import { MapContainer, TileLayer, Marker, Circle } from "react-leaflet"
import type { LatLngLiteral } from "leaflet"

interface Props {
  center: LatLngLiteral | null
  radius: number
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
