const fs = require("fs");
const path = require("path");
const { build } = require("esbuild");
const { parse } = require("@babel/parser");
const MagicString = require("magic-string");
const { execSync } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const srcDir = path.join(rootDir, "src");
const distDir = path.join(rootDir, "dist");
const manifestPath = path.join(srcDir, "manifest.json");
const packagePath = path.join(rootDir, "package.json");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const { name, id, description, author, authorLink, license } = manifest;
const packageVersion = packageJson.version;
manifest.version = packageVersion;

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
  .sort();

const walkNodes = (node, visitor) => {
  if (!node || typeof node !== "object") return;
  visitor(node);
  for (const key of Object.keys(node)) {
    const child = node[key];
    if (Array.isArray(child)) {
      child.forEach((item) => walkNodes(item, visitor));
    } else if (child && typeof child.type === "string") {
      walkNodes(child, visitor);
    }
  }
};

const removeScratchRegistrations = (code) => {
  const magic = new MagicString(code);
  const ast = parse(code, {
    sourceType: "module",
    plugins: ["classProperties", "optionalChaining", "nullishCoalescing"],
  });

  let capturedClassName = null;

  walkNodes(ast, (node) => {
    if (node.type !== "ExpressionStatement") return;
    const expression = node.expression;
    if (!expression || expression.type !== "CallExpression") return;

    const callee = expression.callee;
    if (
      callee?.type === "MemberExpression" &&
      callee.property.type === "Identifier" &&
      callee.property.name === "register" &&
      callee.object?.type === "MemberExpression" &&
      callee.object.property.type === "Identifier" &&
      callee.object.property.name === "extensions" &&
      callee.object.object?.type === "Identifier" &&
      callee.object.object.name === "Scratch"
    ) {
      const registeredClass = expression.arguments[0];
      if (
        registeredClass?.type === "NewExpression" &&
        registeredClass.callee.type === "Identifier"
      ) {
        capturedClassName = registeredClass.callee.name;
      }
      magic.remove(node.start, node.end);
    }
  });

  return { code: magic.toString(), capturedClassName };
};

const getClassNames = (code) => {
  const ast = parse(code, {
    sourceType: "module",
    plugins: ["classProperties", "optionalChaining", "nullishCoalescing"],
  });

  const classNames = [];
  walkNodes(ast, (node) => {
    if (node.type === "ClassDeclaration" && node.id?.type === "Identifier") {
      classNames.push(node.id.name);
    }
  });

  return classNames;
};

const toClassName = (value) => {
  const parts = String(value || "")
    .split(/[^a-zA-Z0-9_$]+/)
    .filter(Boolean);

  const joined = parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");

  if (!joined) return "Extension";
  return /^[A-Za-z_$]/.test(joined) ? joined : `_${joined}`;
};

const detectClassName = (cleanedCode, capturedClassName) => {
  if (manifest.main) {
    return manifest.main;
  }
  if (capturedClassName) {
    return capturedClassName;
  }

  const classNames = getClassNames(cleanedCode);
  if (classNames.length > 0) {
    return classNames[classNames.length - 1];
  }

  return toClassName(id);
};

const buildBundle = async () => {
  const entrySource = sourceFiles.map((fileName) => `import "./${fileName}";`).join("\n");
  const result = await build({
    stdin: {
      contents: entrySource,
      sourcefile: "entry.js",
      resolveDir: srcDir,
      loader: "js",
    },
    bundle: true,
    format: "iife",
    platform: "browser",
    target: ["es2020"],
    write: false,
    sourcemap: false,
    legalComments: "none",
  });

  const bundledCode = result.outputFiles[0].text;
  const { code: cleanedCode, capturedClassName } = removeScratchRegistrations(bundledCode);
  const className = detectClassName(cleanedCode, capturedClassName);

  const headerLines = [
    `// Name: ${name}`,
    `// ID: ${id}`,
    `// Version: ${packageVersion}`,
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

${cleanedCode
  .split("\n")
  .map((line) => (line ? `    ${line}` : ""))
  .join("\n")}

    Scratch.extensions.register(new ${className}());
})(Scratch);
`;

  fs.mkdirSync(distDir, { recursive: true });
  const outputPath = path.join(distDir, `${id || "extension"}.js`);
  fs.writeFileSync(outputPath, output, "utf8");

  console.log(`✓ Bundled ${name} successfully!`);
};

buildBundle().catch((error) => {
  console.error(error);
  process.exit(1);
});
