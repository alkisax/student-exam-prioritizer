// backend/src/login/controllers/user.controller.ts

import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import type { UpdateUser, AuthRequest, Role } from "../types/user.types";

import { userDAO } from "../dao/user.dao";
import { handleControllerError } from "../../utils/error/errorHandler";
import { createUserSchema, updateUserSchema } from "../validation/auth.schema";

import { UserModel } from "../models/users.models";
import { validateIdParam } from "../../utils/validation/validateObjectIdParam";

// CREATE USER
const create = async (req: AuthRequest, res: Response) => {
  try {
    const requester = req.user;

    if (!requester || requester.role !== "ADMIN") {
      return res.status(403).json({
        status: false,
        message: "Admin only",
      });
    }

    const parsed = createUserSchema.parse(req.body);

    const existing = await UserModel.findOne({
      username: parsed.username,
    });

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
      role: parsed.role ?? "MEMBER",
      hashedPassword,
    });

    return res.status(201).json({
      status: true,
      data: newUser,
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

// READ ALL
const findAll = async (_req: Request, res: Response) => {
  try {
    const users = await userDAO.readAll();

    return res.status(200).json({
      status: true,
      data: users,
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

// READ BY ID
const findById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!validateIdParam(id, res, "User ID")) return;

    const user = await userDAO.readById(id);

    return res.status(200).json({
      status: true,
      data: user,
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

// UPDATE BASIC FIELDS
const updateById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const requester = req.user;

    if (!requester) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized",
      });
    }

    if (requester.role !== "ADMIN" && requester.id !== id) {
      return res.status(403).json({
        status: false,
        message: "Forbidden",
      });
    }

    if (!validateIdParam(id, res, "User ID")) return;

    const parsed = updateUserSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        status: false,
        details: parsed.error.issues.map((issue) => issue.message),
      });
    }

    const data = { ...parsed.data } as UpdateUser;

    if (data.password) {
      const hashed = await bcrypt.hash(data.password, 10);
      data.hashedPassword = hashed;
      delete data.password;
    }

    // μόνο admin να αλλάζει role / isActive
    if (requester.role !== "ADMIN") {
      delete data.role;
      delete data.isActive;
    }

    const updated = await userDAO.update(id, data);

    return res.status(200).json({
      status: true,
      data: updated,
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

// UPDATE ROLE
const updateRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body as { role?: Role };
    const requester = req.user;

    if (!requester || requester.role !== "ADMIN") {
      return res.status(403).json({
        status: false,
        message: "Admin only",
      });
    }

    if (!role || !["ADMIN", "MEMBER"].includes(role)) {
      return res.status(400).json({
        status: false,
        message: "Valid role required",
      });
    }

    if (!validateIdParam(id, res, "User ID")) return;

    const targetUser = await UserModel.findById(id);

    if (!targetUser) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    // Prevent removing last ADMIN
    if (targetUser.role === "ADMIN" && role !== "ADMIN") {
      const adminCount = await UserModel.countDocuments({
        role: "ADMIN",
      });

      if (adminCount <= 1) {
        return res.status(400).json({
          status: false,
          message: "Cannot remove the last ADMIN",
        });
      }
    }

    const updated = await userDAO.updateRoleById(id, role);

    return res.status(200).json({
      status: true,
      data: updated,
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

// DELETE
const remove = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const requester = req.user;

    if (!requester || requester.role !== "ADMIN") {
      return res.status(403).json({
        status: false,
        message: "Admin only",
      });
    }

    if (!validateIdParam(id, res, "User ID")) return;

    const deleted = await userDAO.deleteById(id);

    return res.status(200).json({
      status: true,
      message: `User ${deleted.username} deleted`,
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

export const userController = {
  create,
  findAll,
  findById,
  updateById,
  updateRole,
  remove,
};