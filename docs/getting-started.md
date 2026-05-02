# Getting Started

This document helps you start using Mint quickly.

## What you need

- Node.js 20.19.0+, 22.13.0+, or 24+ (see package.json "engines.node")
- `pnpm` (Mint uses `pnpm@10.32.1` via Corepack)
- A terminal with access to the project folder

## Install dependencies

From the project root:

```bash
pnpm install
```

This installs the packages Mint uses to build and validate your extension.

## Create a new extension

Mint includes an initialization script that updates metadata and creates a minimal `src/` entry point.

Run:

```bash
pnpm run init
# or
node scripts/init.js
```

The script asks for:

- extension name
- extension ID
- description
- author
- author link
- license
- npm package name
- repository URL
- homepage URL
- bugs URL

After you finish, Mint writes or updates:

- `src/manifest.json`
- `package.json`
- `src/index.js`

It also removes project contributor files such as `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, and `SECURITY.md` when they are not needed for a generated extension.

## Build the extension

Use the build tool to generate a distributable extension file:

```bash
pnpm build
```

The build output is written to:

- `dist/<extension-id>.js`

This file is ready for TurboWarp or Scratch-compatible extension loading.

## Manage assets

Mint can bundle files from `assets/` into your extension.

Common commands:

```bash
pnpm asset:list
pnpm asset:add -- ./local/image.png image.png
pnpm asset:remove -- image.png
```

Assets are embedded as base64 data URIs during the build.

## Learn more

If you want to understand the project layout or how Mint builds extensions, continue to:

- [Architecture](./architecture.md)
- [Commands](./commands.md)
- [Scripts Reference](./scripts.md)
