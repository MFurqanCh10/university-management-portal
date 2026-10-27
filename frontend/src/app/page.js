"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

const API_URL = "http://localhost:5000/api";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  departmentId: "",
  courseId: [],
};


async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export default function HomePage() {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 0,
  });
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [previewRows, setPreviewRows] = useState([]);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const importInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 5;
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);


  const router = useRouter();


  const loadData = useCallback(
    async (page, search, department, sort) => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(studentsPerPage),
          search: search.trim(),
          departmentId: department,
          sortBy: sort,
        });

        const [studentResult, departmentData, courseData] =
          await Promise.all([
            apiRequest(`/students?${params.toString()}`),
            apiRequest("/departments"),
            apiRequest("/courses"),
          ]);

        setStudents(studentResult.data);
        setPagination(studentResult.pagination);
        setDepartments(departmentData);
        setCourses(courseData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [studentsPerPage]
  );



  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);


  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, departmentFilter, sortBy]);

  useEffect(() => {
    loadData(currentPage, debouncedSearch, departmentFilter, sortBy);
  }, [currentPage, debouncedSearch, departmentFilter, sortBy, loadData]);

  async function handleFileChange(file) {
    setImportFile(file);
    setError("");
    sessionStorage.removeItem("importConfirmed");

    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const base64 = btoa(
        Array.from(new Uint8Array(buffer), (byte) =>
          String.fromCharCode(byte)
        ).join("")
      );

      sessionStorage.setItem("importFile", base64);
      router.push("/import-preview");
    } catch {
      setError("Could not read the selected file.");
    }
  }
  async function handleImport() {
    if (!importFile) {
      setError("Please choose a CSV or Excel file first.");
      return;
    }

    setImporting(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", importFile);

      const response = await fetch(`${API_URL}/students/import`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const rowErrors = Array.isArray(data?.errors)
          ? data.errors.join("\n")
          : "";

        throw new Error(
          [data?.message || "Import failed.", rowErrors]
            .filter(Boolean)
            .join("\n")
        );
      }

      await loadData(
        currentPage,
        debouncedSearch,
        departmentFilter,
        sortBy
      );

      setMessage(`${data.created} student(s) imported successfully.`);
      setImportFile(null);

      if (importInputRef.current) {
        importInputRef.current.value = "";
      }
    } catch (err) {
      setError(err.message || "Could not import the file.");
    } finally {
      setImporting(false);
    }
  }

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function startEdit(student) {
    setEditingId(student.id);

    setForm({
      name: student.name || "",
      email: student.email || "",
      phone: student.StudentProfile?.phone || "",
      address: student.StudentProfile?.address || "",
      departmentId:
        student.departmentId != null
          ? String(student.departmentId)
          : student.Department?.id != null
            ? String(student.Department.id)
            : "",
      courseIds: (student.Courses || []).map((course) =>
        String(course.id)
      ),
    });

    setError("");
    setMessage("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm({ ...emptyForm, courseIds: [] });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      let studentId = editingId;

      // Step A: Create a student or update their basic information.
      if (editingId) {
        await apiRequest(`/students/${editingId}`, {
          method: "PUT",
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
          }),
        });
      } else {
        const createdStudent = await apiRequest("/students", {
          method: "POST",
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
          }),
        });

        studentId = createdStudent.id ?? createdStudent.student?.id;

        if (studentId == null) {
          throw new Error(
            "Student was created, but the API response did not contain its ID."
          );
        }

        setEditingId(studentId);
      }

      await apiRequest(`/students/${studentId}/profile`, {
        method: "PUT",
        body: JSON.stringify({
          phone: form.phone,
          address: form.address,
        }),
      });

      await apiRequest(`/students/${studentId}/department`, {
        method: "PUT",
        body: JSON.stringify({
          departmentId: form.departmentId
            ? Number(form.departmentId)
            : null,
        }),
      });

      // Step D: Replace the student's course enrollments.
      await apiRequest(`/students/${studentId}/courses`, {
        method: "PUT",
        body: JSON.stringify({
          courseIds: form.courseIds.map(Number),
        }),
      });

      await loadData(
        currentPage,
        debouncedSearch,
        departmentFilter,
        sortBy
      );
      resetForm();

      setMessage(
        editingId
          ? "Student updated successfully."
          : "Student added successfully."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteStudent(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await apiRequest(`/students/${id}`, {
        method: "DELETE",
      });

      if (editingId === id) {
        resetForm();
      }

      await loadData(
        currentPage,
        debouncedSearch,
        departmentFilter,
        sortBy
      );
      setMessage("Student deleted successfully.");
    } catch (err) {
      setError(err.message);
    }
  }

  const filteredStudents = students;

  const totalPages = pagination.totalPages;
  const paginatedStudents = filteredStudents;

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500";

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 rounded-3xl bg-slate-900 px-6 py-8 text-white shadow-lg sm:px-10">
          <p className="mb-2 text-sm font-medium text-blue-300">
            UNIVERSITY MANAGEMENT SYSTEM
          </p>

          <h1 className="text-3xl font-bold sm:text-4xl">
            Student Management
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Add students, manage their information, assign departments,
            and update course enrollments.
          </p>
        </header>

        {error && (
          <div className="mb-5 whitespace-pre-line rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {message}
          </div>
        )}

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Import Students
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Upload a CSV or Excel file to add multiple student records at once.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              ref={importInputRef}
              type="file"
              accept=".csv,.xlsx"
              onChange={(event) =>
                handleFileChange(event.target.files?.[0] ?? null)
              }
              className="w-full min-w-0 rounded-xl border border-slate-200 bg-white p-2 text-sm sm:max-w-xl"
            />

            <button
              type="button"
              onClick={handleImport}
              disabled={!importFile || importing}
              className="shrink-0 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {importing ? "Importing..." : "Upload Students"}
            </button>

            {previewRows.length > 0 && (
              <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
                <h3 className="border-b border-slate-200 p-3 font-semibold">
                  Review Students ({previewRows.length})
                </h3>

                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {["name", "email", "phone", "address", "department", "courses"].map(
                        (heading) => (
                          <th key={heading} className="px-4 py-3 capitalize">
                            {heading}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {previewRows.slice(0, 10).map((student, index) => (
                      <tr key={index} className="border-t border-slate-100">
                        {["name", "email", "phone", "address", "department", "courses"].map(
                          (field) => (
                            <td key={field} className="px-4 py-3">
                              {String(student[field] ?? "")}
                            </td>
                          )
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {previewRows.length > 10 && (
                  <p className="p-3 text-sm text-slate-500">
                    Showing 10 of {previewRows.length} students.
                  </p>
                )}
              </div>
            )}

          </div>


          {importFile && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="min-w-0 break-all text-sm text-slate-600">
                <span className="font-medium text-slate-800">
                  Selected file:
                </span>{" "}
                {importFile.name}
              </p>

              <button
                type="button"
                disabled={importing}
                onClick={() => {
                  setImportFile(null);
                  setPreviewRows([]);

                  if (importInputRef.current) {
                    importInputRef.current.value = "";
                  }

                  setError("");
                }}
                className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Remove File
              </button>
            </div>
          )}


          <p className="mt-3 text-xs leading-5 text-slate-500">
            Maximum 5 MB and 1,000 students per file. Department and course
            names must match existing records. Use semicolons to separate
            multiple courses.
          </p>
        </section>

        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {editingId ? "Edit Student" : "Add New Student"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Complete the student's information below.
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Full Name *
                <input
                  className={`${inputClass} mt-2`}
                  type="text"
                  placeholder="Enter student name"
                  value={form.name}
                  onChange={(event) =>
                    updateField("name", event.target.value)
                  }
                  required
                />
              </label>

              <label className="text-sm font-medium text-slate-700">
                Email Address *
                <input
                  className={`${inputClass} mt-2`}
                  type="email"
                  placeholder="student@example.com"
                  value={form.email}
                  onChange={(event) =>
                    updateField("email", event.target.value)
                  }
                  required
                />
              </label>

              <label className="text-sm font-medium text-slate-700">
                Phone Number
                <input
                  className={`${inputClass} mt-2`}
                  type="tel"
                  placeholder="Enter phone number"
                  value={form.phone}
                  onChange={(event) =>
                    updateField("phone", event.target.value)
                  }
                />
              </label>

              <label className="text-sm font-medium text-slate-700">
                Address
                <input
                  className={`${inputClass} mt-2`}
                  type="text"
                  placeholder="Enter address"
                  value={form.address}
                  onChange={(event) =>
                    updateField("address", event.target.value)
                  }
                />
              </label>

              <label className="text-sm font-medium text-slate-700">
                Department
                <select
                  className={`${inputClass} mt-2`}
                  value={form.departmentId}
                  onChange={(event) =>
                    updateField("departmentId", event.target.value)
                  }
                >
                  <option value="">No department selected</option>

                  {departments.map((department) => (
                    <option
                      key={department.id}
                      value={String(department.id)}
                    >
                      {department.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium text-slate-700">
                Courses
                <select
                  multiple
                  className={`${inputClass} mt-2 min-h-32`}
                  value={form.courseIds}
                  onChange={(event) => {
                    const selectedIds = Array.from(
                      event.target.selectedOptions,
                      (option) => option.value
                    );

                    updateField("courseIds", selectedIds);
                  }}
                >
                  {courses.map((course) => (
                    <option
                      key={course.id}
                      value={String(course.id)}
                    >
                      {course.title}
                    </option>
                  ))}
                </select>

                <span className="mt-2 block text-xs text-slate-500">
                  Hold Ctrl (or Cmd on Mac) to select multiple courses.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Save Changes"
                  : "Add Student"}
            </button>
          </form>
        </section>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                All Students
              </h2>


              <p className="mt-1 text-sm text-slate-500">
                Student records from the database
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              {pagination.total} students
            </span>
          </div>
          <div className="grid gap-4 border-b border-slate-100 p-6 md:grid-cols-2">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="search students, email, phone,department, courses..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"

            />

            <select
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"

            >
              <option value="all">All Departments</option>
              {departments.map((department) => (
                <option key={department.id} value={String(department.id)}>
                  {department.name}
                </option>

              ))}

            </select>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500"
              aria-label="Sort students"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name">Name (A–Z)</option>
            </select>

            <p className="text-sm text-slate-500 md:col-span-2">
              Showing {students.length} matching students            </p>
          </div>

          {loading ? (
            <p className="p-8 text-center text-slate-500">
              Loading student records...
            </p>
          ) : filteredStudents.length === 0 ? (
            <p className="p-8 text-center text-slate-500">
              {pagination.total === 0
                ? "No students match your search or department filter."
                : "No students found on this page."}
            </p>
          ) : (


            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-4">Name / Email</th>
                    <th className="px-5 py-4">Phone / Address</th>
                    <th className="px-5 py-4">Department</th>
                    <th className="px-5 py-4">Courses</th>
                    <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {paginatedStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">
                          <Link
                            href={`/students/${student.id}`}
                            className="font-semibold text-slate-900 hover:text-blue-600"
                          >
                            {student.name}
                          </Link>
                        </p>
                        <p className="mt-1 text-slate-500">
                          {student.email}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-slate-700">
                          {student.StudentProfile?.phone || "-"}
                        </p>
                        <p className="mt-1 text-slate-500">
                          {student.StudentProfile?.address || "-"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {student.Department?.name || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {student.Courses?.length
                          ? student.Courses
                            .map((course) => course.title)
                            .join(", ")
                          : "-"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(student)}
                            className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteStudent(student.id)}
                            className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 px-5 py-4">
                <p className="text-sm text-slate-500">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((previous) => previous - 1)
                    }
                    disabled={currentPage <= 1}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((previous) => previous + 1)
                    }
                    disabled={
                      currentPage >= totalPages || totalPages === 0
                    }
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}