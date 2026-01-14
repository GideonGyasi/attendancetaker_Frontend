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

  const handleUseCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported in this browser.")
      return
    }

    setError("")
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      },
      () => {
        setError("Please enable location services and allow access to your location.")
      },
      { enableHighAccuracy: true }
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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight">
            Create Attendance Session
          </h1>
          <p className="text-slate-400 mt-1">
            Confirm your current location and set attendance boundary
          </p>
        </header>

        {/* Form Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-8">

          {/* Course Name */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Course / Class Name
            </label>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="e.g. CSM 352 – Distributed Systems"
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-3 focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Map Location Picker */}
          <div className="space-y-4">
            <label className="block text-sm text-slate-400">
              Current Location (Marker shows where attendance is allowed)
            </label>

            <LocationPicker center={center} radius={radius} />

            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="mt-3 inline-flex items-center px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium transition"
            >
              Use my current location
            </button>

            {/* Radius Slider */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Allowed Radius: <span className="text-green-400">{radius}m</span>
              </label>
              <input
                type="range"
                min={10}
                max={300}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {center && (
              <p className="text-xs text-slate-500">
                Lat: {center.lat.toFixed(6)} | Lng: {center.lng.toFixed(6)}
              </p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Session Duration (minutes)
            </label>
            <input
              type="number"
              min={1}
              max={180}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-32 rounded-lg bg-slate-950 border border-slate-800 px-4 py-2 focus:outline-none focus:border-green-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              Link will automatically expire after this time.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row justify-between gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => navigate("/admin")}
              className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
            >
              Cancel
            </button>

            <button
              onClick={handleCreateSession}
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-60 disabled:cursor-not-allowed transition font-medium"
            >
              {loading ? "Creating..." : "Create Session"}
            </button>
          </div>

          {/* Shareable Link */}
          {shareableLink && (
            <div className="bg-slate-800 p-4 rounded-lg text-green-400 space-y-3">
              <p className="text-sm">Share this link with students:</p>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <p className="break-all font-mono text-xs bg-slate-900 px-3 py-2 rounded-lg">
                  {shareableLink}
                </p>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(shareableLink)}
                  className="self-start md:self-auto px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-xs font-medium transition"
                >
                  Copy link
                </button>
              </div>

              <div className="flex flex-col items-start gap-2">
                <p className="text-xs text-slate-300">Or let students scan this code:</p>
                <div className="bg-white p-2 rounded-md inline-block">
                  <QRCode value={shareableLink} size={120} />
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && <p className="text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  )
}
