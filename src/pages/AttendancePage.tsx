import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { AttendanceModal } from "../components/AttendanceModal"
import { getSessionInfo, submitAttendance } from "../services/api"
import { calculateDistance } from "../services/location"

type LocationStatus = "checking" | "allowed" | "denied" | "expired" | "already_submitted"

export default function AttendancePage() {
  const { sessionId } = useParams<{ sessionId: string }>()

  const geolocationAvailable =
    typeof navigator !== "undefined" && "geolocation" in navigator

  const [locationStatus, setLocationStatus] = useState<LocationStatus>(() => {
    if (!sessionId) return "denied"
    if (!geolocationAvailable) return "denied"
    
    // Check if user has already submitted for this session
    const submittedSessions = JSON.parse(localStorage.getItem('submittedSessions') || '[]')
    if (submittedSessions.includes(sessionId)) {
      return "already_submitted"
    }
    
    return "checking"
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionCenter, setSessionCenter] = useState<{
    lat: number
    lng: number
  } | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) return

    // Load session info from backend to confirm session is active and get class coordinates.
    getSessionInfo(sessionId)
      .then((info) => {
        // If the session is no longer active, immediately show expired message.
        if (!info.isActive) {
          setLocationStatus("expired")
          return
        }

        if (!geolocationAvailable) {
          setLocationStatus("denied")
          return
        }

        // We only use session info for UX; backend remains source of truth.
        // We don't expose exact coordinates here to keep URL simple.

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const student = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            }

            // Compute distance between student and class center.
            const distance = calculateDistance(
              student.lat,
              student.lng,
              info.latitude,
              info.longitude
            )

            if (distance > info.radiusMeters) {
              setLocationStatus("denied")
            } else {
              setSessionCenter(student)
              setLocationStatus("allowed")
            }
          },
          () => setLocationStatus("denied"),
          { enableHighAccuracy: true }
        )
      })
      .catch(() => {
        setLocationStatus("denied")
      })
  }, [sessionId, geolocationAvailable])

  const handleSubmit = async (data: {
    fullName: string
    studentNumber: string
    studentId: string
    indexNumber: string
  }) => {
    if (!sessionId || !sessionCenter) return

    try {
      setSubmitting(true)
      setError(null)
      setSuccess(null)

      await submitAttendance(sessionId, {
        ...data,
        latitude: sessionCenter.lat,
        longitude: sessionCenter.lng,
      })

      // Mark this session as submitted for this device
      const submittedSessions = JSON.parse(localStorage.getItem('submittedSessions') || '[]')
      if (!submittedSessions.includes(sessionId)) {
        submittedSessions.push(sessionId)
        localStorage.setItem('submittedSessions', JSON.stringify(submittedSessions))
      }

      setSubmitted(true)
      setSuccess("Attendance recorded successfully.")
    } catch (err) {
      console.log(err);
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <AttendanceModal
        status={locationStatus}
        submitting={submitting}
        error={error}
        success={success}
        submitted={submitted}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
