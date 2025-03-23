
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Updated CORS configuration to allow credentials and proper origin
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Allow both localhost and 127.0.0.1
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());  // Parse incoming JSON requests

// Import Routes
const authRoutes = require('./routes/auth');
const campaignRoutes = require('./routes/campaigns');
const contactListRoutes = require('./routes/contactLists');
const greetingFileRoutes = require('./routes/greetingFiles');
const profileRoutes = require('./routes/profiles');
const sipProviderRoutes = require('./routes/sipProviders');
const subscriptionRoutes = require('./routes/subscriptions');
const transferNumberRoutes = require('./routes/transferNumbers');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/contact-lists', contactListRoutes);
app.use('/api/greeting-files', greetingFileRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/sip-providers', sipProviderRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/transfer-numbers', transferNumberRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Add a route to debug CORS issues
app.options('*', cors());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: err.message || 'Something went wrong on the server'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
