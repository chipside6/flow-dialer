
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

// Import routes
const campaignsRouter = require('./campaigns');
const contactListsRouter = require('./contactLists');
const subscriptionsRouter = require('./subscriptions');

// Middleware for parsing JSON
app.use(express.json());

// Use routes
app.use('/api/campaigns', campaignsRouter);
app.use('/api/contact-lists', contactListsRouter);
app.use('/api/subscriptions', subscriptionsRouter);

// Root route to check if the server is running
app.get('/', (req, res) => {
  res.send('Server is up and running');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
