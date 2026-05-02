# Scripts Reference

This document explains the Node scripts in `scripts/` and how they are used in the Mint project.

Mint uses small, focused scripts instead of a large build system. Each script is a command-line tool that runs with Node and keeps your workflow simple.

## What lives in `scripts/`

The `scripts/` folder contains three main utilities:

- `build.js` - bundle your extension and generate a distributable file in `dist/`
- `asset.js` - manage runtime assets stored under `assets/`
- `init.js` - scaffold a new TurboWarp extension and update metadata files

These scripts are designed for the project itself and are called from `package.json` script entries.

## Available `pnpm` commands

The project defines these commands in `package.json`:

- `pnpm build` - run `node scripts/build.js`
- `pnpm init` - run `node scripts/init.js`
- `pnpm asset:list` - run `node scripts/asset.js list`
- `pnpm asset:add` - run `node scripts/asset.js add`
- `pnpm asset:remove` - run `node scripts/asset.js remove`

There are also standard housekeeping scripts:

- `pnpm lint` - run ESLint
- `pnpm format` - run Prettier
- `pnpm test` - placeholder test command

## `build.js`

The `build.js` script is the core bundler for Mint.

### Purpose

- bundle all JavaScript source files from `src/`
- inline assets from `assets/` as base64 data URIs
- validate `mint.asset.get(...)` and `mint.manifest.get(...)` references
- generate a single extension file in `dist/`

### How it works

1. It reads `src/manifest.json` and the package version from `package.json`.
2. It scans `src/` for JavaScript files and bundles them with `esbuild`.
3. It converts the bundled output into a clean form and removes any Scratch extension registration helper code used during development.
4. It collects all files under `assets/`, encodes them as base64, and embeds them into a runtime object.
5. It validates that every static `mint.asset.get("...")` call refers to a real asset file.
6. It validates that every static `mint.manifest.get("...")` call refers to an existing key in `manifest.json`.
7. It writes a final extension file in `dist/`, wrapped in an IIFE that registers the extension with Scratch.

### Key study points

- `esbuild` is used with `format: "iife"`, which produces a self-invoking function.
- `@babel/parser` parses source code into an AST so the script can inspect `mint.asset.get` and `mint.manifest.get` calls.
- `magic-string` is used to remove unneeded registration statements from generated code.
- Asset and manifest data are embedded using `JSON.stringify` into `Object.create(null)` objects.

### Output

The bundled extension is written to `dist/<id>.js`, where `<id>` comes from `src/manifest.json`.

## `asset.js`

The `asset.js` script helps you manage files inside the `assets/` folder.

### Purpose

- list all asset files currently present
- add a new asset file to the project
- remove an existing asset file

### Supported subcommands

- `node scripts/asset.js list`
- `node scripts/asset.js add <source-file> [dest-name]`
- `node scripts/asset.js remove <asset-name>`

### What each subcommand does

#### `list`

- Recursively scans the `assets/` directory.
- Prints every file path and its size.
- Helps you see which assets are included in the build.

#### `add`

- Copies a file from the local filesystem into `assets/`.
- The first argument is the path to the source file.
- The optional second argument is the asset name inside `assets/`.
- If the destination file already exists, it overwrites it and warns you.

Example:

```bash
pnpm asset:add -- ./local/image.png image.png
```

#### `remove`

- Deletes an asset from `assets/`.
- The argument is the path to the asset relative to `assets/`.

Example:

```bash
pnpm asset:remove -- icon.png
```

### Important behavior

- Destination names are normalized and cannot escape the `assets/` folder.
- The script checks that the source path exists and is a file.
- Invalid or missing arguments produce a friendly usage hint.

## `init.js`

The `init.js` script helps bootstrap a new extension project.

### Purpose

- remove contributor files that are not part of a generated extension
- prompt the user for extension metadata
- update `src/manifest.json` and `package.json`
- replace the `src/` sample code with a minimal extension entry point
- run `pnpm install`

### What it prompts for

- Extension name
- Extension ID
- Description
- Author
- Author link
- License
- npm package name
- Repository URL
- Homepage URL
- Bugs URL

The script preserves existing values where possible and uses them as defaults.

### How it updates the project

- removes `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, and `SECURITY.md` if present
- writes `src/manifest.json` with the answered metadata
- writes `package.json` entries and script commands
- writes a minimal `src/index.js` with a Scratch extension class and registration call

### Developer notes

- `init.js` requires an interactive terminal (`TTY`).
- It uses Node's `readline` module to ask questions.
- It normalizes author links so GitHub usernames become full URLs.

## Why this folder exists

The `scripts/` folder is the build and project plumbing for Mint.

- `build.js` turns the extension source into the final file TurboWarp consumes.
- `asset.js` manages files that must be bundled as runtime assets.
- `init.js` makes it easy to start a new extension project without manual setup.

If you are learning how Mint works, start by reading `scripts/build.js` first, then `scripts/asset.js`, and finally `scripts/init.js`.
