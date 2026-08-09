# Repository Guidelines

## Project Structure & Module Organization

This repository contains two applications:

- `native-offline-first-notes/` is the Expo React Native client. Screens and routes live in `app/`; reusable UI is in `components/`, shared state in `context/`, local persistence in `db/`, and supporting code in `hooks/`, `utils/`, `types/`, and `constants/`. Images and fonts belong in `assets/`.
- `backend-csharp/` is the ASP.NET Core API targeting .NET 10. Organize HTTP handlers under `Controllers/` or `Endpoints/`, persistence under `Data/` and `Dao/`, transport types under `Dtos/`, domain types under `Models/`, and cross-cutting logic under `Services/` and `Extensions/`.
- `legacyNotes/` contains the older implementation; change it only when a task explicitly targets the legacy app.

Do not commit generated `bin/`, `obj/`, Android build output, `node_modules/`, local databases, or secrets.

## Build, Test, and Development Commands

Run client commands from `native-offline-first-notes/`:

```bash
npm install                 # install locked JavaScript dependencies
npm start                   # start the Expo development server
npm run android             # build and launch the Android app
npm run web                 # run the web target
npm run lint                # run Expo ESLint checks
```

Run backend commands from the repository root or `backend-csharp/`:

```bash
dotnet restore backend-csharp/backend-csharp.csproj
dotnet build backend-csharp/backend-csharp.csproj
dotnet run --project backend-csharp/backend-csharp.csproj
```

There is currently no automated test project. Validate API changes with the available `backend-csharp/*.http` requests and run the client linter.

## Coding Style & Naming Conventions

Use two spaces in TypeScript/TSX and four spaces in C#. Follow existing Expo/ESLint and .NET nullable/implicit-using settings. Use `PascalCase` for C# types and React components, `camelCase` for variables and functions, and descriptive route filenames consistent with Expo Router. Keep imports and API DTO shapes focused; avoid unrelated formatting churn.

## Commit & Pull Request Guidelines

Prefer concise conventional prefixes such as `feat:`, `fix:`, and `refactor:`, followed by an imperative summary (for example, `fix: preserve offline note edits`). Pull requests should describe the client/backend impact, list validation commands, link the relevant issue, and include screenshots or a short recording for visible mobile changes. Call out database, configuration, or migration requirements explicitly.

## Security & Configuration Tips

Keep credentials and environment-specific values out of source control; use local configuration or ignored `.env` files. Review authentication, authorization, and note ownership paths when changing controllers, DAOs, or sync logic.
