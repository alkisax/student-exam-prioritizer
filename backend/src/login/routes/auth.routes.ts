// backend/src/login/routes/auth.routes.ts

import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { limiter } from "../../utils/limiter";

const router = Router();

// LOGIN
router.post("/login", limiter(45, 5), authController.login);

// REGISTER
router.post("/register", limiter(15, 5), authController.register);

// REFRESH TOKEN
router.post("/refresh", limiter(15, 5), authController.refreshToken);

export default router;