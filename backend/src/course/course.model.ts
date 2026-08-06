// backend/src/course/course.model.ts

import mongoose from "mongoose";
import type { ICourse } from "./course.types";

const criterionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    grade: {
      type: Number,
      default: null,
    },
  },
  {
    _id: false,
  },
);

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    finalGrade: {
      type: Number,
      default: null,
    },

    estimatedExamCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    criteria: {
      type: [criterionSchema],
      default: [],
    },
  },
  {
    _id: false,
  },
);

const courseSchema = new mongoose.Schema<ICourse>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    schoolYear: {
      type: String,
      required: true,
      trim: true,
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    students: {
      type: [studentSchema],
      default: [],
    },

    lastUploadAt: {
      type: Date,
    },
  },
  {
    collection: "Courses",
    timestamps: true,
  },
);

courseSchema.index(
  {
    teacherId: 1,
    name: 1,
    schoolYear: 1,
  },
  {
    unique: true,
  },
);

export const CourseModel = mongoose.model<ICourse>("Course", courseSchema);
