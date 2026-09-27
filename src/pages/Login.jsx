import { useState } from "react";
import { Navigate } from "react-router-dom";
import { api, apiErrorMessage } from "../lib/api";
import { useAuthStore } from "../store/authStore";

export default function Login() {
  const token = useAuthStore((s) => s.token);
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (token) return <Navigate to="/" replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.token, data.admin);
    } catch (err) {
      setError(apiErrorMessage(err, "Invalid email or password."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="card w-full max-w-sm p-8">
        <div className="mb-6 text-center">
          <div className="font-serif text-2xl font-semibold tracking-wide">Rishi Home Interior</div>
          <div className="mt-1 text-xs uppercase tracking-[0.2em] text-neutral-400">Studio Admin</div>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@rishihomeinterior.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn-primary w-full" type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
