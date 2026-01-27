import React, { useState, useEffect } from "react"

type Props = {
  status: "checking" | "allowed" | "denied" | "expired"
  submitting: boolean
  error: string | null
  success: string | null
  submitted: boolean
  onSubmit: (data: {
    fullName: string
    studentNumber: string
    indexNumber: string
    captchaAnswer: number
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
  const [captchaQuestion, setCaptchaQuestion] = useState("")
  const [captchaAnswer, setCaptchaAnswer] = useState(0)

  useEffect(() => {
    // Generate a simple math question
    const num1 = Math.floor(Math.random() * 10) + 1
    const num2 = Math.floor(Math.random() * 10) + 1
    setCaptchaQuestion(`${num1} + ${num2} = ?`)
    setCaptchaAnswer(num1 + num2)
  }, [])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const userAnswer = parseInt(String(formData.get("captcha") || "0"), 10)
    if (userAnswer !== captchaAnswer) {
      alert("Incorrect CAPTCHA answer. Please try again.")
      return
    }

    onSubmit({
      fullName: String(formData.get("fullName") || ""),
      studentNumber: String(formData.get("studentNumber") || ""),
      indexNumber: String(formData.get("indexNumber") || ""),
      captchaAnswer: userAnswer,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -mr-10 -mt-10 opacity-50"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Class Attendance
          </h2>

        {status === "checking" && (
          <div className="flex items-center gap-3 text-gray-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <p>Checking your location...</p>
          </div>
        )}

        {status === "denied" && (
          <div className="flex justify-center">
  <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
    <div className="flex items-center gap-2">
      <svg
        className="w-5 h-5 text-red-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
      <p className="font-medium">You are not in the class</p>
    </div>
  </div>
</div>

        )}

        {status === "expired" && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="font-medium">Link expired</p>
            </div>
            <p className="mt-2 text-sm">Attendance for this class has already been taken.</p>
          </div>
        )}

        {status === "allowed" && (
          <div className="space-y-4">
            {submitted ? (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-medium">Success!</p>
                </div>
                <p className="mt-2 text-sm">{success || "Attendance recorded successfully."}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    name="fullName"
                    type="text"
                    placeholder="Full Name"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <input
                    name="studentNumber"
                    type="text"
                    placeholder="Student Number"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <input
                    name="indexNumber"
                    type="text"
                    placeholder="Index Number"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Security Check: {captchaQuestion}
                  </label>
                  <input
                    name="captcha"
                    type="number"
                    placeholder="Answer"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white transition-all py-3 rounded-lg font-medium shadow-sm hover:shadow-md"
                >
                  {submitting ? "Submitting..." : "Submit Attendance"}
                </button>
              </form>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
