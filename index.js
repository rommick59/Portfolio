const path = require('path');
const express = require('express');
require('dotenv').config();

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
