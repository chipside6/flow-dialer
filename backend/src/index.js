
// Import required packages
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Import route modules
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profiles');
const transferNumberRoutes = require('./routes/transferNumbers');
const sipProviderRoutes = require('./routes/sipProviders');
const greetingFileRoutes = require('./routes/greetingFiles');
const campaignRoutes = require('./routes/campaigns');
const contactListRoutes = require('./routes/contactLists');
const subscriptionRoutes = require('./routes/subscriptions');

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 3001; // Default port is 3001

// Middleware setup
app.use(cors()); // Enable Cross-Origin Resource Sharing (CORS)
app.use(express.json()); // Parse incoming JSON requests

// Use the route modules
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/transfer-numbers', transferNumberRoutes);
app.use('/api/sip-providers', sipProviderRoutes);
app.use('/api/greeting-files', greetingFileRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/contact-lists', contactListRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging
  res.status(500).json({
    error: true,
    message: err.message || 'Something went wrong on the server'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

