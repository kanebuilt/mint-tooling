#!/usr/bin/env node

const fs = require('fs/promises');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const MANIFEST_PATH = path.join(SRC_DIR, 'manifest.json');

function formatGitRemoteUrl(rawRemote) {
    const remote = rawRemote.trim();
    if (!remote) return null;

    if (remote.startsWith('git@')) {
        const match = remote.match(/^git@([^:]+):(.+?)(?:\.git)?$/);
        if (!match) return null;
        return `https://${match[1]}/${match[2]}`;
    }

    if (remote.startsWith('ssh://git@')) {
        const match = remote.match(/^ssh:\/\/git@([^/]+)\/(.+?)(?:\.git)?$/);
        if (!match) return null;
        return `https://${match[1]}/${match[2]}`;
    }

    if (remote.startsWith('http://') || remote.startsWith('https://')) {
        return remote.replace(/\.git$/, '');
    }

    return null;
}

async function getOriginRemoteUrl() {
    try {
        const { stdout } = await execAsync('git remote get-url origin', { cwd: ROOT_DIR });
        return formatGitRemoteUrl(stdout);
    } catch {
        return null;
    }
}

async function readManifest() {
    const rawManifest = await fs.readFile(MANIFEST_PATH, 'utf8');
    const manifest = JSON.parse(rawManifest);

    const requiredFields = ['name', 'id', 'description', 'author', 'authorLink', 'license', 'version'];
    for (const field of requiredFields) {
        if (!manifest[field]) {
            throw new Error(`Missing required manifest field: "${field}"`);
        }
    }

    return manifest;
}

async function getSourceScripts() {
    const entries = await fs.readdir(SRC_DIR, { withFileTypes: true });
    const scriptFiles = entries
        .filter((entry) => entry.isFile() && entry.name.endsWith('.js'))
        .map((entry) => entry.name)
        .sort((a, b) => a.localeCompare(b));

    const parts = await Promise.all(
        scriptFiles.map(async (fileName) => {
            const fullPath = path.join(SRC_DIR, fileName);
            const content = await fs.readFile(fullPath, 'utf8');
            return `// Source: ${fileName}\n${content.trim()}`;
        })
    );

    return parts.join('\n\n');
}

function buildOutput({ manifest, remoteUrl, concatenatedCode }) {
    const headerLines = [
        `// Name: ${manifest.name}`,
        `// ID: ${manifest.id}`,
        `// Description: ${manifest.description}`,
        `// By: ${manifest.author} <${manifest.authorLink}>`,
        `// License: ${manifest.license}`,
        '',
        '// This extension was created by the Mint tooling, a new',
        '// bundling toolchain for TurboWarp extensions. Do not',
        '// manually modify this file, go to:'
    ];

    if (remoteUrl) {
        headerLines.push(`// ${remoteUrl}`);
    }

    return `${headerLines.join('\n')}

(function (Scratch) {
    'use strict';

    class ${manifest.id} {
        getInfo() {
            return {
                id: '${manifest.id}',
                name: '${manifest.name}',
                blocks: [
                    // The script should identify where to insert
                    // the concatenated logic here or append it.
                ]
            };
        }
    }

${concatenatedCode
    .split('\n')
    .map((line) => `    ${line}`)
    .join('\n')}

    Scratch.extensions.register(new ${manifest.id}());
})(Scratch);
`;
}

async function main() {
    const manifest = await readManifest();
    const remoteUrl = await getOriginRemoteUrl();
    const concatenatedCode = await getSourceScripts();

    await fs.mkdir(DIST_DIR, { recursive: true });

    const output = buildOutput({ manifest, remoteUrl, concatenatedCode });
    const outputPath = path.join(DIST_DIR, `${manifest.id}.js`);
    await fs.writeFile(outputPath, output, 'utf8');
}

main().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
