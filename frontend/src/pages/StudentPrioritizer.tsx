// frontend/src/pages/StudentPrioritizer.tsx

import { useState } from "react";
import * as XLSX from "xlsx";

interface Criterion {
  name: string;
  grade: number | null;
}

interface Student {
  name: string;
  finalGrade: number | null;
  criteria: Criterion[];
}

interface PrioritizedStudent extends Student {
  estimatedExamCount: number;
  priorityScore: number;
  notes: string[];
}

const COURSE_NAME = "Excel Test Course";
const SCHOOL_YEAR = "2026-2027";
const API_URL = "http://localhost:3019/api/courses";

const parseNumber = (value: unknown): number | null => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return value;
  }

  const normalizedValue = String(value)
    .trim()
    .replace(",", ".");

  const numberValue = Number(normalizedValue);

  return Number.isNaN(numberValue) ? null : numberValue;
};

const formatValue = (value: unknown) => {
  if (value === undefined || value === null || value === "") {
    return "—";
  }

  if (typeof value === "number") {
    return new Intl.NumberFormat("es-ES", {
      maximumFractionDigits: 2,
    }).format(value);
  }

  return String(value);
};

const StudentPrioritizer = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [prioritizedStudents, setPrioritizedStudents] = useState<
    PrioritizedStudent[]
  >([]);

  const [courseId, setCourseId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPrioritizing, setIsPrioritizing] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setMessage("");
    setPrioritizedStudents([]);

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      raw: false,
      defval: null,
    });

    const headerRowIndex = rows.findIndex((row) =>
      row.some(
        (cell) => String(cell).trim() === "Alumno/a",
      ),
    );

    if (headerRowIndex === -1) {
      alert('Δεν βρέθηκε η στήλη "Alumno/a".');
      return;
    }

    const headers = rows[headerRowIndex];

    const nameColumnIndex = headers.findIndex(
      (header) => String(header).trim() === "Alumno/a",
    );

    let gradeColumnIndex = headers.findIndex(
      (header) => String(header).trim() === "Nota",
    );

    if (gradeColumnIndex === -1) {
      gradeColumnIndex = headers.findIndex(
        (header) => String(header).trim() === "Nota",
      );
    }

    const criterionColumns = headers
      .map((header, index) => ({
        name: String(header).trim(),
        index,
      }))
      .filter((column) =>
        /^\d+\.\d+$/.test(column.name),
      );

    const parsedStudents: Student[] = rows
      .slice(headerRowIndex + 1)
      .map((row) => ({
        name: String(row[nameColumnIndex] ?? "").trim(),

        finalGrade:
          gradeColumnIndex === -1
            ? null
            : parseNumber(row[gradeColumnIndex]),

        criteria: criterionColumns.map((column) => ({
          name: column.name,
          grade: parseNumber(row[column.index]),
        })),
      }))
      .filter((student) => student.name !== "");

    console.log("PARSED STUDENTS:", parsedStudents);

    setStudents(parsedStudents);
  };

  const saveSnapshot = async () => {
    if (students.length === 0) {
      setMessage("Δεν υπάρχουν μαθητές.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Δεν βρέθηκε token. Κάνε πρώτα login.");
      return;
    }

    try {
      setIsSaving(true);
      setMessage("");
      setPrioritizedStudents([]);

      const response = await fetch(`${API_URL}/snapshot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: COURSE_NAME,
          schoolYear: SCHOOL_YEAR,
          students,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ?? "Αποτυχία αποθήκευσης.",
        );
      }

      setCourseId(result.data._id);
      setMessage("Το snapshot αποθηκεύτηκε επιτυχώς.");
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Παρουσιάστηκε σφάλμα.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const prioritizeStudents = async () => {
    if (!courseId) {
      setMessage("Αποθήκευσε πρώτα το snapshot.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Δεν βρέθηκε token.");
      return;
    }

    try {
      setIsPrioritizing(true);
      setMessage("");

      const response = await fetch(
        `${API_URL}/${courseId}/prioritize`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ?? "Αποτυχία προτεραιοποίησης.",
        );
      }

      setPrioritizedStudents(result.data);
      setMessage("Η λίστα προτεραιότητας δημιουργήθηκε.");
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Παρουσιάστηκε σφάλμα.",
      );
    } finally {
      setIsPrioritizing(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-64px)] flex-col items-center px-6 py-10 text-white">
      <h1 className="mb-2 text-3xl font-bold">
        Student Prioritizer
      </h1>

      <p className="mb-6 text-zinc-400">
        {COURSE_NAME} — {SCHOOL_YEAR}
      </p>

      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        className="block w-full max-w-md cursor-pointer rounded-lg border border-zinc-600 bg-zinc-900 text-sm text-white file:mr-4 file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white hover:file:bg-blue-700"
      />

      {students.length > 0 && (
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={saveSnapshot}
            disabled={isSaving}
            className="rounded-lg bg-green-600 px-5 py-2 font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            {isSaving
              ? "Saving..."
              : "Save snapshot"}
          </button>

          <button
            type="button"
            onClick={prioritizeStudents}
            disabled={!courseId || isPrioritizing}
            className="rounded-lg bg-blue-600 px-5 py-2 font-semibold hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPrioritizing
              ? "Prioritizing..."
              : "Prioritize students"}
          </button>
        </div>
      )}

      {message && (
        <p className="mt-4 text-center">{message}</p>
      )}

      {prioritizedStudents.length > 0 && (
        <section className="mt-10 w-full max-w-4xl">
          <h2 className="mb-4 text-2xl font-bold">
            Prioritized students
          </h2>

          <ol className="space-y-4">
            {prioritizedStudents.map((student, index) => (
              <li
                key={`${student.name}-${index}`}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-5 py-4"
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl font-bold text-blue-400">
                    {index + 1}
                  </span>

                  <div className="flex-1">
                    <h3 className="text-xl font-bold">
                      {student.name}
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-4 text-sm">
                      <span>
                        Final grade:{" "}
                        {formatValue(student.finalGrade)}
                      </span>

                      <span>
                        Estimated exams:{" "}
                        {student.estimatedExamCount}
                      </span>

                      <span>
                        Priority score:{" "}
                        {student.priorityScore}
                      </span>
                    </div>

                    {student.notes.length > 0 && (
                      <ul className="mt-3 list-inside list-disc text-yellow-300">
                        {student.notes.map((note, noteIndex) => (
                          <li key={noteIndex}>{note}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {students.length > 0 &&
        prioritizedStudents.length === 0 && (
          <section className="mt-8 w-full max-w-3xl">
            <h2 className="mb-4 text-xl font-semibold">
              Students ({students.length})
            </h2>

            <ul className="space-y-4">
              {students.map((student, studentIndex) => (
                <li
                  key={`${student.name}-${studentIndex}`}
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-5 py-4"
                >
                  <h3 className="text-xl font-bold">
                    {student.name}
                  </h3>

                  <p className="mt-1 font-semibold text-blue-300">
                    Grade:{" "}
                    {formatValue(student.finalGrade)}
                  </p>

                  <p className="mt-4">
                    {student.criteria
                      .map(
                        (criterion) =>
                          `${criterion.name}: ${formatValue(
                            criterion.grade,
                          )}`,
                      )
                      .join(" - ")}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}
    </main>
  );
};

export default StudentPrioritizer;