// backend/src/login/dao/user.dao.ts

import type {
  IUser,
  UserView,
  CreateUserHash,
  UpdateUser,
  Role,
} from "../types/user.types";

import { UserModel } from "../models/users.models";

import {
  NotFoundError,
  DatabaseError,
  ValidationError,
} from "../../utils/error/errors.types";

// SAFE MAPPER
export const toUserDAO = (user: IUser): UserView => {
  return {
    id: user._id.toString(),
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

// CREATE
const create = async (userData: CreateUserHash): Promise<UserView> => {
  try {
    const user = new UserModel({
      username: userData.username,
      name: userData.name,
      email: userData.email,
      role: userData.role ?? "MEMBER",
      hashedPassword: userData.hashedPassword,
      isActive: true,
    });

    const saved = await user.save();

    return toUserDAO(saved);
  } catch (err: unknown) {
    if (err instanceof Error && (err as any).code === 11000) {
      throw new ValidationError("Username or email already exists");
    }

    throw new DatabaseError("Error creating user");
  }
};

// READ
const readAll = async (): Promise<UserView[]> => {
  const users = await UserModel.find().sort({ createdAt: -1 });
  return users.map((u) => toUserDAO(u));
};

const readById = async (userId: string): Promise<UserView> => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return toUserDAO(user);
};

const readByUsername = async (username: string): Promise<IUser | null> => {
  return await UserModel.findOne({ username });
};

const readByEmail = async (email: string): Promise<IUser | null> => {
  return await UserModel.findOne({ email });
};

// UPDATE BASIC FIELDS
const update = async (
  userId: string,
  userData: UpdateUser,
): Promise<UserView> => {
  const updated = await UserModel.findByIdAndUpdate(userId, userData, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    throw new NotFoundError("User not found");
  }

  return toUserDAO(updated);
};

// UPDATE ROLE
const updateRoleById = async (
  userId: string,
  role: Role,
): Promise<UserView> => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  user.role = role;

  await user.save();

  return toUserDAO(user);
};

// DELETE
const deleteById = async (userId: string): Promise<UserView> => {
  const deleted = await UserModel.findByIdAndDelete(userId);

  if (!deleted) {
    throw new NotFoundError("User not found");
  }

  return toUserDAO(deleted);
};

export const userDAO = {
  toUserDAO,
  create,
  readAll,
  readById,
  readByUsername,
  readByEmail,
  update,
  updateRoleById,
  deleteById,
};