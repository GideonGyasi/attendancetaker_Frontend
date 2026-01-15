import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet"
import type { LatLngLiteral } from "leaflet"

interface Props {
  radius: number
}

function RecenterMap({ center }: { center: LatLngLiteral }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, 18)
  }, [center, map])
  return null
}

export function LocationPicker({ radius }: Props) {
  const [center, setCenter] = useState<LatLngLiteral | null>(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (err) => {
          console.error("Geolocation error:", err)
          // defer fallback to avoid synchronous setState
          setTimeout(() => {
            setCenter({ lat: 5.6037, lng: -0.187 })
          })
        }
      )
    } else {
      // defer fallback if geolocation not supported
      setTimeout(() => {
        setCenter({ lat: 5.6037, lng: -0.187 })
      })
    }
  }, [])

  return (
    <MapContainer
      center={center ?? { lat: 5.6037, lng: -0.187 }}
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
            pathOptions={{ color: "red", weight: 2, fillOpacity: 0.2 }}
          />
        </>
      )}
    </MapContainer>
  )
}
