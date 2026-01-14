import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import StatCard from "../components/StatCard"
import SessionRow from "../components/SessionRow"
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

  const handleDelete = async (token: string) => {
    if (!window.confirm("Delete this session and all its responses?")) return
    try {
      await deleteAdminSession(token)
      setSessions((prev) => prev.filter((s) => s.token !== token))
      setSummary((prev) => ({
        ...prev,
        totalSessions: Math.max(prev.totalSessions - 1, 0),
        // totalSubmissions is approximate here; could be re-fetched if needed
      }))
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Attendance Dashboard
            </h1>
            <p className="text-slate-400 mt-1">
              Create and manage class attendance sessions
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/create")}
            className="px-5 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 transition font-medium"
          >
            + New Session
          </button>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="Total Sessions" value={String(summary.totalSessions)} />
          <StatCard title="Active Sessions" value={String(summary.activeSessions)} />
          <StatCard title="Total Submissions" value={String(summary.totalSubmissions)} />
        </section>

        {/* Error / Loading */}
        {error && (
          <p className="text-red-400 mb-4 text-sm">{error}</p>
        )}

        {/* Sessions Table */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-medium">Recent Sessions</h2>
            {loading && (
              <span className="text-xs text-slate-400">Loading...</span>
            )}
          </div>

          <table className="w-full text-sm">
            <thead className="bg-slate-900/80 text-slate-400">
              <tr>
                <th className="px-6 py-3 text-left">Course</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Radius</th>
                <th className="px-6 py-3 text-left">Submissions</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {sessions.length === 0 && !loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-6 text-center text-slate-500 text-sm"
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
    </div>
  )
}
