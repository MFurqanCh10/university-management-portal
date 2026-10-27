
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function checkSession() {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/auth/me",
                    { credentials: "include" }
                );

                if (!response.ok) {
                    router.replace("/login");
                    return;
                }

                const data = await response.json();

                if (active) setUser(data.user);
            } catch {
                if (active) {
                    setError("Unable to connect to the server.");
                }
            } finally {
                if (active) setLoading(false);
            }
        }

        checkSession();

        return () => {
            active = false;
        };
    }, [router]);

    async function handleLogout() {
        setLoggingOut(true);
        setError("");

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/logout",
                {
                    method: "POST",
                    credentials: "include",
                }
            );

            if (!response.ok) {
                setError("Logout failed. Please try again.");
                setLoggingOut(false);
                return;
            }

            router.replace("/login");
            router.refresh();
        } catch {
            setError("Unable to connect to the server. Please try again.");
            setLoggingOut(false);
        }
    }

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-100">
                <div className="rounded-2xl bg-white px-8 py-7 text-center shadow-sm">
                    <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
                    <p className="mt-4 text-sm font-medium text-slate-600">
                        Checking your session...
                    </p>
                </div>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
                <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                    <p className="text-slate-700">
                        {error || "Redirecting to login..."}
                    </p>
                    {error && (
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                        >
                            Try again
                        </button>
                    )}
                </div>
            </main>
        );
    }

    const sections = [
        {
            title: "Student Management",
            description: "Create, search, edit, and manage student records.",
            href: "/",
            icon: "01",
        },
        {
            title: "Departments",
            description: "View and manage university departments.",
            href: "/departments",
            icon: "02",
        },
        {
            title: "Courses",
            description: "Access courses and academic information.",
            href: "/courses",
            icon: "03",
        },
    ];

    return (
        <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-8">
            <div className="mx-auto max-w-7xl">
                <header className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-slate-950 px-6 py-6 text-white shadow-lg sm:px-9 sm:py-8">
                    <div>
                        <p className="text-xs font-bold tracking-[0.2em] text-blue-300">
                            UNIVERSITY MANAGEMENT SYSTEM
                        </p>
                        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
                            Your dashboard
                        </h1>
                        <p className="mt-2 text-sm text-slate-300">
                            Welcome back. What would you like to manage today?
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-60"
                    >
                        {loggingOut ? "Signing out..." : "Log out ↗"}
                    </button>
                </header>

                {error && (
                    <div
                        role="alert"
                        className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                        {error}
                    </div>
                )}

                <section className="mb-8 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                        <p className="text-sm font-semibold text-blue-700">
                            ACCOUNT OVERVIEW
                        </p>
                        <h2 className="mt-3 text-2xl font-bold text-slate-900">
                            You're signed in!
                        </h2>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                            Your session has been verified. Choose a section below to
                            continue working with university records.
                        </p>

                        <div className="mt-6 rounded-xl bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Authenticated user ID
                            </p>
                            <p className="mt-1 break-all text-lg font-bold text-slate-900">
                                {user.id}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-blue-600 p-6 text-white shadow-sm sm:p-8">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl">
                            ✓
                        </div>
                        <h2 className="mt-5 text-xl font-bold">Secure session</h2>
                        <p className="mt-2 text-sm leading-6 text-blue-100">
                            Your browser session was verified by the backend authentication
                            endpoint.
                        </p>
                        <p className="mt-5 text-xs text-blue-100">
                            Session status: Authenticated
                        </p>
                    </div>
                </section>

                <section>
                    <div className="mb-5">
                        <h2 className="text-xl font-bold text-slate-900">
                            University workspace
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Choose a section to open.
                        </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {sections.map((section) => (
                            <Link
                                key={section.href}
                                href={section.href}
                                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                            >
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">
                                    {section.icon}
                                </div>

                                <h3 className="mt-5 text-lg font-bold text-slate-900">
                                    {section.title}
                                </h3>

                                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                                    {section.description}
                                </p>

                                <p className="mt-5 text-sm font-semibold text-blue-700">
                                    Open section <span aria-hidden="true">→</span>
                                </p>
                            </Link>
                        ))}
                    </div>
                </section>

                <footer className="mt-10 border-t border-slate-200 py-5 text-center text-xs text-slate-500">
                    University Management System · Secure account access
                </footer>
            </div>
        </main>
    );
}
