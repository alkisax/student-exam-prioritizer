# Repository Guidelines

## Project Structure & Module Organization

This repository is a two-package student-prioritization application:

- `frontend/` contains the React 19 + TypeScript UI, built with Vite. Pages are in `frontend/src/pages`, authentication is under `frontend/src/authLogin`, reusable components are under `frontend/src/components` and `frontend/src/layout`, and static assets are in `frontend/public` or `frontend/src/assets`.
- `backend/` contains the Express + TypeScript API. Feature code is grouped by domain (`src/course`, `src/login`); database access is in `src/db`, shared utilities are in `src/utils`, and startup is in `src/server.ts`.
- `notes/` holds development notes and example spreadsheets; do not edit generated `dist` output by hand.

## Build, Test, and Development Commands

Run commands from the relevant package directory:

- `cd frontend; npm run dev` starts the Vite development server.
- `cd frontend; npm run build` type-checks and builds the UI; its post-build step copies the result into `backend/dist`.
- `cd frontend; npm run lint` runs ESLint over the frontend.
- `cd backend; npm run dev` starts the API with `ts-node-dev` and reloads on changes.
- `cd backend; npm run build` compiles TypeScript and copies YAML assets.
- `cd backend; npm test` runs Jest in single-process mode with coverage. `npm run lint` runs the backend ESLint configuration.

## Coding Style & Naming Conventions

Use TypeScript with the repository's ESLint rules and two-space indentation. Use `PascalCase` for React components and classes, `camelCase` for functions and variables, and lowercase domain directories such as `course` and `login`. Keep route, controller, service, DAO, model, and type responsibilities separated as established in `backend/src`.

## Testing Guidelines

Backend tests use Jest and should be named `*.test.ts`; HTTP request examples are kept in `backend/*.test.http`. Add focused tests alongside the feature they cover and run `npm test` before submitting. The frontend has no dedicated test script; validate UI changes with `npm run lint` and `npm run build`.

## Commit & Pull Request Guidelines

Recent commits use brief summaries such as `Fix course form layout on mobile`. Use an imperative verb, describe one change, and avoid unrelated edits. Pull requests should explain the behavior change, identify frontend/backend impact, link an issue when available, and include screenshots or verification notes for UI changes.

## Security & Configuration Tips

Keep secrets and local connection settings in package-level `.env` files; never commit credentials or tokens. Review authentication, JWT, rate-limiting, and input-validation changes carefully, and verify that new API routes enforce the appropriate middleware.
