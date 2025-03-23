
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import Routes
const authRoutes = require('./routes/auth');
const campaignRoutes = require('./routes/campaigns');
const subscriptionRoutes = require('./routes/subscriptions');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());  // Parse incoming JSON requests

// Routes
app.use('/api/auth', authRoutes);  // Auth Routes
app.use('/api/campaigns', campaignRoutes);  // Campaign Routes
app.use('/api/subscriptions', subscriptionRoutes);  // Subscription Routes

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

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

