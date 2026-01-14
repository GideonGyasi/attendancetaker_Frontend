import React from "react"

type Props = {
  status: "checking" | "allowed" | "denied" | "expired"
  submitting: boolean
  error: string | null
  success: string | null
  submitted: boolean
  onSubmit: (data: {
    fullName: string
    studentNumber: string
    studentId: string
    indexNumber: string
  }) => void
}

export function AttendanceModal({
  status,
  submitting,
  error,
  success,
  submitted,
  onSubmit,
}: Props) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    onSubmit({
      fullName: String(formData.get("fullName") || ""),
      studentNumber: String(formData.get("studentNumber") || ""),
      studentId: String(formData.get("studentId") || ""),
      indexNumber: String(formData.get("indexNumber") || ""),
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-slate-100">
          Class Attendance
        </h2>

        {status === "checking" && (
          <p className="text-slate-400">Checking your location...</p>
        )}

        {status === "denied" && (
          <p className="text-red-400">
            You are not in the class location. Please move closer and enable location services.
          </p>
        )}

        {status === "expired" && (
          <p className="text-red-400">
            Attendance for this class has already been taken. This link is no longer active.
          </p>
        )}

        {status === "allowed" && (
          <div className="space-y-4">
            {submitted ? (
              <div className="bg-green-900/40 border border-green-700 text-green-200 rounded-lg p-4">
                {success || "Attendance recorded successfully."}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  name="fullName"
                  type="text"
                  placeholder="Full Name"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700"
                />

                <input
                  name="studentNumber"
                  type="text"
                  placeholder="Student Number"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700"
                />

                <input
                  name="studentId"
                  type="text"
                  placeholder="Student ID"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700"
                />

                <input
                  name="indexNumber"
                  type="text"
                  placeholder="Index Number"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700"
                />

                {error && <p className="text-red-400 text-sm">{error}</p>}
                {success && !error && (
                  <p className="text-green-400 text-sm">{success}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-60 disabled:cursor-not-allowed transition py-3 rounded-lg font-medium"
                >
                  {submitting ? "Submitting..." : "Submit Attendance"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
