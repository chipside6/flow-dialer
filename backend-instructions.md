
# Transfer Numbers Backend Setup

This application is now configured to work with a custom backend server instead of Supabase. 
You'll need to create a simple API server that provides the following endpoints:

## Required Endpoints

1. **GET /api/transfer-numbers?userId={userId}**
   - Returns a list of all transfer numbers for a specific user
   - Response format: Array of transfer number objects

2. **POST /api/transfer-numbers**
   - Creates a new transfer number
   - Request body: `{ user_id, name, phone_number, description, call_count }`
   - Response format: Created transfer number object

3. **DELETE /api/transfer-numbers/{transferNumberId}?userId={userId}**
   - Deletes a specific transfer number
   - Response format: Success boolean

## Backend Implementation Options

You can implement this backend using various technologies:

1. **Node.js/Express**: Simple REST API server
2. **Firebase Functions**: Serverless backend
3. **Python/Flask**: Lightweight Python backend
4. **C#/.NET**: Robust backend with Entity Framework
5. **PHP/Laravel**: PHP-based backend solution

## Configuration

The API URL is currently set to `http://localhost:3001/api` in the `customBackendService.ts` file. 
Update this URL to match your backend server's address.

```typescript
// In src/services/customBackendService.ts
const API_URL = 'http://localhost:3001/api'; // Change this to your actual backend URL
```

## Data Structure

Your backend should store transfer numbers with at least these fields:
- id
- user_id
- name
- phone_number
- description
- call_count
- created_at
