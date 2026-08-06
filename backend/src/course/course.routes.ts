// backend/src/course/course.routes.ts

import { Router } from "express";

import { courseController } from "./course.controller";
import { middleware } from "../login/middleware/verification.middleware";
import { limiter } from "../utils/limiter";

const router = Router();

// CREATE COURSE OR SAVE NEW SNAPSHOT
router.post(
  "/snapshot",
  middleware.verifyToken,
  limiter(15, 20),
  courseController.saveSnapshot,
);

// READ ALL COURSES OF LOGGED-IN TEACHER
router.get(
  "/",
  middleware.verifyToken,
  courseController.findAll,
);

router.get(
  "/:id/prioritize",
  middleware.verifyToken,
  courseController.prioritize,
);

// READ ONE COURSE
router.get(
  "/:id",
  middleware.verifyToken,
  courseController.findById,
);

// UPDATE COURSE NAME / SCHOOL YEAR
router.put(
  "/:id",
  middleware.verifyToken,
  courseController.updateById,
);

// DELETE COURSE
router.delete(
  "/:id",
  middleware.verifyToken,
  courseController.remove,
);

export default router;