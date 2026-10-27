
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

export default function ImportPreviewPage() {
  const router = useRouter();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const savedFile = sessionStorage.getItem("importFile");

    if (!savedFile) {
      router.replace("/");
      return;
    }

    const workbook = XLSX.read(savedFile, { type: "base64" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    setRows(XLSX.utils.sheet_to_json(sheet, { defval: "" }));
  }, [router]);

  function handleOK() {
    sessionStorage.setItem("importConfirmed", "true");
    router.push("/");
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Review Import File</h1>

      <p className="mb-4">
        Review your student records before importing them.
      </p>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100">
            <tr>
              {Object.keys(rows[0] || {}).map((heading) => (
                <th key={heading} className="p-3">{heading}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-t">
                {Object.keys(rows[0] || {}).map((heading) => (
                  <td key={heading} className="p-3">
                    {String(row[heading] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="my-4">Total records: {rows.length}</p>

      <button
        onClick={handleOK}
        disabled={rows.length === 0}
        className="rounded-lg bg-blue-600 px-6 py-2 text-white disabled:opacity-50"
      >
        OK — Looks Good
      </button>
    </main>
  );
}
