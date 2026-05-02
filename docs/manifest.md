# Manifest

Mint uses `src/manifest.json` for extension metadata.

## What `manifest.json` contains

The file stores values that describe your extension, such as:

- `name`
- `id`
- `description`
- `author`
- `authorLink`
- `license`
- `version`

These values are included in the generated extension bundle and can be read at runtime.

## Why manifest values matter

The build script reads `src/manifest.json` and embeds its values into the final output.
This keeps your extension metadata consistent with your source and package files.

## Using manifest values in code

In your source files, use `mint.manifest.get("key")` to read values.

Example:

```js
const extensionName = mint.manifest.get("name");
const authorLink = mint.manifest.get("authorLink");
```

## Validation

During build, Mint checks that every static `mint.manifest.get("...")` call refers to a real key in `src/manifest.json`.
If your code requests a missing key, the build fails and reports the missing reference.

## Keeping versions in sync

`build.js` reads the version from `package.json` and updates `src/manifest.json` before bundling.
That means the manifest version in your final extension always matches the package version.

## Best practices

- Keep `id` short and unique.
- Use plain text for `name`, `description`, and `author`.
- Use `authorLink` for your GitHub profile or project page.
- If your extension references manifest values at runtime, be sure to use exact key names.
