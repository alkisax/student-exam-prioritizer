# Repository Guidelines

## Project Structure & Module Organization

Keep application source in the repository’s established source directories, tests beside the relevant module or in the existing test directory, and static files in the established assets or public directory. Avoid adding top-level folders without documenting their purpose.

## Build, Test, and Development Commands

Use the commands declared by the repository’s manifest or build files. Typical project checks are `npm install` to install dependencies, `npm run dev` to start local development, `npm run build` to create a production build, and `npm test` to run automated tests. Run the applicable formatter and linter before submitting changes, and do not commit generated output or dependency directories.

## Coding Style & Naming Conventions

Follow the existing formatter, linter, and language conventions. Use consistent indentation, descriptive names, and small single-purpose modules. Prefer `PascalCase` for types and components, `camelCase` for variables and functions, and the surrounding project’s established naming pattern for files, routes, and assets.

## Testing Guidelines

Add or update tests for every behavior change, including validation and failure paths. Match the existing framework and naming convention, such as `*.test.*` or `*.spec.*`. Keep tests deterministic and isolated; run the full suite and coverage checks when configured.

## Commit & Pull Request Guidelines

Use short, imperative commit subjects, for example `Fix cart total rounding`, and keep unrelated refactors separate. Pull requests should describe the behavior change, explain implementation decisions when useful, link an issue where applicable, and report the tests run. Include screenshots or API examples for user-facing changes and call out configuration, migration, or deployment implications.

## Security & Configuration

Never commit credentials, tokens, private keys, or production data. Keep secrets in local environment configuration, document new variables with safe example values, and validate untrusted input at application boundaries. Review dependency changes for security and compatibility.
