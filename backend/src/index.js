
const express = require('express');
const cors = require('cors');
const { pool } = require('./config/database');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/error');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is healthy' });
});

// Middleware to check database connection
app.use(async (req, res, next) => {
  try {
    await pool.query('SELECT 1');
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: true, message: 'Database connection failed' });
  }
});

// Import routes
const authRoutes = require('./routes/auth');
const profilesRoutes = require('./routes/profiles');
const campaignsRoutes = require('./routes/campaigns');
const contactListsRoutes = require('./routes/contactLists');
const greetingFilesRoutes = require('./routes/greetingFiles');
const transferNumbersRoutes = require('./routes/transferNumbers');
const sipProvidersRoutes = require('./routes/sipProviders');
const subscriptionsRoutes = require('./routes/subscriptions');
const configsRoutes = require('./routes/configs/index');

// Use authentication middleware (example, apply to specific routes)
// app.use('/api/profiles', authMiddleware);

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/campaigns', campaignsRoutes);
app.use('/api/contact-lists', contactListsRoutes);
app.use('/api/greeting-files', greetingFilesRoutes);
app.use('/api/transfer-numbers', transferNumbersRoutes);
app.use('/api/sip-providers', sipProvidersRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/configs', configsRoutes);

// Error handling middleware
app.use(errorHandler);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
