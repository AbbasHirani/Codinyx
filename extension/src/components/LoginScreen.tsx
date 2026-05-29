import { useState } from "react";
import { login } from "@/lib/api";
import { useSession } from "@/store/session";

export default function LoginScreen() {
  const setToken = useSession((s) => s.setToken);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const token = await login(email, password);
      await chrome.storage.local.set({ token });
      setToken(token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-xs">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="text-white font-semibold text-base">Codinyx</span>
        </div>

        <h1 className="text-lg font-semibold text-white mb-1">Welcome back</h1>
        <p className="text-xs text-[#6b6b7a] mb-6">Sign in to your Codinyx account</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs text-[#8b8b9a] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-[#1a1a1f] border border-[#2a2a35] text-white text-xs placeholder:text-[#4a4a55] focus:outline-none focus:border-violet-500 transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs text-[#8b8b9a] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-[#1a1a1f] border border-[#2a2a35] text-white text-xs placeholder:text-[#4a4a55] focus:outline-none focus:border-violet-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors mt-1"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-xs text-[#4a4a55] text-center mt-6">
          Don't have an account?{" "}
          <a
            href="http://localhost:3000/auth/signin"
            target="_blank"
            rel="noreferrer"
            className="text-violet-400 hover:text-violet-300"
          >
            Sign up on Codinyx
          </a>
        </p>
      </div>
    </div>
  );
}
