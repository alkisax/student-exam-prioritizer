// backend/src/course/course.service.ts

import { courseDAO } from "./course.dao";
import type {
  ICourse,
  ICriterion,
  IStudentCourseData,
} from "./course.types";

interface IncomingStudent {
  name: string;
  finalGrade: number | null;
  criteria: Record<string, ICriterion>;
}

interface SaveCourseSnapshotInput {
  teacherId: string;
  name: string;
  schoolYear: string;
  students: IncomingStudent[];
}

// Μετατρέπει τα criteria σε απλό object, είτε έρχονται ως Map είτε ως object.
const normalizeCriteria = (
  criteria: unknown,
): Record<string, ICriterion> => {
  if (criteria instanceof Map) {
    return Object.fromEntries(criteria);
  }

  if (criteria && typeof criteria === "object") {
    return criteria as Record<string, ICriterion>;
  }

  return {};
};

// Ελέγχει αν ένας μαθητής έχει τουλάχιστον έναν βαθμό κριτηρίου.
const hasAnyCriterionGrade = (
  criteria: Record<string, ICriterion>,
): boolean => {
  return Object.values(criteria).some(
    (criterion) =>
      criterion.grade !== null &&
      criterion.grade !== undefined,
  );
};

// Ελέγχει αν άλλαξε τουλάχιστον ένα κριτήριο του μαθητή.
const haveCriteriaChanged = (
  oldCriteria: Record<string, ICriterion>,
  newCriteria: Record<string, ICriterion>,
): boolean => {
  const allCriterionNames = new Set([
    ...Object.keys(oldCriteria),
    ...Object.keys(newCriteria),
  ]);

  return [...allCriterionNames].some((criterionName) => {
    const oldGrade = oldCriteria[criterionName]?.grade ?? null;
    const newGrade = newCriteria[criterionName]?.grade ?? null;

    return oldGrade !== newGrade;
  });
};

// Δημιουργεί ή ενημερώνει το snapshot ενός μαθήματος.
const saveSnapshot = async (
  input: SaveCourseSnapshotInput,
): Promise<ICourse> => {
  const existingCourse = await courseDAO.readByNameAndYear(
    input.teacherId,
    input.name,
    input.schoolYear,
  );

  // Αν είναι το πρώτο upload, δημιουργούμε το μάθημα.
  if (!existingCourse) {
    const students: IStudentCourseData[] = input.students.map(
      (student) => ({
        name: student.name,
        finalGrade: student.finalGrade,
        criteria: student.criteria,
        estimatedExamCount: hasAnyCriterionGrade(student.criteria)
          ? 1
          : 0,
      }),
    );

    return await courseDAO.create({
      teacherId: input.teacherId,
      name: input.name,
      schoolYear: input.schoolYear,
      students,
    });
  }

  // Δημιουργούμε Map ώστε να βρίσκουμε γρήγορα τον προηγούμενο μαθητή.
  const oldStudentsMap = new Map(
    existingCourse.students.map((student) => [
      student.name.trim().toLowerCase(),
      student,
    ]),
  );

  const updatedStudents: IStudentCourseData[] = input.students.map(
    (newStudent) => {
      const studentKey = newStudent.name.trim().toLowerCase();
      const oldStudent = oldStudentsMap.get(studentKey);

      // Νέος μαθητής που δεν υπήρχε στο προηγούμενο snapshot.
      if (!oldStudent) {
        return {
          name: newStudent.name,
          finalGrade: newStudent.finalGrade,
          criteria: newStudent.criteria,
          estimatedExamCount: hasAnyCriterionGrade(
            newStudent.criteria,
          )
            ? 1
            : 0,
        };
      }

      const oldCriteria = normalizeCriteria(oldStudent.criteria);
      const changed = haveCriteriaChanged(
        oldCriteria,
        newStudent.criteria,
      );

      return {
        name: newStudent.name,
        finalGrade: newStudent.finalGrade,
        criteria: newStudent.criteria,

        // Αν άλλαξε έστω ένα criterion, αυξάνεται μόνο κατά 1.
        estimatedExamCount:
          oldStudent.estimatedExamCount + (changed ? 1 : 0),
      };
    },
  );

  // Αντικαθιστούμε το προηγούμενο snapshot με το νέο.
  return await courseDAO.updateById(
    existingCourse._id.toString(),
    input.teacherId,
    {
      students: updatedStudents,
      lastUploadAt: new Date(),
    },
  );
};

export const courseService = {
  saveSnapshot,
};