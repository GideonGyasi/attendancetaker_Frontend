import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { adminLogin, adminRegister } from "../services/api"

export default function AdminAuth() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // ✅ ADDED: auto-fill email on return visit
  useEffect(() => {
    const savedEmail = localStorage.getItem("adminEmail")
    if (savedEmail) {
      setEmail(savedEmail)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.")
      return
    }

    try {
      setLoading(true)
      const fn = mode === "login" ? adminLogin : adminRegister
      const res = await fn(email.trim(), password)

      // ✅ already correct
      localStorage.setItem("adminToken", res.token)
      localStorage.setItem("adminEmail", res.email)

      navigate("/admin", { replace: true })
    } catch (err) {
      console.log(err)
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-indigo-200 rounded-full opacity-20 animate-pulse delay-500"></div>

      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm border border-white/20 rounded-2xl p-8 space-y-6 shadow-2xl relative z-10">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Admin Access
          </h1>
          <p className="text-gray-600 text-sm">
            Sign in to manage attendance sessions and download responses.
          </p>
        </div>

        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              mode === "login"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              mode === "register"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl bg-white border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl bg-white border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 rounded-xl p-4 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold"
          >
            {loading
              ? mode === "login"
                ? "Logging in..."
                : "Registering..."
              : mode === "login"
              ? "Log In as Admin"
              : "Register Admin"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate("/attendance/demo")}
          className="w-full text-xs text-gray-500 hover:text-blue-600 mt-4"
        >
          Continue as student (use shared attendance link)
        </button>
      </div>
    </div>
  )
}
