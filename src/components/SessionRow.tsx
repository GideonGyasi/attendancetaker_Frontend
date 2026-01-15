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

  const downloadCsv = async () => {
    const authToken = localStorage.getItem("adminToken")
    if (!authToken) {
      alert('You must be logged in to download attendance data.')
      return
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:4000"}/api/sessions/${token}/attendance.csv`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          alert('Authentication failed. Please log in again.')
          return
        }
        throw new Error('Failed to download CSV')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${courseName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_attendance.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading CSV:', error)
      alert('Failed to download CSV. Please try again.')
    }
  }

  return (
    <tr className="border-t border-gray-200 hover:bg-blue-50 transition-all duration-200 hover:shadow-sm group">
      <td className="px-6 py-4 text-gray-900 font-semibold group-hover:text-blue-700 transition-colors">{courseName}</td>
      <td className="px-6 py-4 text-gray-600 group-hover:text-gray-800 transition-colors">{dateLabel}</td>
      <td className="px-6 py-4 text-gray-900 font-medium group-hover:text-blue-600 transition-colors">{radiusMeters}m</td>
      <td className="px-6 py-4 text-gray-900 font-medium group-hover:text-green-600 transition-colors">{submissions}</td>
      <td className="px-6 py-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
            isActive
              ? "bg-green-100 text-green-800 group-hover:bg-green-200"
              : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
          }`}
        >
          {isActive ? "Active" : "Ended"}
        </span>
      </td>
      <td className="px-6 py-4 text-right space-x-3">
        <button
          type="button"
          onClick={downloadCsv}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-all duration-200 hover:scale-105 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-blue-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download CSV
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="text-red-600 hover:text-red-800 text-sm font-medium transition-all duration-200 hover:scale-105 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-red-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </button>
      </td>
    </tr>
  )
}
