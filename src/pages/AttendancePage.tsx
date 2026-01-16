import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { AttendanceModal } from "../components/AttendanceModal"
import { getSessionInfo, submitAttendance } from "../services/api"
import { calculateDistance } from "../services/location"

type LocationStatus = "checking" | "allowed" | "denied" | "expired"

export default function AttendancePage() {
  const { sessionId } = useParams<{ sessionId: string }>()

  const geolocationAvailable =
    typeof navigator !== "undefined" && "geolocation" in navigator

  const [locationStatus, setLocationStatus] = useState<LocationStatus>(() => {
    if (!sessionId) return "denied"
    if (!geolocationAvailable) return "denied"
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

  // ✅ ADDED: check localStorage on load
  useEffect(() => {
    if (!sessionId) return
    const alreadySubmitted = localStorage.getItem(
      `attendance_submitted_${sessionId}`
    )
    if (alreadySubmitted) {
      setSubmitted(true)
      setSuccess("You have already submitted attendance for this session.")
    }
  }, [sessionId])

  useEffect(() => {
    if (!sessionId) return

    getSessionInfo(sessionId)
      .then((info) => {
        if (!info.isActive) {
          setLocationStatus("expired")
          return
        }

        if (!geolocationAvailable) {
          setLocationStatus("denied")
          return
        }

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const student = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            }

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

    // ✅ ADDED: block repeat submission
    if (submitted) return

    try {
      setSubmitting(true)
      setError(null)
      setSuccess(null)

      await submitAttendance(sessionId, {
        ...data,
        latitude: sessionCenter.lat,
        longitude: sessionCenter.lng,
      })

      // ✅ ADDED: persist submission
      localStorage.setItem(
        `attendance_submitted_${sessionId}`,
        "true"
      )

      setSubmitted(true)
      setSuccess("Attendance recorded successfully.")
    } catch (err) {
      console.log(err)
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
