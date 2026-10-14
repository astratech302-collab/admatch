#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log('Usage: node scripts/run-local.mjs [--setup-only] [--port 3000]\nInstalls locked dependencies and starts AdMatch on loopback. No API keys needed.');
  process.exit(0);
}
let setupOnly = false;
let port = '3000';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--setup-only') setupOnly = true;
  else if (args[i] === '--port') port = args[++i] || '';
  else { console.error(`Unknown option: ${args[i]}. Use --help.`); process.exit(1); }
}
if (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535) {
  console.error('Port must be an integer between 1 and 65535.');
  process.exit(1);
}
const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 22 || (major === 22 && minor < 13)) {
  console.error('AdMatch requires Node.js 22.13 or newer. Install Node.js 24 LTS, then rerun this script.');
  process.exit(1);
}
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const options = { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' };
console.log('Installing AdMatch dependencies from package-lock.json…');
const install = spawnSync(npm, ['ci'], options);
if (install.error) { console.error(`Could not run npm: ${install.error.message}`); process.exit(1); }
if (install.status !== 0) process.exit(install.status || 1);
if (setupOnly) { console.log('Setup complete. Run node scripts/run-local.mjs to start the demo.'); process.exit(0); }
console.log(`Starting AdMatch at http://127.0.0.1:${port}. SQLite data persists in data/admatch.sqlite.\nUse Reset database in the app to restore sample data. Press Ctrl+C to stop.`);
const server = spawn(npm, ['run', 'dev', '--', '--port', port], options);
server.on('error', error => { console.error(error.message); process.exit(1); });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.kill(signal));
server.on('exit', (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
