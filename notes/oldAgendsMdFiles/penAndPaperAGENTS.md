# Repository Guidelines

## Project Structure & Module Organization

This repository contains a mobile/web Expo client and two backend areas. The active client is in `native-penAndPaper/`: route screens live in `src/app/`, reusable UI and SVG boards in `src/components/`, game logic in `src/hooks/`, shared state in `src/context/`, and static images/sounds/SVGs in `assets/`. The active ASP.NET Core service is in `backend-dotnet/`, organized into `Controllers/`, `Endpoints/`, `Dtos/`, `Hub/`, and `wwwroot/`. `legacyNotes/` contains historical Android, release, and deployment notes; update it only when preserving relevant operational knowledge.

## Build, Test, and Development Commands

Run client commands from `native-penAndPaper/`:

```bash
npm install             # install locked dependencies
npm run start           # start the Expo development server
npm run android         # build/run the Android development app
npm run ios             # build/run the iOS development app
npm run web             # run the web target
npm run lint            # run Expo/ESLint checks
```

Run backend commands from `backend-dotnet/` with the installed .NET SDK:

```bash
dotnet run              # run the ASP.NET Core service
dotnet build            # compile the service
```

No automated test project is currently checked in. Use the `.http` requests in `backend-dotnet/` for endpoint smoke tests and manually exercise affected game screens on the relevant Expo target.

## Coding Style & Naming Conventions

Use two-space indentation for TypeScript/TSX and standard C# formatting with nullable reference types enabled. Prefer TypeScript components and hooks with PascalCase filenames for components (`ScreenWrapper.tsx`) and camelCase for hooks/functions (`useCollector.ts`). Keep game-specific code grouped by the existing feature folders. Run `npm run lint` before submitting client changes; use `dotnet build` to catch backend compilation issues.

## Testing Guidelines

Add tests if introducing a test framework or non-trivial pure game logic; otherwise document manual verification. For changes to multiplayer behavior, verify both SignalR connection paths and the corresponding local game flow.

## Commit & Pull Request Guidelines

Follow the existing concise prefixes: `feat:`, `fix:`, and `style:` (for example, `fix: correct snake fight scoring`). Keep commits focused. Pull requests should explain the affected game or service, include verification commands and manual test results, link an issue when applicable, and attach screenshots or recordings for UI changes.

## Security & Configuration

Never commit credentials, signing keys, local environment files, or machine-specific settings. Keep secrets out of `appsettings*.json`, `.env` files, and Android local configuration; use local secret storage or environment variables instead. Do not modify generated `bin/`, `obj/`, `node_modules/`, or Expo cache output.
