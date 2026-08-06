// backend/src/course/course.types.ts

import type { Document, Types } from "mongoose";

export interface ICriterion {
  name: string;
  grade: number | null;
}

export interface IStudentCourseData {
  name: string;
  finalGrade: number | null;
  estimatedExamCount: number;
  criteria: ICriterion[];
}

export interface ICourse extends Document {
  _id: Types.ObjectId;
  name: string;
  schoolYear: string;
  teacherId: Types.ObjectId;
  students: IStudentCourseData[];
  lastUploadAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCourseInput {
  name: string;
  schoolYear: string;
  teacherId: string;
  students?: IStudentCourseData[];
}

export interface UpdateCourseInput {
  name?: string;
  schoolYear?: string;
  students?: IStudentCourseData[];
  lastUploadAt?: Date;
}