// backend/src/login/routes/user.routes.ts

import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { middleware } from "../middleware/verification.middleware";
import { limiter } from "../../utils/limiter";

const router = Router();

// CREATE USER
router.post(
  "/",
  middleware.verifyToken,
  middleware.checkRole("ADMIN"),
  limiter(15, 5),
  userController.create,
);

// READ ALL USERS
router.get(
  "/",
  middleware.verifyToken,
  middleware.checkRole("ADMIN"),
  userController.findAll,
);

// READ ONE USER
router.get(
  "/:id",
  middleware.verifyToken,
  middleware.checkRole("ADMIN"),
  userController.findById,
);

// UPDATE BASIC FIELDS
router.put(
  "/:id",
  middleware.verifyToken,
  userController.updateById,
);

// UPDATE ROLE
router.put(
  "/:id/role",
  middleware.verifyToken,
  middleware.checkRole("ADMIN"),
  userController.updateRole,
);

// DELETE USER
router.delete(
  "/:id",
  middleware.verifyToken,
  middleware.checkRole("ADMIN"),
  userController.remove,
);

export default router;