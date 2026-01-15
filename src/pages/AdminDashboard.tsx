import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import StatCard from "../components/StatCard"
import SessionRow from "../components/SessionRow"
import ConfirmationModal from "../components/ConfirmationModal"
import {
  getAdminSummary,
  getAdminSessions,
  deleteAdminSession,
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

  const handleDelete = (token: string) => {
    setSessionToDelete(token)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!sessionToDelete) return
    try {
      await deleteAdminSession(sessionToDelete)
      setSessions((prev) => prev.filter((s) => s.token !== sessionToDelete))
      setSummary((prev) => ({
        ...prev,
        totalSessions: Math.max(prev.totalSessions - 1, 0),
        // totalSubmissions is approximate here; could be re-fetched if needed
      }))
    } catch (err) {
      console.log(err);
    } finally {
      setDeleteModalOpen(false)
      setSessionToDelete(null)
    }
  }

  const confirmLogout = () => {
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminEmail")
    navigate("/", { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLogoutModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-all hover:shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Logout
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Attendance Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Create and manage class attendance sessions
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/admin/create")}
            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all font-medium text-white shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Session
          </button>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
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
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Recent Sessions</h2>
            {loading && (
              <span className="text-xs text-gray-500">Loading...</span>
            )}
          </div>

          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Course</th>
                <th className="px-6 py-3 text-left font-medium">Date</th>
                <th className="px-6 py-3 text-left font-medium">Radius</th>
                <th className="px-6 py-3 text-left font-medium">Submissions</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
                <th className="px-6 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {sessions.length === 0 && !loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500 text-sm"
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
                  />
                ))
              )}
            </tbody>
          </table>
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
      />
    </div>
  )
}
