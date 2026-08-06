// backend/src/course/course.prioritize.service.ts

import type {
  ICourse,
  IStudentCourseData,
} from "./course.types";

interface PrioritizedStudent extends IStudentCourseData {
  priorityScore: number;
  notes: string[];
}

const prioritizeStudent = (
  student: IStudentCourseData,
): PrioritizedStudent => {
  let priorityScore = 0;
  const notes: string[] = [];

  const examinedCriteria = student.criteria.filter(
    (criterion) =>
      criterion.grade !== null &&
      criterion.grade !== undefined,
  );

  const missingCriteria = student.criteria.filter(
    (criterion) =>
      criterion.grade === null ||
      criterion.grade === undefined,
  );

  // Δεν έχει εξεταστεί καθόλου.
  if (
    student.estimatedExamCount === 0 ||
    examinedCriteria.length === 0
  ) {
    priorityScore += 1000;
    notes.push("has not been examined");
  } else {
    // Προτεραιότητα για κάθε κριτήριο που λείπει.
    missingCriteria.forEach((criterion) => {
      priorityScore += 100;
      notes.push(
        `has not been examined in ${criterion.name}`,
      );
    });

    // Οι πολλές εξετάσεις μειώνουν την προτεραιότητα.
    priorityScore -= student.estimatedExamCount * 10;
  }

  // Χαμηλός γενικός βαθμός.
  if (
    student.finalGrade !== null &&
    student.finalGrade < 5
  ) {
    priorityScore += (5 - student.finalGrade) * 20;
    notes.push("needs to improve");
  }

  return {
    name: student.name,
    finalGrade: student.finalGrade,
    estimatedExamCount: student.estimatedExamCount,
    criteria: student.criteria,
    priorityScore,
    notes,
  };
};

const prioritizeCourse = (
  course: ICourse,
): PrioritizedStudent[] => {
  return course.students
    .map(prioritizeStudent)
    .map((student) => ({
      ...student,
      randomTieBreaker: Math.random(),
    }))
    .sort((studentA, studentB) => {
      if (studentB.priorityScore !== studentA.priorityScore) {
        return studentB.priorityScore - studentA.priorityScore;
      }

      return studentA.randomTieBreaker - studentB.randomTieBreaker;
    })
    .map(({ randomTieBreaker: _unused, ...student }) => student);
};

export const coursePrioritizeService = {
  prioritizeCourse,
};