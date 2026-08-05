// backend/src/app.ts

import express from "express";
import cors from "cors";
import type { Request, Response } from "express";
import path from "path";

import logFromFrontRoutes from "./utils/logFromFront/logFromFront.routes";

import authRoutes from "./login/routes/auth.routes";
import userRoutes from "./login/routes/user.routes";

export const app = express();
app.set("trust proxy", 1);

console.log("=== APP START ===");

app.use(express.json({ limit: "100kb" }));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

app.get("/api/ping", (_req: Request, res: Response) => {
  console.log("someone pinged here");
  res.send("pong");
});

app.get("/health", (_req: Request, res: Response) => {
  res.send("ok");
});

// API ROUTES
app.use("/api/log-from-front", logFromFrontRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);


// STATIC FRONTEND
const publicPath = path.join(__dirname, "../dist");
app.use(express.static(publicPath));

app.get("/privacy", (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../public/privacy.html"));
});

app.get("/delete-account", (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../public/delete-account.html"));
});

app.get("/app-ads", (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../public/app-ads.txt"));
});

// Serve frontend routes, except API routes
app.get(/^\/(?!api|api-docs|health).*/, (_req: Request, res: Response) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

export default app;