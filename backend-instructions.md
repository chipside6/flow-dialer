
# Custom Backend Implementation Guide

This application has been completely migrated from Supabase to use a custom MySQL database backend. This document provides instructions for implementing the required backend services.

## Backend Setup

You'll need to create a backend server that supports the following features:

1. User authentication (signup, login, logout)
2. User profile management
3. Transfer numbers CRUD operations
4. SIP providers management
5. Greeting files storage and management
6. Campaigns management
7. Contact lists and contacts management
8. Subscription and payment handling

## API URL Configuration

The API URL is configured in `src/services/authService.ts`:

```typescript
export const API_URL = 'http://localhost:3001/api';
```

Update this URL to match your backend server's address.

## Required API Endpoints

### Authentication

- **POST /api/auth/signup**
  - Creates a new user account
  - Request body: `{ email, password, metadata }`
  - Response format: Success message

- **POST /api/auth/login**
  - Authenticates a user
  - Request body: `{ email, password }`
  - Response format: `{ session: { user: { id, email }, expires_at } }`

- **POST /api/auth/logout**
  - Logs out a user
  - Requires Authentication header
  - Response format: Success message

### User Profiles

- **GET /api/profiles/{userId}**
  - Returns a user's profile
  - Requires Authentication header
  - Response format: User profile object

- **PATCH /api/profiles/{userId}**
  - Updates a user's profile
  - Request body: Profile data
  - Requires Authentication header
  - Response format: Updated profile

- **POST /api/profiles/{userId}/affiliate**
  - Sets a user as an affiliate
  - Requires Authentication header
  - Response format: Success message

### Transfer Numbers

- **GET /api/transfer-numbers?userId={userId}**
  - Returns a list of all transfer numbers for a specific user
  - Requires Authentication header
  - Response format: Array of transfer number objects

- **POST /api/transfer-numbers**
  - Creates a new transfer number
  - Request body: `{ user_id, name, phone_number, description, call_count }`
  - Requires Authentication header
  - Response format: Created transfer number object

- **DELETE /api/transfer-numbers/{transferNumberId}?userId={userId}**
  - Deletes a specific transfer number
  - Requires Authentication header
  - Response format: Success boolean

### SIP Providers

- **GET /api/sip-providers?userId={userId}**
  - Returns a list of all SIP providers for a specific user
  - Requires Authentication header
  - Response format: Array of SIP provider objects

- **POST /api/sip-providers**
  - Creates a new SIP provider
  - Request body: `{ user_id, name, host, port, username, password, active }`
  - Requires Authentication header
  - Response format: Created SIP provider object

- **PUT /api/sip-providers/{providerId}**
  - Updates a SIP provider
  - Request body: Provider data
  - Requires Authentication header
  - Response format: Updated provider

- **DELETE /api/sip-providers/{providerId}?userId={userId}**
  - Deletes a specific SIP provider
  - Requires Authentication header
  - Response format: Success boolean

- **PATCH /api/sip-providers/{providerId}/status**
  - Toggles a SIP provider's status
  - Request body: `{ active, user_id }`
  - Requires Authentication header
  - Response format: Success boolean

### Greeting Files

- **GET /api/greeting-files?userId={userId}**
  - Returns a list of all greeting files for a specific user
  - Requires Authentication header
  - Response format: Array of greeting file objects

- **POST /api/greeting-files**
  - Uploads a new greeting file
  - Request body: FormData with `file` and `userId` fields
  - Requires Authentication header
  - Response format: Created greeting file object

### Campaigns

- **GET /api/campaigns?userId={userId}**
  - Returns a list of all campaigns for a specific user
  - Requires Authentication header
  - Response format: Array of campaign objects

- **POST /api/campaigns**
  - Creates a new campaign
  - Request body: Campaign data
  - Requires Authentication header
  - Response format: Created campaign object

- **GET /api/campaigns/call-count/{userId}**
  - Returns the total call count for a user
  - Requires Authentication header
  - Response format: `{ totalCalls: number }`

### Contact Lists

- **GET /api/contact-lists?userId={userId}**
  - Returns a list of all contact lists for a specific user
  - Requires Authentication header
  - Response format: Array of contact list objects

### Subscriptions

- **GET /api/subscriptions/{userId}**
  - Returns a user's active subscription
  - Requires Authentication header
  - Response format: Subscription object or 404 if none exists

- **POST /api/subscriptions**
  - Creates or updates a subscription
  - Request body: Subscription data
  - Requires Authentication header
  - Response format: Created subscription object

## Database Schema

Here's a suggested MySQL schema for your backend:

```sql
-- Users table
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Profiles table
CREATE TABLE profiles (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  is_affiliate BOOLEAN DEFAULT FALSE,
  company_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Transfer numbers table
CREATE TABLE transfer_numbers (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  description TEXT,
  call_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- SIP providers table
CREATE TABLE sip_providers (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  host VARCHAR(255) NOT NULL,
  port INT NOT NULL,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Greeting files table
CREATE TABLE greeting_files (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  duration_seconds INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Campaigns table
CREATE TABLE campaigns (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  greeting_file_url TEXT,
  greeting_file_name VARCHAR(255),
  transfer_number VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending',
  progress INT DEFAULT 0,
  total_calls INT DEFAULT 0,
  answered_calls INT DEFAULT 0,
  transferred_calls INT DEFAULT 0,
  failed_calls INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Contact lists table
CREATE TABLE contact_lists (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Contacts table
CREATE TABLE contacts (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Contact list items table
CREATE TABLE contact_list_items (
  id VARCHAR(36) PRIMARY KEY,
  contact_list_id VARCHAR(36) NOT NULL,
  contact_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contact_list_id) REFERENCES contact_lists(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  plan_id VARCHAR(50) NOT NULL,
  plan_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL,
  current_period_end TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Payments table
CREATE TABLE payments (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_details JSON,
  plan_id VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Authentication Implementation

For authentication, you can use JWT (JSON Web Tokens):

1. When a user signs up or logs in, generate a JWT token containing their user ID
2. Return this token to the client, which will store it in localStorage
3. For authenticated requests, include the token in the Authorization header
4. Verify the token on the backend for protected routes

## File Storage

For greeting files:

1. Set up file storage using a service like Amazon S3 or use local storage
2. Create endpoints to handle file uploads and retrieve file URLs
3. Store metadata about files in the database

## Backend Implementation Options

You can implement this backend using various technologies:

1. **Node.js/Express**: Simple REST API server with MySQL integration
2. **PHP/Laravel**: Robust PHP framework with built-in authentication
3. **Python/Django**: Full-featured Python web framework
4. **Spring Boot**: Java-based backend for enterprise applications
5. **ASP.NET Core**: Microsoft's framework for building APIs

## Security Considerations

1. Use HTTPS for all API communications
2. Implement proper password hashing using bcrypt or similar
3. Use prepared statements for all database queries to prevent SQL injection
4. Implement rate limiting for authentication endpoints
5. Validate all input data on the server-side
6. Implement proper error handling and logging
