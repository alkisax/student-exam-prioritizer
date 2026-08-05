// backend/src/login/controllers/auth.controller.ts
import type { Request, Response } from "express";
import { loginSchema, registerSchema } from "../validation/auth.schema";
import { userDAO } from "../dao/user.dao";
import { authService } from "../services/auth.service";
import { handleControllerError } from "../../utils/error/errorHandler";
import { Role } from "../types/user.types";
import bcrypt from "bcrypt";

// LOGIN
const login = async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.parse(req.body);

    const user = await userDAO.readByUsername(parsed.username);

    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Invalid username or password",
      });
    }

    const isMatch = await authService.verifyPassword(
      parsed.password,
      user.hashedPassword,
    );

    if (!isMatch) {
      return res.status(401).json({
        status: false,
        message: "Invalid username or password",
      });
    }

    const token = authService.generateAccessToken(user);

    return res.status(200).json({
      status: true,
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          email: user.email,
          roles: user.role,
        },
      },
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

// REGISTER (PUBLIC)
const register = async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.parse(req.body);

    const existing = await userDAO.readByUsername(parsed.username);
    if (existing) {
      return res.status(409).json({
        status: false,
        message: "Username already taken",
      });
    }

    const hashedPassword = await bcrypt.hash(parsed.password, 10);

    const newUser = await userDAO.create({
      username: parsed.username,
      name: parsed.name,
      email: parsed.email,
      hashedPassword,
      // roles intentionally NOT passed
    });

    return res.status(201).json({
      status: true,
      data: newUser,
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

// REFRESH TOKEN
const refreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        status: false,
        message: "No token provided",
      });
    }

    const verification = authService.verifyAccessToken(token);

    if (!verification.verified) {
      return res.status(401).json({
        status: false,
        message: "Invalid token",
      });
    }

    const payload = verification.data as {
      id: string;
      username: string;
      roles: Role[];
    };

    const dbUser = await userDAO.readByUsername(payload.username);

    if (!dbUser) {
      return res.status(401).json({
        status: false,
        message: "User not found",
      });
    }

    const newToken = authService.generateAccessToken(dbUser);

    return res.status(200).json({
      status: true,
      data: { token: newToken },
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

export const authController = {
  login,
  register,
  refreshToken,
};
