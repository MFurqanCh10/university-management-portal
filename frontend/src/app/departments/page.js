"use client";

import { useCallback, useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadDepartments = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/departments`, {
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load departments");
      }

      setDepartments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  async function createDepartment(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/departments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create department");
      }

      setName("");
      await loadDepartments();
      setMessage("Department created successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(department) {
    setEditingId(department.id);
    setEditName(department.name);
    setError("");
    setMessage("");
  }

  async function saveEdit(id) {
    if (!editName.trim()) {
      setError("Department name is required.");
      return;
    }

    setBusyId(id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/departments/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update department");
      }

        setEditingId(null);

        await loadDepartments();

        setMessage("Department updated successfully.");

    } catch (err) {

        setError(err.message);

    } finally {
        setBusyId(null);

    }
  }

    async function deleteDepartment(id) {

    if (!window.confirm("Are you sure you want to delete this department")) {
      return;
    }

        setBusyId(id);

        setError("");

        setMessage("");

    try {
      const response = await fetch(`${API_URL}/departments/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete department");
      }

      if (editingId === id) {
        setEditingId(null);
      }

      await loadDepartments();
      setMessage("Department deleted successfully.");
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
          Departments
        </h1>
        <p className="mt-2 text-slate-500">
          Create, edit, and manage university departments.
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
          onSubmit={createDepartment}
          className="mt-6 rounded-2xl bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-bold">Add New Department</h2>

          <label className="mt-4 block text-sm font-medium text-slate-700">
            Department Name
            <input
              className={inputClass}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Software Engineering"
              required
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="mt-4 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Add Department"}
          </button>
        </form>

        <section className="mt-8">
          <h2 className="mb-4 text-xl font-bold">
            All Departments ({departments.length})
          </h2>

          {loading ? (
            <p>Loading departments...</p>
          ) : departments.length === 0 ? (
            <p className="rounded-xl bg-white p-6 text-slate-500">
              No departments found.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {departments.map((department) => (
                <article
                  key={department.id}
                  className="rounded-2xl bg-white p-6 shadow-sm"
                >
                  <p className="text-sm text-slate-400">
                    Department #{department.id}
                  </p>

                  {editingId === department.id ? (
                    <>
                      <input
                        className={inputClass}
                        value={editName}
                        onChange={(event) =>
                          setEditName(event.target.value)
                        }
                        aria-label="Edit department name"
                      />

                      <div className="mt-4 flex gap-2">
                        <button
                          type="button"
                          onClick={() => saveEdit(department.id)}
                          disabled={busyId === department.id}
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
                        {department.name}
                      </h3>

                      <div className="mt-4 flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(department)}
                          className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteDepartment(department.id)}
                          disabled={busyId === department.id}
                          className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                        >
                          {busyId === department.id ? "Working..." : "Delete"}
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
