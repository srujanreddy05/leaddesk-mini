import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/axios";

/**
 * Guards admin-only routes. Since the auth token lives in an httpOnly
 * cookie (invisible to JS), the only way to know "am I logged in?" is
 * to ask the backend — which is exactly what should happen on a fresh
 * browser with no local state.
 */
export default function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    api
      .get("/auth/me")
      .then(() => {
        if (!cancelled) setAuthed(true);
      })
      .catch(() => {
        if (!cancelled) setAuthed(false);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Checking session...
      </div>
    );
  }

  if (!authed) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
