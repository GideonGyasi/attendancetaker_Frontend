type Props = {
  token: string
  courseName: string
  createdAt: string
  radiusMeters: number
  startsAt: string
  endsAt: string
  submissions: number
  onDelete: () => void
}

export default function SessionRow({
  token,
  courseName,
  createdAt,
  radiusMeters,
  startsAt,
  endsAt,
  submissions,
  onDelete,
}: Props) {
  const start = new Date(startsAt)
  const end = new Date(endsAt)
  const now = new Date()
  const isActive = now >= start && now <= end

  const dateLabel = new Date(createdAt).toLocaleString()

  const downloadCsv = () => {
    const url = `${import.meta.env.VITE_BACKEND_URL || "http://localhost:4000"}/api/sessions/${token}/attendance.csv`
    window.open(url, "_blank")
  }

  return (
    <tr className="border-t border-slate-800 hover:bg-slate-900/60 transition">
      <td className="px-6 py-4">{courseName}</td>
      <td className="px-6 py-4 text-slate-400">{dateLabel}</td>
      <td className="px-6 py-4">{radiusMeters}m</td>
      <td className="px-6 py-4">{submissions}</td>
      <td className="px-6 py-4">
        <span
          className={`px-2 py-1 rounded-md text-xs ${
            isActive
              ? "bg-green-500/10 text-green-400"
              : "bg-slate-500/10 text-slate-400"
          }`}
        >
          {isActive ? "Active" : "Ended"}
        </span>
      </td>
      <td className="px-6 py-4 text-right space-x-3">
        <button
          type="button"
          onClick={downloadCsv}
          className="text-green-400 hover:text-green-300 text-xs"
        >
          Download CSV
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="text-red-400 hover:text-red-300 text-xs"
        >
          Delete
        </button>
      </td>
    </tr>
  )
}
