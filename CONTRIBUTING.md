# Contributing to Mint

Thank you for helping improve Mint! This repository is the bundling toolchain for TurboWarp extensions, so contributions are welcome for tooling, documentation, and extension-related behavior.

## Before You Start

- Read the [Code of Conduct](./CODE_OF_CONDUCT.md) before contributing.
- Use GitHub issues for bugs and feature requests.
- For code changes, open a pull request and include a clear summary of the change.

## What to Expect

This repo uses:

- `pnpm` as the package manager (`pnpm@10.32.1`)
- Node.js `^20.19.0 || ^22.13.0 || >=24`
- `eslint` for linting
- `prettier` for formatting
- `node scripts/build.js` to produce the bundled `dist/` output

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Run linting:

   ```bash
   pnpm lint
   ```

3. Run formatting:

   ```bash
   pnpm format
   ```

4. Build the bundle:

   ```bash
   pnpm build
   ```

## Reporting Issues

Use the GitHub issue templates when filing a bug or feature request.

- Bug reports should include:
  - a short overview of the problem
  - steps to reproduce
  - expected behavior
  - any relevant logs or screenshots
- Feature requests should include:
  - the problem the feature solves
  - why it is useful
  - a proposed solution if possible

If a bug or feature is not clearly described, maintainers may ask for more details before work begins.

## Pull Request Guidance

Use the repository’s pull request template and include:

- a concise overview of what changed
- the motivation for the change
- the issue it closes, if applicable
- validation steps you performed

When possible, open an issue first for larger changes or design discussions.

## Code Contributions

### Style and Formatting

- Follow the existing repository style: double quotes, semicolons, `eqeqeq`, and `curly` blocks.
- Use `pnpm format` before opening a PR.
- Use `pnpm lint` to catch issues early.
- The repo includes custom lint rules for Scratch extension behavior, so fix any extension-specific warnings and errors.

### Extension-Specific Rules

Source files under `src/` are intended for Scratch/TurboWarp extension bundling.

Keep these conventions in mind:

- Use `Scratch.fetch()` instead of `fetch()` or `window.fetch()`.
- Use `Scratch.openWindow()` instead of `open()` or `window.open()`.
- Use `Scratch.redirect()` instead of assignments to `location` or calls to `location.assign()`/`location.replace()`.
- Do not call `Scratch.translate.setup()` manually.
- Do not alias `Scratch.translate` to a variable.
- Translate extension names and block text, but do not translate IDs, `docsURI`, or opcodes.

### Tooling and Build

- `scripts/build.js` is the build entry point. Changes to bundling behavior should include a clear explanation of the impact.
- Keep `src/manifest.json` aligned with the package metadata and build expectations.
- Do not commit changes to `dist/` unless specifically requested or part of a release workflow.

## Documentation Contributions

This repository currently has a small docs surface. If you are improving documentation:

- add or update content in `docs/`
- keep the `README.md` overview accurate
- update `docs/toc.md` if you add new user-facing documentation pages

## What We Review

Good contributions are:

- clear and deliberate
- small enough to review easily
- documented when behavior changes
- consistent with this repository’s style and toolchain

## Notes

- There is currently no automated test suite in this repository.
- Use `pnpm lint`, `pnpm format`, and `pnpm build` as your primary validation steps.
- This project is licensed under `LGPL-2.1-only`, so contributions are expected to be compatible with that license.
