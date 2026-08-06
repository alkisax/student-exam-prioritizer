// backend/src/course/course.controller.ts

import type { Response } from "express";

import { courseDAO } from "./course.dao";
import { courseService } from "./course.service";
import type { AuthRequest } from "../login/types/user.types";
import { handleControllerError } from "../utils/error/errorHandler";
import { validateIdParam } from "../utils/validation/validateObjectIdParam";
import { coursePrioritizeService } from "./course.prioritize.service";

// CREATE OR UPDATE COURSE SNAPSHOT
const saveSnapshot = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.user?.id;

    if (!teacherId) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized",
      });
    }

    const { name, schoolYear, students } = req.body;

    if (!name || !schoolYear || !Array.isArray(students)) {
      return res.status(400).json({
        status: false,
        message: "name, schoolYear and students are required",
      });
    }

    const course = await courseService.saveSnapshot({
      teacherId,
      name,
      schoolYear,
      students,
    });

    return res.status(200).json({
      status: true,
      data: course,
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

// READ ALL COURSES OF LOGGED-IN TEACHER
const findAll = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.user?.id;

    if (!teacherId) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized",
      });
    }

    const courses = await courseDAO.readAllByTeacher(teacherId);

    return res.status(200).json({
      status: true,
      data: courses,
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

// READ ONE COURSE
const findById = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.user?.id;
    const { id } = req.params;

    if (!teacherId) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized",
      });
    }

    if (!validateIdParam(id, res, "Course ID")) return;

    const course = await courseDAO.readById(id, teacherId);

    return res.status(200).json({
      status: true,
      data: course,
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

// UPDATE COURSE BASIC FIELDS
const updateById = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.user?.id;
    const { id } = req.params;

    if (!teacherId) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized",
      });
    }

    if (!validateIdParam(id, res, "Course ID")) return;

    const updatedCourse = await courseDAO.updateById(id, teacherId, req.body);

    return res.status(200).json({
      status: true,
      data: updatedCourse,
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

// DELETE COURSE
const remove = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.user?.id;
    const { id } = req.params;

    if (!teacherId) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized",
      });
    }

    if (!validateIdParam(id, res, "Course ID")) return;

    const deletedCourse = await courseDAO.deleteById(id, teacherId);

    return res.status(200).json({
      status: true,
      message: `Course ${deletedCourse.name} deleted`,
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

const prioritize = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.user?.id;
    const { id } = req.params;

    if (!teacherId) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized",
      });
    }

    if (!validateIdParam(id, res, "Course ID")) return;

    const course = await courseDAO.readById(id, teacherId);
    const prioritizedStudents =
      coursePrioritizeService.prioritizeCourse(course);

    return res.status(200).json({
      status: true,
      data: prioritizedStudents,
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

export const courseController = {
  saveSnapshot,
  findAll,
  findById,
  updateById,
  remove,
  prioritize,
};
