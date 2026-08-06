// backend/src/course/course.dao.ts

import { CourseModel } from "./course.model";
import type {
  ICourse,
  CreateCourseInput,
  UpdateCourseInput,
} from "./course.types";

import {
  DatabaseError,
  NotFoundError,
  ValidationError,
} from "../utils/error/errors.types";

// CREATE
const create = async (courseData: CreateCourseInput): Promise<ICourse> => {
  try {
    const course = new CourseModel({
      name: courseData.name,
      schoolYear: courseData.schoolYear,
      teacherId: courseData.teacherId,
      students: courseData.students ?? [],
    });

    return await course.save();
  } catch (err: unknown) {
    console.error("COURSE CREATE ERROR:", err);

    if (err instanceof Error && (err as { code?: number }).code === 11000) {
      throw new ValidationError("Course already exists for this school year");
    }

    throw new DatabaseError("Error creating course");
  }
};

// READ ALL COURSES OF ONE TEACHER
const readAllByTeacher = async (teacherId: string): Promise<ICourse[]> => {
  try {
    return await CourseModel.find({ teacherId }).sort({
      schoolYear: -1,
      name: 1,
    });
  } catch {
    throw new DatabaseError("Error reading courses");
  }
};

// READ ONE
const readById = async (
  courseId: string,
  teacherId: string,
): Promise<ICourse> => {
  try {
    const course = await CourseModel.findOne({
      _id: courseId,
      teacherId,
    });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    return course;
  } catch (err) {
    if (err instanceof NotFoundError) {
      throw err;
    }

    throw new DatabaseError("Error reading course");
  }
};

// FIND BY NAME AND YEAR
const readByNameAndYear = async (
  teacherId: string,
  name: string,
  schoolYear: string,
): Promise<ICourse | null> => {
  try {
    return await CourseModel.findOne({
      teacherId,
      name,
      schoolYear,
    });
  } catch {
    throw new DatabaseError("Error reading course");
  }
};

// UPDATE
const updateById = async (
  courseId: string,
  teacherId: string,
  courseData: UpdateCourseInput,
): Promise<ICourse> => {
  try {
    const updatedCourse = await CourseModel.findOneAndUpdate(
      {
        _id: courseId,
        teacherId,
      },
      courseData,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedCourse) {
      throw new NotFoundError("Course not found");
    }

    return updatedCourse;
  } catch (err) {
    if (err instanceof NotFoundError) {
      throw err;
    }

    throw new DatabaseError("Error updating course");
  }
};

// DELETE
const deleteById = async (
  courseId: string,
  teacherId: string,
): Promise<ICourse> => {
  try {
    const deletedCourse = await CourseModel.findOneAndDelete({
      _id: courseId,
      teacherId,
    });

    if (!deletedCourse) {
      throw new NotFoundError("Course not found");
    }

    return deletedCourse;
  } catch (err) {
    if (err instanceof NotFoundError) {
      throw err;
    }

    throw new DatabaseError("Error deleting course");
  }
};

export const courseDAO = {
  create,
  readAllByTeacher,
  readById,
  readByNameAndYear,
  updateById,
  deleteById,
};
