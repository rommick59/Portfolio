const path = require('path');
const express = require('express');
require('dotenv').config();
const fs = require('fs');
const { spawnSync } = require('child_process');

// Helper: run a shell command synchronously and stream output
function runCommand(command, args, cwd) {
  console.log(`\n> Running: ${command} ${args ? args.join(' ') : ''} (cwd: ${cwd})`);
  const res = spawnSync(command, args, { cwd, stdio: 'inherit', shell: true });
  if (res.error) throw res.error;
  if (res.status !== 0) throw new Error(`${command} ${args ? args.join(' ') : ''} exited with code ${res.status}`);
}

// Auto-setup: install backend/frontend deps and build frontend when needed
try {
  const force = process.env.FORCE_SETUP === 'true' || process.argv.includes('--setup');
  const frontendDist = path.join(__dirname, 'node-vue-prisma', 'frontend', 'dist');
  const backendNodeModules = path.join(__dirname, 'node-vue-prisma', 'backend', 'node_modules');
  const frontendNodeModules = path.join(__dirname, 'node-vue-prisma', 'frontend', 'node_modules');

  const needSetup = force
    || !fs.existsSync(frontendDist)
    || !fs.existsSync(backendNodeModules)
    || !fs.existsSync(frontendNodeModules);

  if (needSetup) {
    console.log('Detected missing build/dependencies or --setup flag; running setup...');

    // Install backend deps
    try {
      runCommand('npm', ['install'], path.join(__dirname, 'node-vue-prisma', 'backend'));
    } catch (err) {
      console.error('Failed to install backend dependencies:', err.message);
    }

    // Install frontend deps
    try {
      runCommand('npm', ['install'], path.join(__dirname, 'node-vue-prisma', 'frontend'));
    } catch (err) {
      console.error('Failed to install frontend dependencies:', err.message);
    }

    // Build frontend
    try {
      runCommand('npm', ['run', 'build'], path.join(__dirname, 'node-vue-prisma', 'frontend'));
    } catch (err) {
      console.error('Failed to build frontend:', err.message);
    }
  }
} catch (err) {
  console.error('Auto-setup error (continuing):', err && err.message ? err.message : err);
}

// Import the backend app (express) from backend/src/index.js
const backendApp = require('./node-vue-prisma/backend/src/index.js');

const app = express();

// Serve static frontend files from frontend/dist
const distPath = path.join(__dirname, 'node-vue-prisma', 'frontend', 'dist');
app.use(express.static(distPath));

// Mount backend API under /api (the backend app already defines /api routes)
app.use('/', backendApp);

// Fallback to index.html for SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Fullstack app running at http://localhost:${port}`);
});
