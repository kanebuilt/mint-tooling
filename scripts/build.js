const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const srcDir = path.join(rootDir, "src");
const distDir = path.join(rootDir, "dist");
const manifestPath = path.join(srcDir, "manifest.json");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const { name, id, description, author, authorLink, license, version } = manifest;
void version;

let gitRemote = null;
try {
  gitRemote =
    execSync("git remote get-url origin", {
      cwd: rootDir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim() || null;
} catch {
  gitRemote = null;
}

const sourceFiles = fs
  .readdirSync(srcDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && /\.(m?js)$/i.test(entry.name))
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b));

const stripModuleSyntax = (code) =>
  code
    .replace(/^\s*import[\s\S]*?;\s*$/gm, "")
    .replace(/^\s*export\s+\{[\s\S]*?\}\s*;?\s*$/gm, "")
    .replace(/^\s*export\s+default\s+/gm, "")
    .replace(/^\s*export\s+/gm, "");

const stripRegistrations = (code) =>
  code.replace(/^\s*Scratch\.extensions\.register\s*\([\s\S]*?\)\s*;?\s*$/gm, "");

const bundledCode = sourceFiles
  .map((fileName) => {
    const filePath = path.join(srcDir, fileName);
    const fileContent = fs.readFileSync(filePath, "utf8");
    return stripRegistrations(stripModuleSyntax(fileContent)).trim();
  })
  .filter(Boolean)
  .join("\n\n");

const coreFile = ["01-core.js", "01-core.mjs"]
  .map((fileName) => path.join(srcDir, fileName))
  .find((filePath) => fs.existsSync(filePath));

const toClassName = (value) => {
  const parts = String(value || "")
    .split(/[^a-zA-Z0-9_$]+/)
    .filter(Boolean);

  const joined = parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");

  if (!joined) return "Extension";
  return /^[A-Za-z_$]/.test(joined) ? joined : `_${joined}`;
};

const detectClassName = () => {
  const classRegex = /\bclass\s+([A-Za-z_$][A-Za-z0-9_$]*)\b/;

  if (coreFile) {
    const coreContent = fs.readFileSync(coreFile, "utf8");
    const coreMatch = coreContent.match(classRegex);
    if (coreMatch) return coreMatch[1];
  }

  const anyMatch = bundledCode.match(classRegex);
  if (anyMatch) return anyMatch[1];

  return toClassName(id);
};

const className = detectClassName();

const headerLines = [
  `// Name: ${name}`,
  `// ID: ${id}`,
  `// Description: ${description}`,
  `// By: ${author} <${authorLink}>`,
  `// License: ${license}`,
  "",
  "// This extension was created by the Mint tooling, a new",
  "// bundling toolchain for TurboWarp extensions. Do not",
  "// manually modify this file, go to:",
];

if (gitRemote) {
  headerLines.push(`// ${gitRemote}`);
}

const output = `${headerLines.join("\n")}

(function (Scratch) {
    'use strict';

${bundledCode
  .split("\n")
  .map((line) => (line ? `    ${line}` : ""))
  .join("\n")}

    // Automatically detect the main class name from the manifest ID
    // or the '01-core.js' file and register it.
    Scratch.extensions.register(new ${className}());
})(Scratch);
`;

fs.mkdirSync(distDir, { recursive: true });
const outputPath = path.join(distDir, `${id || "extension"}.js`);
fs.writeFileSync(outputPath, output, "utf8");

console.log(`✓ Bundled ${name} successfully!`);
