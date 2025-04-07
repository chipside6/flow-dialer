const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const campaignRoutes = require('./routes/campaigns');
const sipProvidersRoutes = require('./routes/sipProviders');
const contactListsRoutes = require('./routes/contactLists');
const transferNumbersRoutes = require('./routes/transferNumbers');
const greetingFilesRoutes = require('./routes/greetingFiles');
const profilesRoutes = require('./routes/profiles');
const subscriptionsRoutes = require('./routes/subscriptions');
const configsRoutes = require('./routes/configs');
const databaseRoutes = require('./routes/database');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Register routes
app.use('/auth', authRoutes);
app.use('/campaigns', campaignRoutes);
app.use('/sip-providers', sipProvidersRoutes);
app.use('/contact-lists', contactListsRoutes);
app.use('/transfer-numbers', transferNumbersRoutes);
app.use('/greeting-files', greetingFilesRoutes);
app.use('/profiles', profilesRoutes);
app.use('/subscriptions', subscriptionsRoutes);
app.use('/configs', configsRoutes);
app.use('/database', databaseRoutes); // Add this line to include database utilities

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
