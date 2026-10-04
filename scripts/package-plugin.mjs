// Generate the plugin skill from the standalone source; do not edit skills/ by hand.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'plugin.json'), 'utf8'));
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(manifest.name)) throw new Error('Invalid plugin name');
const target = path.join(root, 'skills', manifest.name);
const expected = new Map();
const excluded = new Set(['node_modules', '__pycache__', '.DS_Store', 'package-plugin.mjs']);
const textExtensions = new Set(['.md', '.js', '.cjs', '.mjs', '.json', '.py', '.sh', '.ps1', '.yaml', '.yml']);

function collect(relative) {
  const source = path.join(root, relative);
  if (!fs.existsSync(source)) return;
  const stat = fs.lstatSync(source);
  if (stat.isSymbolicLink()) throw new Error('Source symlink must be resolved explicitly: ' + relative);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(source).sort()) {
      if (!excluded.has(entry)) collect(path.join(relative, entry));
    }
  } else if (stat.isFile()) {
    let bytes = fs.readFileSync(source);
    if (textExtensions.has(path.extname(source))) bytes = Buffer.from(bytes.toString('utf8').replace(/\r\n/g, '\n'));
    expected.set(relative, bytes);
  }
}
for (const relative of ['SKILL.md', 'references', 'scripts', 'assets', 'templates', 'agents', 'capture.js']) collect(relative);
const sourceSkill = expected.get('SKILL.md').toString('utf8');
if (!new RegExp('^name: ' + manifest.name + '\\s*$', 'm').test(sourceSkill)) throw new Error('Skill and plugin names differ');
const claudePath = path.join(root, '.claude-plugin', 'plugin.json');
const claude = { ...manifest };
delete claude.$schema;
claude.skills = './skills/';
const claudeBytes = Buffer.from(JSON.stringify(claude, null, 2) + '\n');
const issues = [];
function sync(destination, bytes) {
  if (fs.existsSync(destination) && fs.readFileSync(destination).equals(bytes)) return;
  if (check) { issues.push('Out of date: ' + path.relative(root, destination)); return; }
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, bytes);
}
for (const [relative, bytes] of expected) sync(path.join(target, relative), bytes);
sync(claudePath, claudeBytes);
function inspect(directory, prefix = '') {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory)) {
    const relative = path.join(prefix, entry);
    const absolute = path.join(directory, entry);
    const stat = fs.lstatSync(absolute);
    if (stat.isSymbolicLink()) issues.push('Unexpected generated symlink: ' + relative);
    else if (stat.isDirectory()) {
      if (!excluded.has(entry)) inspect(absolute, relative);
    } else if (!expected.has(relative)) issues.push('Stale generated file (remove explicitly): skills/' + manifest.name + '/' + relative);
  }
}
inspect(target);
if (issues.length) throw new Error(issues.join('\n'));
console.log(manifest.name + ': ' + expected.size + ' skill files ' + (check ? 'verified' : 'generated'));
