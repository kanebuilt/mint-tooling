# Architecture

This page explains how Mint is organized and how the build process works.

## Project layout

The main folders are:

- `src/` — extension source code and `manifest.json`
- `assets/` — files that should be embedded in the extension
- `dist/` — generated extension bundles
- `scripts/` — build and project tooling
- `docs/` — user-facing documentation

Important files:

- `package.json` — project metadata and scripts
- `scripts/build.js` — bundler and validator
- `scripts/init.js` — project scaffold helper
- `scripts/asset.js` — asset manager

## Source code flow

Mint collects all JavaScript files in `src/`, bundles them, and produces a single file that TurboWarp can load.

### Step 1: Read source files

The build script scans `src/` for `.js` files and creates an entry bundle.

### Step 2: Bundle with `esbuild`

Mint uses `esbuild` to bundle code into an IIFE (`format: "iife"`).
This means the final output is one self-executing JavaScript file.

### Step 3: Clean up registration code

Some extension source can contain Scratch registration helpers.
The build script removes those helper calls before the final output is written.

### Step 4: Embed assets and manifest values

Mint turns local assets from `assets/` into base64 data URIs.
It also exposes manifest values through a small runtime object.

The final output includes two helper objects:

- `__mintAssets__` — holds encoded assets
- `__mintManifest__` — holds manifest values

Those helpers are accessed through the `mint` object in generated code.

## Runtime `mint` helpers

Mint provides two runtime getters:

- `mint.asset.get(name)`
- `mint.manifest.get(key)`

These functions return values only if the requested key or asset exists. If the requested value is missing, they return an empty string.

## Validation during build

Before writing the bundle, Mint checks that:

- every static `mint.asset.get("...")` call in `src/` refers to an actual file in `assets/`
- every static `mint.manifest.get("...")` call refers to a real key in `src/manifest.json`

If either check fails, the build stops with an error.

## Why Mint uses base64 assets

Bundling assets as data URIs means the final extension file is self-contained.
That makes it easier to distribute and load in TurboWarp without separate asset hosting.

## Output file

The final file is written to `dist/<extension-id>.js`.
The `<extension-id>` value comes from `src/manifest.json`.
