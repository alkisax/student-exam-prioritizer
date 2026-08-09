# Repository Guidelines

## Project Structure & Module Organization

This repository contains three applications:

- `frontend/` is the Vite + React web client. Its code is under `src/`, organized into `pages`, `components`, `services`, `hooks`, `types`, and related feature folders; static files live in `public/`.
- `astro-native/` is the Expo + React Native client. File-based routes are in `app/`, reusable UI is in `components/`, and shared code is in `hooks/`, `services/`, `utils/`, and `types/`. Native Android project files are under `android/`.
- `backend/` is the Express + TypeScript API. Server code is under `src/`, with feature areas such as `astro`, `login`, `openAI`, and `socket`; YAML assets are copied during builds.

Keep generated output (`dist/`, `build/`, coverage, native build artifacts) out of commits.

## Build, Test, and Development Commands

Run commands from the relevant application directory:

- Web: `cd frontend; npm run dev` starts Vite; `npm run build` type-checks and builds; `npm run preview` serves the production build.
- Native: `cd astro-native; npm start` launches Expo; `npm run android`, `npm run ios`, and `npm run web` target each platform; `npm run lint` runs Expo linting.
- Backend: `cd backend; npm run dev` starts the development server; `npm run build` compiles TypeScript and copies YAML assets; `npm start` runs the compiled server.

## Coding Style & Naming Conventions

Use TypeScript where supported, two-space indentation, semicolons, and existing naming patterns. Use PascalCase for React components, camelCase for variables/functions, and descriptive feature-oriented filenames. In `frontend/`, run `npm run format` and `npm run lint`; use `npm run lint` in `backend/` and `astro-native/` before submitting changes.

## Testing Guidelines

Backend tests use Jest: `cd backend; npm test` runs the suite with coverage, serial execution, and test isolation. Name tests `*.test.ts` or `*.spec.ts`. Add or update tests for API behavior and run the relevant client build/lint checks for UI changes.

## Commit & Pull Request Guidelines

Recent commits use short, task-focused descriptions (for example, `build aab` or `turn ads back on`). Follow that style, but make messages more specific when possible. Pull requests should explain the affected app, summarize behavior changes, list validation commands, link related issues, and include screenshots or recordings for UI changes. Keep generated files and local environment files out of the change.

## Security & Configuration Tips

Never commit `.env` files, database files, credentials, keystores, or API keys. Use local environment configuration and verify production values before deployment. Treat changes involving ads, authentication, OpenAI integration, sockets, or database access as requiring both manual verification and focused tests.
