"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const API_URL = "http://localhost:5000/api";

export default function StudentDetailsPage() {
    const { id } = useParams();

    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadStudent() {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${API_URL}/students/${id}`, {
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to load student"
                    );
                }

                setStudent(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            loadStudent();
        }
    }, [id]);

    if (loading) {
        return <main className="p-8">Loading student details...</main>;
    }

    if (error) {
        return (
            <main className="mx-auto max-w-3xl p-8">
                <p className="text-red-600">{error}</p>
                <Link href="/" className="mt-4 inline-block text-blue-600">
                    Back to Students
                </Link>
            </main>
        );
    }

    if (!student) return null;

    const profile = student.StudentProfile;
    const courses = student.Courses || [];

    return (
        <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-8">
            <div className="mx-auto max-w-4xl">
                <Link
                    href="/"
                    className="mb-6 inline-block text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                    ← Back to Students
                </Link>

                <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                    <p className="text-sm font-semibold text-blue-600">
                        STUDENT PROFILE
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-slate-900">
                        {student.name}
                    </h1>

                    <p className="mt-2 text-slate-500">
                        Student ID: {student.id}
                    </p>

                    <div className="mt-8 grid gap-5 sm:grid-cols-2">
                        <Detail label="Full Name" value={student.name} />
                        <Detail label="Email" value={student.email} />
                        <Detail label="Phone" value={profile?.phone} />
                        <Detail label="Address" value={profile?.address} />
                        <Detail
                            label="Department"
                            value={student.Department?.name}
                        />
                    </div>

                    <div className="mt-8 border-t border-slate-100 pt-6">
                        <h2 className="text-lg font-bold text-slate-900">
                            Enrolled Courses
                        </h2>

                        {courses.length > 0 ? (
                            <ul className="mt-4 flex flex-wrap gap-2">
                                {courses.map((course) => (
                                    <li
                                        key={course.id}
                                        className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700"
                                    >
                                        {course.title}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-3 text-sm text-slate-500">
                                No courses assigned.
                            </p>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}

function Detail({ label, value }) {
    return (
        <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {label}
            </p>

            <p className="mt-2 break-words font-medium text-slate-900">
                {value || "Not provided"}
            </p>
        </div>
    );
}