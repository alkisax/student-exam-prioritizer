// backend/src/login/types/user.types.ts
import type { Request } from "express";
import type { Document, Types } from "mongoose";

export type Role = "ADMIN" | "MEMBER";

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  name?: string;
  email?: string;
  hashedPassword: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserView {
  id: string;
  username: string;
  name?: string;
  email?: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUser {
  username: string;
  name?: string;
  email?: string;
  password: string;
  role?: Role;
}

export interface CreateUserHash {
  username: string;
  name?: string;
  email?: string;
  hashedPassword: string;
  role?: Role;
}

export interface UpdateUser {
  username?: string;
  name?: string;
  email?: string;
  password?: string;
  hashedPassword?: string;
  role?: Role;
  isActive?: boolean;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: Role;
  };
}