import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { adminLogin, adminRegister } from "../services/api"

export default function AdminAuth() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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
      localStorage.setItem("adminToken", res.token)
      localStorage.setItem("adminEmail", res.email)
      navigate("/admin", { replace: true })
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    // Placeholder: integrate Google Identity Services here.
    // For now, we simply hint that Google sign-in would go here.
    setError("Google sign-in is not configured yet. Use email/password for now.")
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Admin Access
          </h1>
          <p className="text-slate-400 text-sm">
            Sign in to manage attendance sessions and download responses.
          </p>
        </div>

        <div className="flex gap-2 bg-slate-900/60 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-md text-sm font-medium ${
              mode === "login"
                ? "bg-slate-800 text-slate-50"
                : "text-slate-400 hover:text-slate-100"
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 py-2 rounded-md text-sm font-medium ${
              mode === "register"
                ? "bg-slate-800 text-slate-50"
                : "text-slate-400 hover:text-slate-100"
            }`}
          >
            Register
          </button>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium transition"
        >
          <span>Continue with Google</span>
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-2 bg-slate-900 text-slate-500">
              Or use email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm focus:outline-none focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm focus:outline-none focus:border-green-500"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium transition"
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
          className="w-full text-xs text-slate-500 hover:text-slate-300 mt-1"
        >
          Continue as student (use shared attendance link)
        </button>
      </div>
    </div>
  )
}


