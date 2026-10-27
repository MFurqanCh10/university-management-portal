
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegister(event) {
    event.preventDefault();
    setMessage("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(data.message || "Registration failed. Please try again.");
        return;
      }

      setSuccess(true);
      setMessage("Your account has been created successfully.");
      setName("");
      setEmail("");
      setPassword("");
    } catch {
      setMessage("Cannot connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-blue-700 p-10 text-white md:flex lg:p-14">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 -left-16 h-72 w-72 rounded-full bg-indigo-400/30 blur-3xl" />

          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl font-bold text-blue-700">
              U
            </div>
            <p className="mt-5 text-sm font-semibold tracking-[0.2em] text-blue-100">
              UNIVERSITY PORTAL
            </p>
          </div>

          <div className="relative py-12">
            <span className="inline-flex rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-medium">
              GET STARTED
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight lg:text-5xl">
              Your academic journey starts here.
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-7 text-blue-100">
              Create your account to access a central place for university
              student records, courses, and departments.
            </p>

            <div className="mt-8 space-y-4 text-sm text-white/90">
              <p>✓ One convenient university portal</p>
              <p>✓ Easy access to academic information</p>
              <p>✓ Secure account authentication</p>
            </div>
          </div>

          <p className="relative text-sm text-blue-100">
            University Management System
          </p>
        </section>

        <section className="p-6 sm:p-10 lg:p-14">
          <div className="mb-8 md:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white">
              U
            </div>
            <p className="mt-3 text-xs font-bold tracking-[0.2em] text-blue-700">
              UNIVERSITY PORTAL
            </p>
          </div>

          <p className="text-sm font-semibold text-blue-700">
            CREATE YOUR ACCOUNT
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Join the university portal
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Fill in your details below to get started.
          </p>

          {message && (
            <div
              role={success ? "status" : "alert"}
              className={`mt-6 rounded-xl border px-4 py-3 text-sm ${
                success
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleRegister} className="mt-7 space-y-4">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Full name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                minLength={2}
                maxLength={100}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

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
                maxLength={255}
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
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                maxLength={72}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
              <p className="mt-2 text-xs text-slate-500">
                Use at least 8 characters.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
              {!loading && <span aria-hidden="true">→</span>}
            </button>
          </form>

          {success && (
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="mt-3 w-full rounded-xl border border-blue-200 px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              Continue to login
            </button>
          )}

          <p className="mt-7 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-700 hover:text-blue-800"
            >
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
