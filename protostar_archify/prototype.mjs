import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('.', import.meta.url));
const lock = JSON.parse(await readFile(resolve(root, 'upstream.lock.json'), 'utf8'));
const upstream = process.env.ARCHIFY_ROOT || '/tmp/protostar-archify-v3.2.0';
const input = resolve(root, '../docs/protostar-pipeline.workflow.json');
const output = resolve(root, 'prototype.html');
const stylePath = resolve(root, 'neumorphism.css');

const revision = spawnSync('git', ['-C', upstream, 'rev-parse', 'HEAD'], { encoding: 'utf8' });
if (revision.status !== 0) throw new Error(`Cannot resolve Archify source at ${upstream}: ${revision.stderr.trim()}`);
if (revision.stdout.trim() !== lock.release.commit) {
  throw new Error(`Archify commit mismatch: expected ${lock.release.commit}, found ${revision.stdout.trim()}`);
}

const tempInput = resolve(root, '.prototype-input.json');
const sourceInput = JSON.parse(await readFile(input, 'utf8'));
sourceInput.meta.output = 'prototype.html';
await writeFile(tempInput, `${JSON.stringify(sourceInput, null, 2)}\n`);

const cli = resolve(upstream, 'archify/bin/archify.mjs');
const render = spawnSync(process.execPath, [cli, 'render', 'workflow', tempInput, output], {
  cwd: root,
  encoding: 'utf8',
  env: { ...process.env, ARCHIFY_UPDATE_CHECK_DISABLED: '1' },
});
if (render.status !== 0) throw new Error(`Archify render failed:\n${render.stderr || render.stdout}`);

// Resolve the public CSS-only entries without installing React in Archify.
const componentRequire = createRequire(resolve(root, '../protostar_components/package.json'));
const tokenEntries = ['theme-tokens.css', 'material-tokens.css'];
const sharedStyles = await Promise.all(tokenEntries.map((name) =>
  readFile(componentRequire.resolve(`@protostar/components/${name}`), 'utf8')));
// The exporter filters out :where() selectors. Restrict the conversion to the
// three documented token roots and fail closed if their contract changes.
const tokenRoots = [
  [':where(:root)', ':root'],
  [":where([data-theme='dark'])", "[data-theme='dark']"],
  [':where(:root, [data-theme])', ':root, [data-theme]'],
];
let tokens = sharedStyles.join('\n');
for (const [source, target] of tokenRoots) {
  if (!tokens.includes(source)) throw new Error(`Component token selector changed: ${source}`);
  tokens = tokens.replace(source, target);
}
if (tokens.includes(':where(')) throw new Error('Unsupported :where() selector in component token CSS');
const css = `${tokens}\n${await readFile(stylePath, 'utf8')}`;
let html = await readFile(output, 'utf8');
if (!/<svg\b[^>]*\bdata-node-ui(?:\s|=|>)/.test(html) || !/data-preset="classic"/.test(html)) {
  throw new Error('Rendered output is not the expected Archify classic workflow artifact');
}
if (html.includes('id="protostar-neumorphism"')) throw new Error('Prototype style is already present; refusing duplicate injection');
if (!html.includes('</head>')) throw new Error('Rendered HTML has no closing head element');
html = html.replace(/<html\b([^>]*)\bdata-theme="dark"/, '<html$1data-theme="light"');
html = html.replace('</head>', `  <style id="protostar-neumorphism">\n${css}\n  </style>\n</head>`);
await writeFile(output, html);
await import('node:fs/promises').then(({ unlink }) => unlink(tempInput));

const digest = createHash('sha256').update(html).digest('hex');
console.log(`Generated ${output}`);
console.log(`Archify ${lock.release.tag} (${revision.stdout.trim()})`);
console.log(`HTML SHA-256 ${digest}`);
console.log(`Embedded stylesheet bytes ${Buffer.byteLength(css)}`);
console.log(render.stdout.trim());
