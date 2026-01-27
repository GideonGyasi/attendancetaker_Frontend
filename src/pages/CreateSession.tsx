import { useNavigate } from "react-router-dom"
import { useState } from "react"
import type { LatLngLiteral } from "leaflet"
import { LocationPicker } from "../components/LocationPicker"
import { createSession } from "../services/api"
import QRCode from "react-qr-code"

export default function CreateSession() {
  const navigate = useNavigate()

  const [courseName, setCourseName] = useState("")
  const [center, setCenter] = useState<LatLngLiteral | null>(null)
  const [radius, setRadius] = useState(50)
  const [durationMinutes, setDurationMinutes] = useState(10)
  const [error, setError] = useState("")
  const [shareableLink, setShareableLink] = useState("")
  const [loading, setLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [qrExpanded, setQrExpanded] = useState(false)

  const handleUseCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported in this browser.")
      return
    }

    setError("")
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocationLoading(false)
      },
      () => {
        setError("Please enable location services and allow access to your location.")
        setLocationLoading(false)
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 60000 // Use cached position if less than 1 minute old
      }
    )
  }

  const handleCreateSession = async () => {
    if (!courseName.trim()) {
      setError("Course name is required.")
      return
    }

    if (!center) {
      setError("Please select your current location first.")
      return
    }

    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      setError("Duration must be at least 1 minute.")
      return
    }

    try {
      setLoading(true)
      setError("")

      const now = new Date()
      const startDate = now
      const endDate = new Date(now.getTime() + durationMinutes * 60 * 1000)

      const session = await createSession({
        courseName: courseName.trim(),
        latitude: center.lat,
        longitude: center.lng,
        radiusMeters: radius,
        startsAt: startDate.toISOString(),
        endsAt: endDate.toISOString(),
      })

      const link = `${window.location.origin}${session.path}`
      setShareableLink(link)
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <header className="mb-10 relative">
          <div className="absolute -top-4 -left-4 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute -top-8 -right-8 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-pulse delay-500"></div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
          </div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Create Attendance Session
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Confirm your current location and set attendance boundary
            </p>
          </div>
        </header>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 space-y-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
          <div className="relative z-10">

          {/* Course Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course / Class Name
            </label>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="e.g. CSM 352 – Distributed Systems"
              className="w-full rounded-lg bg-white border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              aria-label="Course or Class Name"
            />
          </div>

          {/* Map Location Picker */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Current Location (Marker shows where attendance is allowed)
            </label>

            <LocationPicker
              center={center}
              radius={radius}
              onChange={setCenter}
            />


            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={locationLoading}
              className="mt-3 inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium transition-all shadow-sm hover:shadow-md"
            >
              {locationLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Getting location...
                </>
              ) : (
                "Use my current location"
              )}
            </button>

            {/* Radius Slider */}
            <div>
              <label htmlFor="radius-slider" className="block text-sm font-medium text-gray-700 mb-2">
                Allowed Radius: <span className="text-blue-600 font-semibold">{radius}m</span>
              </label>
              <input
                id="radius-slider"
                type="range"
                min={5}
                max={2000}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                title={`Current radius: ${radius} meters`}
                aria-label={`Allowed radius in meters: ${radius}`}
              />
            </div>

          {center && (
  <div className="flex flex-col md:flex-row items-start md:items-center gap-2 mt-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
    <div className="font-mono text-sm text-blue-800 select-all">
      Lat: {center.lat.toFixed(6)} | Lng: {center.lng.toFixed(6)}
    </div>
    <button
      type="button"
      onClick={() =>
        navigator.clipboard.writeText(`Lat: ${center.lat.toFixed(6)}, Lng: ${center.lng.toFixed(6)}`)
      }
      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-all shadow-sm"
    >
      Copy
    </button>
  </div>
)}

          </div>

          {/* Duration */}
          <div>
            <label htmlFor="duration-input" className="block text-sm font-medium text-gray-700 mb-2">
              Session Duration (minutes)
            </label>
            <input
              id="duration-input"
              type="number"
              min={1}
              max={180}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              placeholder="10"
              className="w-32 rounded-lg bg-white border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              aria-label="Session duration in minutes"
            />
            <p className="text-xs text-gray-500 mt-1">
              Link will automatically expire after this time.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row justify-between gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => navigate("/admin")}
              className="px-5 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-all"
            >
              Cancel
            </button>

            <button
              onClick={handleCreateSession}
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium transition-all shadow-sm hover:shadow-md"
            >
              {loading ? "Creating..." : "Create Session"}
            </button>
          </div>

          {/* Shareable Link */}
          {shareableLink && (
            <div className="bg-green-50 p-6 rounded-lg border border-green-200 space-y-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-green-800">Session created successfully!</p>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-gray-700">Share this link with students:</p>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <p className="break-all font-mono text-sm bg-white px-3 py-2 rounded-lg border border-gray-300 text-gray-800">
                    {shareableLink}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(shareableLink)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                    className="self-start md:self-auto px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all shadow-sm"
                  >
                    {copied ? "Copied!" : "Copy link"}
                  </button>
                </div>

                <div className="flex flex-col items-start gap-2">
                  <p className="text-sm text-gray-700">Or let students scan this code:</p>
                  <div className="bg-white p-3 rounded-lg border border-gray-300 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setQrExpanded(true)}>
                    <QRCode value={shareableLink} size={120} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}
          </div>
        </div>

        {/* QR Code Expanded View */}
        {qrExpanded && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setQrExpanded(false)}>
            <div className="relative bg-white p-8 rounded-lg shadow-2xl max-w-sm w-full mx-4">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setQrExpanded(false)
                }}
                className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-colors"
                aria-label="Close QR code"
              >
                ✕
              </button>
              <div className="flex flex-col items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-800">Scan to Attend</h3>
                <div className="bg-white p-4 rounded-lg border border-gray-300">
                  <QRCode value={shareableLink} size={250} />
                </div>
                <p className="text-sm text-gray-600 text-center">Tap anywhere outside to close</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
