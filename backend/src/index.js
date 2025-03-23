
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profiles');
const transferNumberRoutes = require('./routes/transferNumbers');
const sipProviderRoutes = require('./routes/sipProviders');
const greetingFileRoutes = require('./routes/greetingFiles');
const campaignRoutes = require('./routes/campaigns');
const contactListRoutes = require('./routes/contactLists');
const subscriptionRoutes = require('./routes/subscriptions');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
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
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: err.message || 'Something went wrong on the server'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
