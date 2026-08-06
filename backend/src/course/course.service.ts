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
  criteria: ICriterion[];
}

interface SaveCourseSnapshotInput {
  teacherId: string;
  name: string;
  schoolYear: string;
  students: IncomingStudent[];
}

// Ελέγχει αν υπάρχει τουλάχιστον ένας βαθμός κριτηρίου.
const hasAnyCriterionGrade = (criteria: ICriterion[]): boolean => {
  return criteria.some(
    (criterion) =>
      criterion.grade !== null &&
      criterion.grade !== undefined,
  );
};

// Ελέγχει αν άλλαξε έστω ένα κριτήριο.
const haveCriteriaChanged = (
  oldCriteria: ICriterion[],
  newCriteria: ICriterion[],
): boolean => {
  const oldCriteriaMap = new Map(
    oldCriteria.map((criterion) => [
      criterion.name,
      criterion.grade ?? null,
    ]),
  );

  const newCriteriaMap = new Map(
    newCriteria.map((criterion) => [
      criterion.name,
      criterion.grade ?? null,
    ]),
  );

  const allCriterionNames = new Set([
    ...oldCriteriaMap.keys(),
    ...newCriteriaMap.keys(),
  ]);

  return [...allCriterionNames].some((criterionName) => {
    const oldGrade = oldCriteriaMap.get(criterionName) ?? null;
    const newGrade = newCriteriaMap.get(criterionName) ?? null;

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

  // Πρώτο upload: δημιουργούμε το μάθημα.
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

    return courseDAO.create({
      teacherId: input.teacherId,
      name: input.name,
      schoolYear: input.schoolYear,
      students,
    });
  }

  // Βρίσκουμε γρήγορα τον παλιό μαθητή με βάση το όνομα.
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

      // Νέος μαθητής.
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

      const changed = haveCriteriaChanged(
        oldStudent.criteria,
        newStudent.criteria,
      );

      return {
        name: newStudent.name,
        finalGrade: newStudent.finalGrade,
        criteria: newStudent.criteria,

        // Πολλά αλλαγμένα criteria στο ίδιο upload σημαίνουν μία εξέταση.
        estimatedExamCount:
          oldStudent.estimatedExamCount + (changed ? 1 : 0),
      };
    },
  );

  // Αντικαθιστούμε την παλιά εικόνα με τη νέα.
  return courseDAO.updateById(
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