require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const bookingRoutes = require('./routes/bookings');
const borrowRequestRoutes = require('./routes/borrowRequests');
const readingListRoutes = require('./routes/readingList');
const spaceRoutes = require('./routes/spaces');
const { errorHandler } = require('./utils/http');

const requiredEnvironment = ['MONGODB_URI', 'JWT_SECRET'];
for (const name of requiredEnvironment) {
  if (!process.env[name]) {
    throw new Error(`${name} must be set before the catalog API can start.`);
  }
}
if (process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must contain at least 32 characters.');
}

const app = express();
const allowedOrigins = new Set(
  (process.env.FRONTEND_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origin ${origin} is not allowed by CORS.`));
  },
}));
app.use(express.json({ limit: '100kb' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/borrow-requests', borrowRequestRoutes);
app.use('/api/reading-list', readingListRoutes);
app.use('/api/spaces', spaceRoutes);
app.use((req, res) => res.status(404).json({ error: 'Route not found.' }));
app.use(errorHandler);

async function start() {
  await mongoose.connect(process.env.MONGODB_URI);
  const port = Number(process.env.PORT || 4000);
  app.listen(port, () => {
    console.log(`Library catalog API listening on port ${port}.`);
  });
}

if (require.main === module) {
  start().catch((error) => {
    console.error('Library catalog API failed to start:', error.message);
    process.exitCode = 1;
  });
}

module.exports = app;
