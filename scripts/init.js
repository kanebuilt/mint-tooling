const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { execSync } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const srcDir = path.join(rootDir, "src");
const manifestPath = path.join(srcDir, "manifest.json");
const packagePath = path.join(rootDir, "package.json");
const pnpmLockPath = path.join(rootDir, "pnpm-lock.yaml");

const log = (message) => console.log(message);
const info = (message) => console.log(`\x1b[36mℹ\x1b[0m ${message}`);
const success = (message) => console.log(`\x1b[32m✓\x1b[0m ${message}`);
const warn = (message) => console.log(`\x1b[33m⚠\x1b[0m ${message}`);
const fail = (message) => console.log(`\x1b[31m✗\x1b[0m ${message}`);

const contributorFiles = ["CODE_OF_CONDUCT.md", "CONTRIBUTING.md", "SECURITY.md"];

const removeIfExists = (filePath) => {
  if (!fs.existsSync(filePath)) return false;
  fs.rmSync(filePath, { recursive: true });
  return true;
};

const writeJson = (filePath, value) => {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n");
};

const formatDefaultValue = (value) => {
  if (value === undefined || value === null) return "";
  return String(value).replace(/\r?\n/g, " ").trim();
};

const ask = (rl, prompt, { defaultValue } = {}) => {
  const formattedDefault = formatDefaultValue(defaultValue);
  const suffix = formattedDefault ? ` (${formattedDefault})` : "";
  const question = `${prompt}${suffix}: `;
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      const trimmed = String(answer || "").trim();
      resolve(trimmed.length > 0 ? trimmed : defaultValue || "");
    });
  });
};

const slugifyId = (value) => {
  const cleaned = String(value || "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || "my-extension";
};

const toAuthorLink = (value) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("@")) return `https://github.com/${trimmed.slice(1)}`;
  if (/^[A-Za-z0-9-]+$/.test(trimmed)) return `https://github.com/${trimmed}`;
  return trimmed;
};

const readJsonIfExists = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
};

const run = (cmd, options) => execSync(cmd, { stdio: "inherit", ...options });

const main = async () => {
  log("Mint init");
  log("");

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    fail(
      "Unable to prompt for input: not running in an interactive terminal. Run this script directly in a TTY."
    );
    process.exitCode = 1;
    return;
  }

  for (const fileName of contributorFiles) {
    const removed = removeIfExists(path.join(rootDir, fileName));
    if (removed) {
      success(`Removed ${fileName}`);
    } else {
      info(`Skipped ${fileName} (not found)`);
    }
  }

  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }

  const previousManifest = readJsonIfExists(manifestPath) || {};
  const previousPackage = readJsonIfExists(packagePath) || {};

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    const extensionName = await ask(rl, "Extension name", {
      defaultValue: previousManifest.name || "My Extension",
    });
    const extensionId = slugifyId(
      await ask(rl, "Extension ID (short, no spaces)", {
        defaultValue: previousManifest.id || slugifyId(extensionName),
      })
    );
    const description = await ask(rl, "Description", {
      defaultValue: previousManifest.description || "",
    });
    const author = await ask(rl, "Author", {
      defaultValue: previousManifest.author || previousPackage.author || "",
    });
    const authorLink = toAuthorLink(
      await ask(rl, "Author link (URL or GitHub username)", {
        defaultValue: previousManifest.authorLink || "",
      })
    );
    const license = await ask(rl, "License", {
      defaultValue: previousManifest.license || previousPackage.license || "MIT",
    });
    const packageName = await ask(rl, "npm package name", {
      defaultValue: previousPackage.name || extensionId,
    });

    const existingScripts = previousPackage.scripts || {};

    const newManifest = {
      ...previousManifest,
      name: extensionName,
      id: extensionId,
      description,
      author,
      authorLink,
      license,
      version: previousManifest.version || previousPackage.version || "0.1.0",
    };
    writeJson(manifestPath, newManifest);
    success("Updated src/manifest.json");

    const newPackageJson = {
      ...previousPackage,
      name: packageName,
      description,
      license,
      author,
      packageManager: previousPackage.packageManager || "pnpm@10.32.1",
      scripts: {
        ...existingScripts,
        build: existingScripts.build || "node scripts/build.js",
        init: existingScripts.init || "node scripts/init.js",
        lint: existingScripts.lint || "eslint .",
        format: existingScripts.format || "prettier --write .",
        test: existingScripts.test || 'echo "Error: no test specified" && exit 1',
      },
    };

    writeJson(packagePath, newPackageJson);
    success("Updated package.json");

    // Replace sample project in src/ with a minimal version.
    const keep = new Set(["manifest.json"]);
    const existing = fs.readdirSync(srcDir);
    for (const entry of existing) {
      if (keep.has(entry)) continue;
      removeIfExists(path.join(srcDir, entry));
    }

    const extensionClassNameRaw =
      extensionId
        .split(/[^a-zA-Z0-9_$]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("") || "Extension";
    const extensionClassName = /^[A-Za-z_$]/.test(extensionClassNameRaw)
      ? extensionClassNameRaw
      : `Extension${extensionClassNameRaw}`;

    const safeExtensionName = extensionName.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

    const minimalSource = `class ${extensionClassName} {\n  getInfo() {\n    return {\n      id: "${extensionId}",\n      name: Scratch.translate("${safeExtensionName}"),\n      blocks: [],\n    };\n  }\n}\n\nScratch.extensions.register(new ${extensionClassName}());\n`;
    fs.writeFileSync(path.join(srcDir, "index.js"), minimalSource);
    success("Replaced src/ sample with minimal extension");

    if (fs.existsSync(pnpmLockPath)) {
      warn("pnpm-lock.yaml exists; pnpm install will update it for your new package name.");
    }

    info("Running pnpm install...");
    run("corepack enable", { cwd: rootDir, stdio: "ignore" });
    run("corepack prepare pnpm@10.32.1 --activate", { cwd: rootDir, stdio: "ignore" });
    run("pnpm install", { cwd: rootDir });
    success("pnpm install completed");
  } finally {
    rl.close();
  }
};

main().catch((err) => {
  fail(err?.stack || String(err));
  process.exitCode = 1;
});
