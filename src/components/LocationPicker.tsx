import { MapContainer, TileLayer, Marker, Circle, useMap, Popup } from "react-leaflet"
import type { LatLngLiteral } from "leaflet"
import { useEffect } from "react"
import L from "leaflet"
import { MapPin } from "lucide-react"

interface Props {
  center: LatLngLiteral | null
  radius: number
}

interface RecenterMapProps {
  center: LatLngLiteral
}

// 1️⃣ Recenter map without changing zoom
function RecenterMap({ center }: RecenterMapProps) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  return null
}

// 2️⃣ Create a custom Leaflet marker using Lucide MapPin
const createLucideMarker = () =>
  new L.DivIcon({
    className: "", // remove default styles
    html: `
      <div style="transform: translate(-50%, -100%);">
        ${MapPin({ color: "red", size: 32, strokeWidth: 2 })}
      </div>
    `,
    iconAnchor: [16, 32], // tip points to location
  })

export function LocationPicker({ center, radius }: Props) {
  const handleCopy = () => {
    if (center) {
      navigator.clipboard.writeText(`${center.lat}, ${center.lng}`)
      alert("Coordinates copied!")
    }
  }

  return (
    <MapContainer
      center={center ?? { lat: 5.6037, lng: -0.187 }}
      zoom={18}
      className="h-[350px] w-full rounded-xl border border-slate-800 overflow-hidden"
      scrollWheelZoom={true}
      preferCanvas
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {center && (
        <>
          <RecenterMap center={center} />
          <Marker position={center} icon={createLucideMarker()}>
            <Popup>
              <div className="flex flex-col items-center">
                <span>Lat: {center.lat.toFixed(6)}</span>
                <span>Lng: {center.lng.toFixed(6)}</span>
                <button
                  className="mt-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  onClick={handleCopy}
                >
                  Copy
                </button>
              </div>
            </Popup>
          </Marker>
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
