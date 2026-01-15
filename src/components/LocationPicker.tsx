import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet"
import type { LatLngLiteral } from "leaflet"
import { useEffect } from "react"
import L from "leaflet"

interface Props {
  center: LatLngLiteral | null
  radius: number // radius in meters
}

interface RecenterMapProps {
  center: LatLngLiteral
  radius: number
}

function RecenterMap({ center, radius }: RecenterMapProps) {
  const map = useMap()
  
  useEffect(() => {
    // Calculate appropriate zoom level based on radius
    if (radius > 0) {
      // For large radii, zoom out; for small radii, zoom in
      const zoomForRadius = Math.max(10, Math.min(18, Math.floor(18 - Math.log2(radius / 50))))
      map.setView(center, zoomForRadius)
    } else {
      map.setView(center, map.getZoom())
    }
  }, [center, radius, map])
  
  return null
}

// Custom red marker icon using inline SVG (Lucide-style)
const RedMarkerIcon = new L.DivIcon({
  className: "", // remove default Leaflet styles
  html: `
    <div style="transform: translate(-50%, -100%);">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="red" stroke="white" stroke-width="2" viewBox="0 0 24 24">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        <circle cx="12" cy="9" r="2" fill="white"/>
      </svg>
    </div>
  `,
  iconAnchor: [16, 32],
})

export function LocationPicker({ center, radius }: Props) {
  // Ensure radius is within reasonable bounds and in meters
  const validRadius = Math.max(10, Math.min(500000, radius))
  
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
          <RecenterMap center={center} radius={validRadius} />
          <Marker position={center} icon={RedMarkerIcon} />
          <Circle
            center={center}
            radius={validRadius}
            pathOptions={{ 
              color: "lime", 
              weight: 2, 
              fillOpacity: 0.15,
              fillColor: "lime"
            }}
          />
        </>
      )}
    </MapContainer>
  )
}