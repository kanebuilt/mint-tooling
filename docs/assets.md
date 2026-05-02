# Assets

Mint supports bundling static files from the `assets/` directory into your extension.

## Why use `assets/`

The `assets/` folder is where you put images, audio, text files, and other files your extension needs at runtime.

During the build, Mint reads these files and converts them into base64 data URIs.
That means your final extension bundle contains everything it needs in one file.

## Adding assets

Use the asset manager:

```bash
pnpm asset:add -- ./local/logo.svg logo.svg
```

Arguments:

- source file path
- optional asset name inside `assets/`

If you do not specify a destination name, Mint uses the source file name.

## Listing assets

To see what is currently available:

```bash
pnpm asset:list
```

This command prints every file under `assets/` with its size.

## Removing assets

To delete an asset:

```bash
pnpm asset:remove -- logo.svg
```

This removes the file from `assets/` and it will no longer be bundled.

## Asset usage in code

In your source files, use `mint.asset.get("path/to/file")` to read an embedded asset.

Example:

```js
const iconData = mint.asset.get("icon.png");
const imageUrl = iconData ? `url(${iconData})` : "";
```

## Rules and limitations

- Asset names are normalized and cannot escape the `assets/` folder.
- The path you use in `mint.asset.get(...)` must match the path under `assets/` exactly.
- Unsupported paths or missing files cause a build error if referenced statically.

## What file types work?

Mint recognizes common MIME types such as:

- `.svg`
- `.png`
- `.jpg`, `.jpeg`
- `.gif`
- `.webp`
- `.ico`
- `.mp3`
- `.wav`
- `.ogg`
- `.mp4`
- `.webm`
- `.json`
- `.txt`
- `.css`
- `.html`

Other extensions are bundled as `application/octet-stream`.
