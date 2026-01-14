import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import AdminDashboard from "./pages/AdminDashboard"
import CreateSession from "./pages/CreateSession"
import AttendancePage from "./pages/AttendancePage"
import AdminAuth from "./pages/AdminAuth"
import  type{ ReactNode } from "react"

function ProtectedRoute({ children }: Readonly<{ children: ReactNode }>) {
  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null
  if (!token) return <Navigate to="/" replace />
  return <>{children}</>
}


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page: admin auth */}
        <Route path="/" element={<AdminAuth />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/create"
          element={
            <ProtectedRoute>
              <CreateSession />
            </ProtectedRoute>
          }
        />
        <Route path="/attendance/:sessionId" element={<AttendancePage />} />
      </Routes>
    </BrowserRouter>
  )
}
