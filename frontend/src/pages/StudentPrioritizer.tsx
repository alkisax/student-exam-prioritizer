// frontend/src/pages/StudentPrioritizer.tsx

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { backendUrl } from "../constants/constants";

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

interface Course {
  _id: string;
  name: string;
  schoolYear: string;
}

const API_URL = `${backendUrl}/api/courses`;

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
  const [courses, setCourses] = useState<Course[]>([]);

  const [selectedYear, setSelectedYear] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const [newYear, setNewYear] = useState("");
  const [newCourseName, setNewCourseName] = useState("");

  const [students, setStudents] = useState<Student[]>([]);

  const [prioritizedStudents, setPrioritizedStudents] = useState<
    PrioritizedStudent[]
  >([]);

  const [isSaving, setIsSaving] = useState(false);
  const [isPrioritizing, setIsPrioritizing] = useState(false);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);

  const [message, setMessage] = useState("");

  // --------------------------------------------------
  // LOAD COURSES
  // --------------------------------------------------

  const loadCourses = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Δεν βρέθηκε token.");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ?? "Αποτυχία φόρτωσης μαθημάτων.",
        );
      }

      setCourses(result.data);

      if (
        result.data.length > 0 &&
        selectedCourseId === ""
      ) {
        const firstYear = result.data[0].schoolYear;

        setSelectedYear(firstYear);

        const firstCourse = result.data.find(
          (course: Course) =>
            course.schoolYear === firstYear,
        );

        if (firstCourse) {
          setSelectedCourseId(firstCourse._id);
        }
      }
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Παρουσιάστηκε σφάλμα.",
      );
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      await loadCourses();
    };

    void fetchCourses();
  }, []);

  // --------------------------------------------------
  // YEARS + COURSES
  // --------------------------------------------------

  const schoolYears = [
    ...new Set(courses.map((course) => course.schoolYear)),
  ];

  const coursesForSelectedYear = courses.filter(
    (course) => course.schoolYear === selectedYear,
  );

  const selectedCourse = courses.find(
    (course) => course._id === selectedCourseId,
  );

  // --------------------------------------------------
  // CREATE COURSE
  // --------------------------------------------------

  const createCourse = async () => {
    const year = newYear.trim();
    const courseName = newCourseName.trim();

    if (!year || !courseName) {
      setMessage("Συμπλήρωσε χρονιά και όνομα μαθήματος.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Δεν βρέθηκε token.");
      return;
    }

    try {
      setIsCreatingCourse(true);
      setMessage("");

      const response = await fetch(`${API_URL}/snapshot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: courseName,
          schoolYear: year,
          students: [],
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ?? "Αποτυχία δημιουργίας μαθήματος.",
        );
      }

      const newCourse: Course = {
        _id: result.data._id,
        name: result.data.name,
        schoolYear: result.data.schoolYear,
      };

      setCourses((currentCourses) => {
        const alreadyExists = currentCourses.some(
          (course) => course._id === newCourse._id,
        );

        if (alreadyExists) {
          return currentCourses;
        }

        return [...currentCourses, newCourse];
      });

      setSelectedYear(newCourse.schoolYear);
      setSelectedCourseId(newCourse._id);

      setNewYear("");
      setNewCourseName("");

      setStudents([]);
      setPrioritizedStudents([]);

      setMessage("Το μάθημα δημιουργήθηκε.");
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Παρουσιάστηκε σφάλμα.",
      );
    } finally {
      setIsCreatingCourse(false);
    }
  };

  // --------------------------------------------------
  // YEAR CHANGE
  // --------------------------------------------------

  const handleYearChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const year = event.target.value;

    setSelectedYear(year);

    const firstCourse = courses.find(
      (course) => course.schoolYear === year,
    );

    setSelectedCourseId(firstCourse?._id ?? "");

    setStudents([]);
    setPrioritizedStudents([]);
    setMessage("");
  };

  // --------------------------------------------------
  // COURSE CHANGE
  // --------------------------------------------------

  const handleCourseChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSelectedCourseId(event.target.value);

    setStudents([]);
    setPrioritizedStudents([]);
    setMessage("");
  };

  // --------------------------------------------------
  // EXCEL
  // --------------------------------------------------

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
      (header) =>
        String(header).trim() === "Alumno/a",
    );

    // Σωστός τελικός βαθμός: Nota
    const gradeColumnIndex = headers.findIndex(
      (header) =>
        String(header).trim() === "Nota",
    );

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
        name: String(
          row[nameColumnIndex] ?? "",
        ).trim(),

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

    setStudents(parsedStudents);
  };

  // --------------------------------------------------
  // SAVE SNAPSHOT
  // --------------------------------------------------

  const saveSnapshot = async () => {
    if (!selectedCourse) {
      setMessage("Επίλεξε μάθημα.");
      return;
    }

    if (students.length === 0) {
      setMessage("Δεν υπάρχουν μαθητές.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Δεν βρέθηκε token.");
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
          name: selectedCourse.name,
          schoolYear: selectedCourse.schoolYear,
          students,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ?? "Αποτυχία αποθήκευσης.",
        );
      }

      setSelectedCourseId(result.data._id);

      setMessage(
        "Το snapshot αποθηκεύτηκε επιτυχώς.",
      );
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

  // --------------------------------------------------
  // PRIORITIZE
  // --------------------------------------------------

  const prioritizeStudents = async () => {
    if (!selectedCourseId) {
      setMessage("Επίλεξε μάθημα.");
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
        `${API_URL}/${selectedCourseId}/prioritize`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ??
          "Αποτυχία προτεραιοποίησης.",
        );
      }

      setPrioritizedStudents(result.data);

      setMessage(
        "Η λίστα προτεραιότητας δημιουργήθηκε.",
      );
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
      <h1 className="mb-8 text-3xl font-bold">
        Student Prioritizer
      </h1>

      {/* EXISTING YEAR + COURSE */}

      <div className="w-full max-w-2xl rounded-lg border border-zinc-700 bg-zinc-900 p-5">
        <h2 className="mb-4 text-xl font-semibold">
          Select course
        </h2>

        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-2">
            <label className="font-semibold">
              School year
            </label>

            <select
              value={selectedYear}
              onChange={handleYearChange}
              className="rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2"
            >
              <option value="">
                Select year
              </option>

              {schoolYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <label className="font-semibold">
              Course
            </label>

            <select
              value={selectedCourseId}
              onChange={handleCourseChange}
              className="rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2"
            >
              <option value="">
                Select course
              </option>

              {coursesForSelectedYear.map(
                (course) => (
                  <option
                    key={course._id}
                    value={course._id}
                  >
                    {course.name}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>
      </div>

      {/* CREATE NEW COURSE */}

      <div className="mt-5 w-full max-w-2xl rounded-lg border border-zinc-700 bg-zinc-900 p-5">
        <h2 className="mb-4 text-xl font-semibold">
          Create new course
        </h2>

        <div className="flex gap-4">
          <input
            type="text"
            value={newYear}
            onChange={(event) =>
              setNewYear(event.target.value)
            }
            placeholder="2026-2027"
            className="flex-1 rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2"
          />

          <input
            type="text"
            value={newCourseName}
            onChange={(event) =>
              setNewCourseName(event.target.value)
            }
            placeholder="Course name"
            className="flex-1 rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2"
          />

          <button
            type="button"
            onClick={createCourse}
            disabled={isCreatingCourse}
            className="rounded-lg bg-purple-600 px-5 py-2 font-semibold hover:bg-purple-700 disabled:opacity-50"
          >
            {isCreatingCourse
              ? "Creating..."
              : "Create"}
          </button>
        </div>
      </div>

      {/* SELECTED COURSE */}

      {selectedCourse && (
        <p className="mt-5 text-zinc-400">
          {selectedCourse.name} —{" "}
          {selectedCourse.schoolYear}
        </p>
      )}

      {/* EXCEL */}

      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        disabled={!selectedCourseId}
        className="mt-6 block w-full max-w-md cursor-pointer rounded-lg border border-zinc-600 bg-zinc-900 text-sm text-white file:mr-4 file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white hover:file:bg-blue-700 disabled:opacity-50"
      />

      {/* BUTTONS */}

      <div className="mt-6 flex gap-3">
        {students.length > 0 && (
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
        )}

        <button
          type="button"
          onClick={prioritizeStudents}
          disabled={
            !selectedCourseId ||
            isPrioritizing
          }
          className="rounded-lg bg-blue-600 px-5 py-2 font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {isPrioritizing
            ? "Prioritizing..."
            : "Prioritize students"}
        </button>
      </div>

      {message && (
        <p className="mt-4 text-center">
          {message}
        </p>
      )}

      {/* PRIORITIZED RESULTS */}

      {prioritizedStudents.length > 0 && (
        <section className="mt-10 w-full max-w-4xl">
          <h2 className="mb-4 text-2xl font-bold">
            Prioritized students
          </h2>

          <ol className="space-y-4">
            {prioritizedStudents.map(
              (student, index) => (
                <li
                  key={`${student.name}-${index}`}
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-5 py-4"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-2xl font-bold text-blue-400">
                      {index + 1}
                    </span>

                    <div>
                      <h3 className="text-xl font-bold">
                        {student.name}
                      </h3>

                      <p className="mt-2">
                        Grade:{" "}
                        {formatValue(
                          student.finalGrade,
                        )}
                      </p>

                      <p>
                        Estimated exams:{" "}
                        {
                          student.estimatedExamCount
                        }
                      </p>

                      <p>
                        Priority score:{" "}
                        {student.priorityScore}
                      </p>

                      {student.notes.length >
                        0 && (
                          <ul className="mt-3 list-inside list-disc text-yellow-300">
                            {student.notes.map(
                              (note, noteIndex) => (
                                <li key={noteIndex}>
                                  {note}
                                </li>
                              ),
                            )}
                          </ul>
                        )}
                    </div>
                  </div>
                </li>
              ),
            )}
          </ol>
        </section>
      )}

      {/* EXCEL PREVIEW */}

      {students.length > 0 &&
        prioritizedStudents.length === 0 && (
          <section className="mt-8 w-full max-w-3xl">
            <h2 className="mb-4 text-xl font-semibold">
              Students ({students.length})
            </h2>

            <ul className="space-y-4">
              {students.map(
                (student, studentIndex) => (
                  <li
                    key={`${student.name}-${studentIndex}`}
                    className="rounded-lg border border-zinc-700 bg-zinc-900 px-5 py-4"
                  >
                    <h3 className="text-xl font-bold">
                      {student.name}
                    </h3>

                    <p className="mt-1 font-semibold text-blue-300">
                      Grade:{" "}
                      {formatValue(
                        student.finalGrade,
                      )}
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
                ),
              )}
            </ul>
          </section>
        )}
    </main>
  );
};

export default StudentPrioritizer;