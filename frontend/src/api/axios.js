import axios from "axios";

// withCredentials is required so the browser sends/receives the
// httpOnly auth cookie set by the backend on login. Without this,
// the admin dashboard would appear logged out on every request.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: true,
});

export default api;
