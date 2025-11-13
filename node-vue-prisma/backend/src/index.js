require('dotenv').config();
const express = require('express');
const prisma = require('./prismaClient');
const cors = require('cors');
const { sendContactMail } = require('./mailer');

const app = express();
// Allow requests from the Vite dev server during development
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'] }));
app.use(express.json());

// Basic health check for the API
app.get('/api/', (req, res) => {
  res.send({ status: 'ok', message: 'Backend Node + Prisma' });
});

app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.post('/api/users', async (req, res) => {
  const { email, name } = req.body;
  try {
    const user = await prisma.user.create({ data: { email, name } });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Contact form endpoint for Vue frontend
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body || {};
  if (!email || !message) {
    return res.status(400).json({ error: 'Email and message are required.' });
  }

  try {
    const result = await sendContactMail({ name: name || '', email, message });
    const response = { ok: true, message: 'Message envoyé.' };
    if (result && result.previewUrl) response.previewUrl = result.previewUrl;
    return res.json(response);
  } catch (err) {
    console.error('Error sending contact mail:', err);
    return res.status(500).json({ error: 'Erreur lors de l envoi du message.' });
  }
});

// Export the app so it can be mounted by an outer server (production)
module.exports = app;

// If this file is executed directly, listen on the port (development)
if (require.main === module) {
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}
