// Simple typed API client for the attendance backend
const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("adminToken");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    headers,
    ...options,
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data?.error) message = data.error;
    } catch {
      // ignore JSON parse error
    }
    throw new Error(message);
  }

  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

// ---- Sessions ----

export interface CreateSessionPayload {
  courseName: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  startsAt: string; // ISO string
  endsAt: string; // ISO string
}

export interface SessionResponse {
  token: string;
  courseName: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  startsAt: string;
  endsAt: string;
  path: string;
}

export async function createSession(
  payload: CreateSessionPayload
): Promise<SessionResponse> {
  return request<SessionResponse>("/api/sessions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface SessionInfo {
  token: string;
  courseName: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

export async function getSessionInfo(token: string): Promise<SessionInfo> {
  return request<SessionInfo>(`/api/sessions/${token}`);
}

// ---- Attendance ----

export interface AttendancePayload {
  fullName: string;
  studentNumber: string;
  studentId: string;
  indexNumber: string;
  latitude: number;
  longitude: number;
}

export interface AttendanceResponse {
  id: string;
  createdAt: string;
}

export async function submitAttendance(
  token: string,
  payload: AttendancePayload
): Promise<AttendanceResponse> {
  return request<AttendanceResponse>(`/api/attendance/${token}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ---- Admin Auth ----

export interface AuthResponse {
  token: string;
  email: string;
}

export async function adminRegister(email: string, password: string) {
  return request<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function adminLogin(email: string, password: string) {
  return request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// ---- Admin Dashboard ----

export interface AdminSummary {
  totalSessions: number;
  activeSessions: number;
  totalSubmissions: number;
}

export interface AdminSessionRow {
  token: string;
  courseName: string;
  createdAt: string;
  radiusMeters: number;
  startsAt: string;
  endsAt: string;
  submissions: number;
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("adminToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getAdminSummary(): Promise<AdminSummary> {
  return request<AdminSummary>("/api/admin/summary", {
    headers: authHeaders(),
  });
}

export async function getAdminSessions(): Promise<AdminSessionRow[]> {
  return request<AdminSessionRow[]>("/api/admin/sessions", {
    headers: authHeaders(),
  });
}

export async function deleteAdminSession(token: string): Promise<void> {
  return request<void>(`/api/admin/sessions/${token}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}
