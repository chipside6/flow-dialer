
# Call Router Backend API

This is the backend API for the Call Router application.

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your MySQL database:
   - Create a database with the schema outlined in `schema.sql`
   - Update `.env` with your database credentials

3. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

The backend implements the following API endpoints:

### Authentication
- `POST /api/auth/signup` - Create a new user account
- `POST /api/auth/login` - Authenticate a user
- `POST /api/auth/logout` - Log out a user

### User Profiles
- `GET /api/profiles/{userId}` - Get a user's profile
- `PATCH /api/profiles/{userId}` - Update a user's profile
- `POST /api/profiles/{userId}/affiliate` - Set a user as an affiliate

### Transfer Numbers
- `GET /api/transfer-numbers?userId={userId}` - Get all transfer numbers for a user
- `POST /api/transfer-numbers` - Create a new transfer number
- `DELETE /api/transfer-numbers/{transferNumberId}?userId={userId}` - Delete a transfer number

### SIP Providers
- `GET /api/sip-providers?userId={userId}` - Get all SIP providers for a user
- `POST /api/sip-providers` - Create a new SIP provider
- `PUT /api/sip-providers/{providerId}` - Update a SIP provider
- `DELETE /api/sip-providers/{providerId}?userId={userId}` - Delete a SIP provider
- `PATCH /api/sip-providers/{providerId}/status` - Toggle a SIP provider's status

### Greeting Files
- `GET /api/greeting-files?userId={userId}` - Get all greeting files for a user
- `POST /api/greeting-files` - Upload a new greeting file

### Campaigns
- `GET /api/campaigns?userId={userId}` - Get all campaigns for a user
- `POST /api/campaigns` - Create a new campaign
- `GET /api/campaigns/call-count/{userId}` - Get total call count for a user

### Contact Lists
- `GET /api/contact-lists?userId={userId}` - Get all contact lists for a user

### Subscriptions
- `GET /api/subscriptions/{userId}` - Get a user's active subscription
- `POST /api/subscriptions` - Create or update a subscription
