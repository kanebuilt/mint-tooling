# Commands

Mint exposes a small set of scripts through `pnpm` and Node.

## `pnpm` commands

The package scripts in `package.json` are the easiest way to use Mint.

- `pnpm build`
  - Runs `node scripts/build.js`
  - Bundles your extension from `src/` into `dist/`
- `pnpm init`
  - Runs `node scripts/init.js`
  - Prompts for metadata and creates a minimal extension entry point
- `pnpm asset:list`
  - Runs `node scripts/asset.js list`
  - Shows all files stored under `assets/`
- `pnpm asset:add`
  - Runs `node scripts/asset.js add`
  - Copies a local file into `assets/`
- `pnpm asset:remove`
  - Runs `node scripts/asset.js remove`
  - Deletes an asset from `assets/`
- `pnpm lint`
  - Runs ESLint across the repository
- `pnpm format`
  - Runs Prettier across the repository
- `pnpm test`
  - Placeholder test command

## Node scripts

You can also run the scripts directly with Node.

### `node scripts/build.js`

Builds a single distributable extension file from all JavaScript files in `src/`.

Example:

```bash
node scripts/build.js
```

### `node scripts/init.js`

Initializes the project and updates metadata in `src/manifest.json` and `package.json`.

Example:

```bash
node scripts/init.js
```

### `node scripts/asset.js`

Manages files inside `assets/`.

Example:

```bash
node scripts/asset.js list
node scripts/asset.js add ./local/image.png image.png
node scripts/asset.js remove icon.png
```

## Command flow

A typical Mint workflow looks like this:

1. `pnpm init` to set project metadata and create a starter extension
2. `pnpm asset:add` to add files needed by the extension
3. `pnpm build` to generate `dist/` output
4. `pnpm lint` and `pnpm format` to keep code clean

## Notes for beginners

- `pnpm` is a package manager similar to npm or Yarn.
- The `--` separator is required for `pnpm` when passing extra arguments to a script.
- Example: `pnpm asset:add -- ./local/image.png image.png`
