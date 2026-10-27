
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(data.message || "Unable to log in. Please try again.");
        return;
      }

      router.replace("/dashboard");
    } catch {
      setMessage("Cannot connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-10 text-white md:flex lg:p-14">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-600/30 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold">
              U
            </div>
            <p className="mt-5 text-sm font-semibold tracking-[0.2em] text-blue-300">
              UNIVERSITY PORTAL
            </p>
          </div>

          <div className="relative py-12">
            <p className="mb-4 text-sm font-medium text-blue-300">
              YOUR CAMPUS, CONNECTED
            </p>
            <h1 className="text-4xl font-bold leading-tight lg:text-5xl">
              Manage your university life in one place.
            </h1>
            <p className="mt-5 max-w-sm leading-7 text-slate-300">
              Access student records, departments, courses, and academic
              information through one convenient platform.
            </p>
          </div>

          <p className="relative text-sm text-slate-400">
            University Management System
          </p>
        </section>

        <section className="p-6 sm:p-10 lg:p-14">
          <div className="mb-10 md:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white">
              U
            </div>
            <p className="mt-3 text-xs font-bold tracking-[0.2em] text-blue-700">
              UNIVERSITY PORTAL
            </p>
          </div>

          <p className="text-sm font-semibold text-blue-700">
            WELCOME BACK
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Sign in to your account
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Enter your credentials to access your university dashboard.
          </p>

          {message && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {message}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in to dashboard"}
              {!loading && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-blue-700 hover:text-blue-800"
            >
              Create an account
            </Link>
          </p>

          <p className="mt-10 text-center text-xs text-slate-400">
            Secure access · University Management System
          </p>
        </section>
      </div>
    </main>
  );
}
