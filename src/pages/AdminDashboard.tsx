import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import StatCard from "../components/StatCard"
import SessionRow from "../components/SessionRow"
import ConfirmationModal from "../components/ConfirmationModal"
import {
  getAdminSummary,
  getAdminSessions,
  deleteAdminSession,
  submitManualAttendance,
  type AdminSessionRow,
} from "../services/api"

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState({
    totalSessions: 0,
    activeSessions: 0,
    totalSubmissions: 0,
  })
  const [sessions, setSessions] = useState<AdminSessionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [logoutModalOpen, setLogoutModalOpen] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)
  const [manualEntryModalOpen, setManualEntryModalOpen] = useState(false)
  const [sessionForManualEntry, setSessionForManualEntry] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [addingManual, setAddingManual] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const [sum, sess] = await Promise.all([
          getAdminSummary(),
          getAdminSessions(),
        ])
        setSummary(sum)
        setSessions(sess)
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const handleManualEntry = (token: string) => {
    setSessionForManualEntry(token)
    setManualEntryModalOpen(true)
  }

  const handleDelete = (token: string) => {
    setSessionToDelete(token)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!sessionToDelete) return
    try {
      setDeleting(true)
      await deleteAdminSession(sessionToDelete)
      setSessions((prev) => prev.filter((s) => s.token !== sessionToDelete))
      setSummary((prev) => ({
        ...prev,
        totalSessions: Math.max(prev.totalSessions - 1, 0),
        // totalSubmissions is approximate here; could be re-fetched if needed
      }))
      setDeleteModalOpen(false)
      setSessionToDelete(null)
    } catch (err) {
      console.log(err);
      alert('Failed to delete session. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const confirmManualEntry = async (data: {
    fullName: string
    studentNumber: string
    indexNumber: string
  }) => {
    if (!sessionForManualEntry) return
    try {
      setAddingManual(true)
      await submitManualAttendance(sessionForManualEntry, data)
      // Refresh sessions to update submission count
      const sess = await getAdminSessions()
      setSessions(sess)
      setManualEntryModalOpen(false)
      setSessionForManualEntry(null)
    } catch (err) {
      console.log(err)
      alert('Failed to add manual attendance. Please try again.')
    } finally {
      setAddingManual(false)
    }
  }

  const confirmLogout = async () => {
    try {
      setLoggingOut(true)
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500))
      localStorage.removeItem("adminToken")
      localStorage.removeItem("adminEmail")
      navigate("/", { replace: true })
    } catch (err) {
      console.log(err)
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <button
              onClick={() => setLogoutModalOpen(true)}
              disabled={loggingOut}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-60 disabled:cursor-not-allowed text-gray-700 font-medium transition-all hover:shadow-sm self-start"
            >
              {loggingOut ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
                  Logging out...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Logout
                </>
              )}
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Attendance Dashboard
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Create and manage class attendance sessions
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/admin/create")}
            className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all font-medium text-white shadow-sm hover:shadow-md flex items-center gap-2 self-start sm:self-auto"
          >
            <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Session
          </button>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <StatCard
            title="Total Sessions"
            value={String(summary.totalSessions)}
            icon="📊"
            color="blue"
          />
          <StatCard
            title="Active Sessions"
            value={String(summary.activeSessions)}
            icon="🎯"
            color="green"
          />
          <StatCard
            title="Total Submissions"
            value={String(summary.totalSubmissions)}
            icon="👥"
            color="purple"
          />
        </section>

        {/* Error / Loading */}
        {error && (
          <p className="text-red-400 mb-4 text-sm">{error}</p>
        )}

        {/* Sessions Table */}
        <section className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Recent Sessions</h2>
            {loading && (
              <span className="text-xs text-gray-500">Loading...</span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium">Course</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium">Date</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium">Radius</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium">Submissions</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium">Status</th>
                  <th className="px-4 sm:px-6 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {sessions.length === 0 && !loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 sm:px-6 py-8 text-center text-gray-500 text-sm"
                    >
                      No sessions yet. Create your first attendance session.
                    </td>
                  </tr>
                ) : (
                  sessions.map((s) => (
                    <SessionRow
                      key={s.token}
                      token={s.token}
                      courseName={s.courseName}
                      createdAt={s.createdAt}
                      radiusMeters={s.radiusMeters}
                      startsAt={s.startsAt}
                      endsAt={s.endsAt}
                      submissions={s.submissions}
                      onDelete={() => handleDelete(s.token)}
                      onManualEntry={() => handleManualEntry(s.token)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setSessionToDelete(null)
        }}
        onConfirm={confirmDelete}
        title="Delete Session"
        message="Are you sure you want to delete this session? This will permanently remove the session and all associated attendance records. This action cannot be undone."
        confirmText="Delete Session"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        loading={deleting}
      />

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={confirmLogout}
        title="Logout"
        message="Are you sure you want to logout? You'll need to login again to access the admin dashboard."
        confirmText="Logout"
        confirmButtonClass="bg-blue-600 hover:bg-blue-700"
        loading={loggingOut}
      />

      {/* Manual Entry Modal */}
      {manualEntryModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm z-50">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-100 to-blue-100 rounded-full -mr-10 -mt-10 opacity-50"></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Manual Attendance Entry
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  confirmManualEntry({
                    fullName: String(formData.get("fullName") || ""),
                    studentNumber: String(formData.get("studentNumber") || ""),
                    indexNumber: String(formData.get("indexNumber") || ""),
                  })
                }}
                className="space-y-4"
              >
                <div>
                  <input
                    name="fullName"
                    type="text"
                    placeholder="Full Name"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <input
                    name="studentNumber"
                    type="text"
                    placeholder="Student Number"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <input
                    name="indexNumber"
                    type="text"
                    placeholder="Index Number"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setManualEntryModalOpen(false)
                      setSessionForManualEntry(null)
                    }}
                    disabled={addingManual}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-60 disabled:cursor-not-allowed text-gray-700 transition-all py-3 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingManual}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white transition-all py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    {addingManual && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    {addingManual ? "Adding..." : "Add Attendance"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
