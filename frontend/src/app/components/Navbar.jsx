
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

const API_URL = "http://localhost:5000/api";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  const linkClass = (path) =>
    `rounded-lg px-3 py-2 text-sm font-semibold transition ${
      pathname === path
        ? "bg-blue-50 text-blue-700"
        : "text-slate-600 hover:bg-slate-100 hover:text-blue-700"
    }`;

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-8">
        <Link
          href="/"
          className="text-lg font-bold text-slate-900"
        >
          University Portal
        </Link>

        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <Link href="/dashboard" className={linkClass("/dashboard")}>
            Dashboard
          </Link>

          <Link href="/" className={linkClass("/")}>
            Students
          </Link>

          <Link
            href="/departments"
            className={linkClass("/departments")}
          >
            Departments
          </Link>

          <Link href="/courses" className={linkClass("/courses")}>
            Courses
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60"
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </nav>
  );
}
