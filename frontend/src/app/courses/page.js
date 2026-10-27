"use client";

import { useCallback, useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadCourses = useCallback(async () => {
  try {
    const response = await fetch(`${API_URL}/courses`, {
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load courses");
    }

    setCourses(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  async function createCourse(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/courses`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create course");
      }

      setTitle("");
      await loadCourses();
      setMessage("Course created successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(course) {
    setEditingId(course.id);
    setEditTitle(course.title);
    setError("");
    setMessage("");
  }

  async function saveEdit(id) {
    if (!editTitle.trim()) {
      setError("Course title is required.");
      return;
    }

    setBusyId(id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/courses/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update course");
      }

      setEditingId(null);
      await loadCourses();
      setMessage("Course updated successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function deleteCourse(id) {
    if (!window.confirm("Are you sure you want to delete this course?")) {
      return;
    }

    setBusyId(id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/courses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete course");
      }

      if (editingId === id) {
        setEditingId(null);
      }

      await loadCourses();
      setMessage("Course deleted successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500";

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-slate-900">
          Courses
        </h1>
        <p className="mt-2 text-slate-500">
          Create, edit, and manage university courses.
        </p>

        {error && (
          <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        )}

        {message && (
          <p className="mt-5 rounded-xl bg-green-50 p-4 text-sm text-green-700">
            {message}
          </p>
        )}

        <form
          onSubmit={createCourse}
          className="mt-6 rounded-2xl bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-bold">Add New Course</h2>

          <label className="mt-4 block text-sm font-medium text-slate-700">
            Course Title
            <input
              className={inputClass}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Database Systems"
              required
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="mt-4 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Add Course"}
          </button>
        </form>

        <section className="mt-8">
          <h2 className="mb-4 text-xl font-bold">
            All Courses ({courses.length})
          </h2>

          {loading ? (
            <p>Loading courses...</p>
          ) : courses.length === 0 ? (
            <p className="rounded-xl bg-white p-6 text-slate-500">
              No courses found.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <article
                  key={course.id}
                  className="rounded-2xl bg-white p-6 shadow-sm"
                >
                  <p className="text-sm text-slate-400">
                    Course #{course.id}
                  </p>

                  {editingId === course.id ? (
                    <>
                      <input
                        className={inputClass}
                        value={editTitle}
                        onChange={(event) =>
                          setEditTitle(event.target.value)
                        }
                        aria-label="Edit course title"
                      />

                      <div className="mt-4 flex gap-2">
                        <button
                          type="button"
                          onClick={() => saveEdit(course.id)}
                          disabled={busyId === course.id}
                          className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white disabled:opacity-60"
                        >
                          Save
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="rounded-lg bg-slate-100 px-3 py-2 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="mt-2 break-words text-lg font-bold">
                        {course.title}
                      </h3>

                      <div className="mt-4 flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(course)}
                          className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteCourse(course.id)}
                          disabled={busyId === course.id}
                          className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                        >
                          {busyId === course.id ? "Working..." : "Delete"}
                        </button>
                      </div>
                    </>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}