// frontend/src/pages/StudentPrioritizer.tsx

import { useState } from "react";
import * as XLSX from "xlsx";

interface Criterion {
  name: string;
  grade: unknown;
}

interface Student {
  name: unknown;
  grade: unknown;
  criteriaGroups: Record<string, Criterion[]>;
}

const formatValue = (value: unknown) => {
  if (value === undefined || value === null || value === "") return "—";

  if (typeof value === "number") {
    return new Intl.NumberFormat("es-ES", {
      maximumFractionDigits: 2,
    }).format(value);
  }

  return String(value);
};

const StudentPrioritizer = () => {
  // Εδώ αποθηκεύουμε τους μαθητές που διαβάσαμε από το Excel.
  const [students, setStudents] = useState<Student[]>([]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    // Παίρνουμε το πρώτο αρχείο που επέλεξε ο χρήστης.
    const file = event.target.files?.[0];

    if (!file) return;

    // Φορτώνουμε το αρχείο στη μνήμη και το μετατρέπουμε σε workbook.
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);

    // Παίρνουμε το πρώτο φύλλο του Excel.
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Μετατρέπουμε κάθε γραμμή του φύλλου σε array.
    // raw: false κρατά τις εμφανιζόμενες τιμές των κελιών.
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      raw: false,
      defval: null,
    });

    // Βρίσκουμε τη γραμμή που περιέχει τις επικεφαλίδες.
    const headerRowIndex = rows.findIndex((row) =>
      row.some((cell) => String(cell).trim() === "Alumno/a"),
    );

    if (headerRowIndex === -1) {
      alert('Δεν βρέθηκε η στήλη "Alumno/a".');
      return;
    }

    const headers = rows[headerRowIndex];

    // Βρίσκουμε δυναμικά τις στήλες ονόματος και βαθμού.
    const nameColumnIndex = headers.findIndex(
      (header) => String(header).trim() === "Alumno/a",
    );

    const gradeColumnIndex = headers.findIndex(
      (header) => String(header).trim() === "Nota",
    );

    // Κρατάμε μόνο headers της μορφής 1.1, 2.3, 5.2 κλπ.
    const criterionColumns = headers
      .map((header, index) => ({
        name: String(header).trim(),
        index,
      }))
      .filter((column) => /^\d+\.\d+$/.test(column.name));

    // Διαβάζουμε μόνο τις γραμμές κάτω από τα headers.
    const parsedStudents = rows
      .slice(headerRowIndex + 1)
      .map((row) => {
        const criteriaGroups: Record<string, Criterion[]> = {};

        criterionColumns.forEach((column) => {
          // Το πρώτο ψηφίο καθορίζει την ομάδα: 1, 2, 3 κλπ.
          const group = column.name.split(".")[0];

          if (!criteriaGroups[group]) {
            criteriaGroups[group] = [];
          }

          criteriaGroups[group].push({
            name: column.name,
            grade: row[column.index],
          });
        });

        return {
          name: row[nameColumnIndex],
          grade: row[gradeColumnIndex],
          criteriaGroups,
        };
      })
      .filter(
        (student) =>
          student.name !== undefined &&
          student.name !== null &&
          student.name !== "",
      );

    // Μικρό debug μόνο για τον πρώτο μαθητή.
    console.log("FIRST STUDENT:", parsedStudents[0]);

    // Η αλλαγή του state προκαλεί νέο render της λίστας.
    setStudents(parsedStudents);
  };

  return (
    <main className="flex min-h-[calc(100vh-64px)] flex-col items-center px-6 py-10 text-white">
      <h1 className="mb-6 text-3xl font-bold">Student Prioritizer</h1>

      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        className="block w-full max-w-md cursor-pointer rounded-lg border border-zinc-600 bg-zinc-900 text-sm text-white file:mr-4 file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white hover:file:bg-blue-700"
      />

      {students.length > 0 && (
        <section className="mt-8 w-full max-w-3xl">
          <h2 className="mb-4 text-xl font-semibold">Students</h2>

          <ul className="space-y-4">
            {students.map((student, studentIndex) => (
              <li
                key={studentIndex}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-5 py-4"
              >
                <h3 className="text-xl font-bold">
                  {formatValue(student.name)}
                </h3>

                <p className="mt-1 font-semibold text-blue-300">
                  Grade: {formatValue(student.grade)}
                </p>

                <div className="mt-4 space-y-2">
                  {Object.entries(student.criteriaGroups)
                    .sort(
                      ([groupA], [groupB]) =>
                        Number(groupA) - Number(groupB),
                    )
                    .map(([group, criteria]) => (
                      <div key={group} className="flex gap-3">
                        <span className="font-bold text-zinc-400">
                          {group}.
                        </span>

                        <p>
                          {criteria
                            .sort((a, b) =>
                              a.name.localeCompare(b.name, undefined, {
                                numeric: true,
                              }),
                            )
                            .map(
                              (criterion) =>
                                `${criterion.name}: ${formatValue(
                                  criterion.grade,
                                )}`,
                            )
                            .join(" - ")}
                        </p>
                      </div>
                    ))}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
};

export default StudentPrioritizer;