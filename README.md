# CallerDesk Node API

A RESTful API server for CallerDesk, a cloud telephony solution that automates call management, member handling, and real-time event tracking through webhooks and APIs.

## Overview

CallerDesk API provides endpoints for managing agents (members), call groups, initiating calls (click-to-call), retrieving call reports, and handling webhooks for real-time notifications. It integrates with MongoDB for data persistence and uses Express.js for routing.

## Features

- **Agent Management**: Create, update, list, and delete agents.
- **Call Group Management**: Organize agents into groups for routing.
- **Call Operations**: Initiate click-to-call, reserve calls, and fetch call reports.
- **Dashboard Summaries**: Retrieve summary data for dashboards.
- **Webhook Integration**: Handle real-time notifications for calls and SMS.
- **Authentication**: Secure API access with auth codes.

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/sandeepkhewle/callDesk.git
   cd callDesk
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and configure the following variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/calldesk
   PORT=3001
   ```

4. Start the server:
   - Development: `npm run dev`
   - Production: `npm start`

The server will run on `http://localhost:3001` by default.

## Usage

All API requests require an auth code passed as a form-data parameter for POST requests or query parameter for GET requests. Ensure HTTPS is used for production.

### API Endpoints

#### Agents (`/agents`)
- `POST /agents/create` - Create a new agent
- `POST /agents/update` - Update an existing agent
- `POST /agents/list` - Get all agents
- `POST /agents/delete` - Delete an agent

#### Call Groups (`/callGroups`)
- `POST /callGroups/create` - Create a new call group
- `POST /callGroups/update` - Update an existing call group
- `POST /callGroups/list` - Get all call groups
- `POST /callGroups/delete` - Delete a call group

#### Calls (`/calls`)
- `GET /calls/clickToCall` - Initiate click-to-call
- `GET /calls/clickToCallViaCallGroup` - Click-to-call via call group
- `GET /calls/reserveClickToCall` - Reserve click-to-call
- `POST /calls/callReport` - Get call reports
- `POST /calls/ivrNumbersList` - Get IVR numbers list

#### Dashboard (`/dashboard`)
- `POST /dashboard/dashboardSummary` - Get dashboard summary

#### Webhooks (`/webhooks`)
- `POST /webhooks/calls` - Handle call webhooks
- `POST /webhooks/sms` - Handle SMS webhooks

### Integration Flow

1. **Setup Phase**: Add members and create call groups.
2. **Execution Phase**: Trigger calls using click-to-call endpoints.
3. **Data Retrieval Phase**: Receive webhooks or fetch call reports.

## Environment Variables

- `MONGODB_URI`: MongoDB connection string (default: `mongodb://localhost:27017/calldesk`)
- `PORT`: Server port (default: `3001`)

## Dependencies

- Express.js: Web framework
- Mongoose: MongoDB ODM
- Axios: HTTP client
- Multer: File upload handling
- Dotenv: Environment variable management

## License

ISC
