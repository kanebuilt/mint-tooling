const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const assetsDir = path.join(rootDir, "assets");

const log = (message) => console.log(message);
const info = (message) => console.log(`\x1b[36mℹ\x1b[0m ${message}`);
const success = (message) => console.log(`\x1b[32m✓\x1b[0m ${message}`);
const warn = (message) => console.log(`\x1b[33m⚠\x1b[0m ${message}`);
const fail = (message) => console.log(`\x1b[31m✗\x1b[0m ${message}`);

const walkAssets = (dir, baseDir = dir) => {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkAssets(fullPath, baseDir));
    } else if (entry.isFile()) {
      files.push(path.relative(baseDir, fullPath).replace(/\\/g, "/"));
    }
  }

  return files;
};

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const listAssets = () => {
  log("Mint assets");
  log("");

  if (!fs.existsSync(assetsDir)) {
    info("No assets directory found.");
    return;
  }

  const files = walkAssets(assetsDir);

  if (files.length === 0) {
    info("No assets found.");
    return;
  }

  for (const file of files.sort()) {
    const stats = fs.statSync(path.join(assetsDir, file));
    info(`${file} (${formatSize(stats.size)})`);
  }

  log("");
  log(`${files.length} asset(s) found.`);
};

const addAsset = (sourcePath, destName) => {
  log("Mint assets");
  log("");

  if (!sourcePath) {
    fail("No source file specified.");
    fail("Usage: npm run asset:add -- <source-file> [dest-name]");
    process.exitCode = 1;
    return;
  }

  if (!fs.existsSync(sourcePath)) {
    fail(`Source file not found: ${sourcePath}`);
    process.exitCode = 1;
    return;
  }

  const stats = fs.statSync(sourcePath);
  if (!stats.isFile()) {
    fail(`Source is not a file: ${sourcePath}`);
    process.exitCode = 1;
    return;
  }

  const fileName = destName || path.basename(sourcePath);
  const destPath = path.join(assetsDir, fileName);

  fs.mkdirSync(path.dirname(destPath), { recursive: true });

  if (fs.existsSync(destPath)) {
    warn(`Overwriting existing asset: ${fileName}`);
  }

  fs.copyFileSync(sourcePath, destPath);
  success(`Added asset: ${fileName}`);
};

const removeAsset = (assetName) => {
  log("Mint assets");
  log("");

  if (!assetName) {
    fail("No asset name specified.");
    fail("Usage: npm run asset:remove -- <asset-name>");
    process.exitCode = 1;
    return;
  }

  const normalized = path.normalize(assetName).replace(/\\/g, "/");
  if (normalized.startsWith("..") || path.isAbsolute(normalized)) {
    fail(`Invalid asset name: ${assetName}`);
    process.exitCode = 1;
    return;
  }

  const assetPath = path.join(assetsDir, normalized);

  if (!fs.existsSync(assetPath)) {
    fail(`Asset not found: ${assetName}`);
    process.exitCode = 1;
    return;
  }

  fs.rmSync(assetPath, { recursive: true });
  success(`Removed asset: ${assetName}`);
};

const subcommand = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];

switch (subcommand) {
  case "list":
    listAssets();
    break;
  case "add":
    addAsset(arg1, arg2);
    break;
  case "remove":
    removeAsset(arg1);
    break;
  default:
    fail(`Unknown subcommand: ${subcommand || "(none)"}`);
    fail("Usage: node scripts/asset.js <list|add|remove> [args...]");
    process.exitCode = 1;
}
