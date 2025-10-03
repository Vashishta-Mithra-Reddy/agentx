# AgentX API Documentation

Complete API reference for the AgentX Task Distribution System.

## Table of Contents

- [Authentication](#authentication)
- [Base URL](#base-url)
- [Common Headers](#common-headers)
- [Authentication Endpoints](#authentication-endpoints)
- [Task Endpoints](#task-endpoints)
- [Dashboard Endpoints](#dashboard-endpoints)
- [Error Responses](#error-responses)
- [Status Codes](#status-codes)

## Base URL

```
http://localhost:5000/api
```

For production, replace with your deployed domain.

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Tokens are stored in httpOnly cookies for security.

### Token Types

- **Access Token**: Short-lived (15 minutes), used for API requests
- **Refresh Token**: Long-lived (7 days), used to obtain new access tokens

### Authentication Flow

1. Login via `/api/auth/login` → Receive tokens in cookies
2. Make authenticated requests with cookies
3. When access token expires, use `/api/auth/refresh` with refresh token
4. Logout via `/api/auth/logout` to clear tokens

## Common Headers

### Required for All Requests
```http
Content-Type: application/json
```

### Required for Authenticated Requests
Cookies are automatically sent by the browser:
```http
Cookie: accessToken=<your_access_token>
```

### File Upload Requests
```http
Content-Type: multipart/form-data
```

---

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Authentication:** Not required

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "mobileNumber": "1234567890",
  "countryCode": "+1"
}
```

**Field Validation:**
- `name`: Required, string
- `email`: Required, string, unique, valid email format
- `password`: Required, string, minimum 6 characters recommended
- `mobileNumber`: Required, string
- `countryCode`: Required, string (e.g., "+1", "+91")

**Success Response (201 Created):**
```json
{
  "message": "User registered successfully"
}
```

**Error Responses:**
```json
// 400 Bad Request - Duplicate email
{
  "error": "E11000 duplicate key error collection: agentx.users index: email_1 dup key: { email: \"john.doe@example.com\" }"
}

// 400 Bad Request - Missing fields
{
  "error": "User validation failed: email: Path `email` is required."
}
```

**Notes:**
- New users are created with `active: false` by default
- User role defaults to "agent"
- Password is automatically hashed before storage

---

### Login

Authenticate and receive JWT tokens.

**Endpoint:** `POST /api/auth/login`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Logged in successfully",
  "role": "agent"
}
```

**Response Headers:**
```http
Set-Cookie: accessToken=<jwt_token>; HttpOnly; Path=/; SameSite=Strict
Set-Cookie: refreshToken=<jwt_token>; HttpOnly; Path=/; SameSite=Strict
```

**Error Responses:**
```json
// 400 Bad Request - Invalid credentials
{
  "message": "Invalid credentials"
}

// 500 Internal Server Error
{
  "error": "Server error message"
}
```

---

### Refresh Token

Obtain new access and refresh tokens using a valid refresh token.

**Endpoint:** `POST /api/auth/refresh`

**Authentication:** Not required (uses refresh token from body)

**Request Body:**
```json
{
  "token": "<refresh_token>"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Token refreshed successfully",
  "role": "agent"
}
```

**Response Headers:**
```http
Set-Cookie: accessToken=<new_jwt_token>; HttpOnly; Path=/; SameSite=Strict
Set-Cookie: refreshToken=<new_jwt_token>; HttpOnly; Path=/; SameSite=Strict
```

**Error Responses:**
```json
// 401 Unauthorized - No token provided
{
  "message": "No token provided"
}

// 401 Unauthorized - Invalid user
{
  "message": "Invalid token"
}

// 403 Forbidden - Token verification failed
{
  "message": "Invalid or expired refresh token"
}
```

---

### Verify Token

Verify the current access token and get user information.

**Endpoint:** `GET /api/auth/verify`

**Authentication:** Required (accessToken cookie)

**Request Headers:**
```http
Cookie: accessToken=<your_access_token>
```

**Success Response (200 OK):**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "role": "agent"
  }
}
```

**Error Responses:**
```json
// 401 Unauthorized - No token
{
  "message": "No access token provided"
}

// 401 Unauthorized - User not found
{
  "message": "Invalid token"
}

// 403 Forbidden - Invalid/expired token
{
  "message": "Invalid or expired access token"
}
```

---

### Logout

Clear authentication tokens and logout user.

**Endpoint:** `POST /api/auth/logout`

**Authentication:** Recommended but not enforced

**Success Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

**Response Headers:**
```http
Set-Cookie: accessToken=; Max-Age=0
Set-Cookie: refreshToken=; Max-Age=0
```

---

### Add Agent

Create a new agent account (active by default).

**Endpoint:** `POST /api/auth/add-agent`

**Authentication:** Not currently enforced (should be admin-only in production)

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "password": "SecurePassword123!",
  "mobileNumber": "9876543210",
  "countryCode": "+1"
}
```

**Success Response (201 Created):**
```json
{
  "message": "Agent added successfully"
}
```

**Error Responses:**
```json
// 400 Bad Request
{
  "error": "Error message describing the issue"
}
```

**Notes:**
- Created user has `role: "agent"` and `active: true`
- Should be protected with admin authorization in production

---

## Task Endpoints

### Upload Tasks

Upload a CSV or Excel file containing tasks to be distributed among active agents.

**Endpoint:** `POST /api/tasks/upload`

**Authentication:** Required

**Request:**
```http
POST /api/tasks/upload
Content-Type: multipart/form-data
Cookie: accessToken=<your_access_token>

file: <CSV/XLS/XLSX file>
```

**File Format Requirements:**

**Required Columns:**
- `FirstName` - Contact's first name
- `Phone` - Contact's phone number
- `Notes` - Task description or notes

**Supported Formats:**
- CSV (`.csv`)
- Excel 97-2003 (`.xls`)
- Excel 2007+ (`.xlsx`)

**Example CSV:**
```csv
FirstName,Phone,Notes
John Doe,1234567890,Follow up on product inquiry
Jane Smith,0987654321,Schedule demo call
Bob Johnson,5555555555,Technical support request
```

**Example Excel:**
| FirstName | Phone | Notes |
|-----------|-------|-------|
| John Doe | 1234567890 | Follow up on product inquiry |
| Jane Smith | 0987654321 | Schedule demo call |
| Bob Johnson | 5555555555 | Technical support request |

**Success Response (200 OK):**
```json
{
  "message": "Tasks distributed successfully",
  "savedDistributedTasks": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "agentId": "507f191e810c19729de860ea",
      "tasks": [
        "507f1f77bcf86cd799439012",
        "507f1f77bcf86cd799439013"
      ],
      "uploadDate": "2024-01-15T10:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439014",
      "agentId": "507f191e810c19729de860eb",
      "tasks": [
        "507f1f77bcf86cd799439015"
      ],
      "uploadDate": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Error Responses:**
```json
// 400 Bad Request - No file
{
  "message": "No file uploaded"
}

// 400 Bad Request - Invalid file type
{
  "message": "Only CSV, XLS, XLSX files are allowed"
}

// 400 Bad Request - Empty file
{
  "message": "File is empty or invalid"
}

// 400 Bad Request - Missing required columns
{
  "message": "Invalid format. Required columns: FirstName, Phone, Notes"
}

// 400 Bad Request - No active agents
{
  "message": "No agents available to distribute tasks"
}

// 401 Unauthorized
{
  "message": "Not authorized, no token"
}

// 500 Internal Server Error
{
  "message": "Error processing file",
  "error": "Detailed error message"
}
```

**Distribution Logic:**
- Tasks are distributed equally among all active agents
- If tasks don't divide evenly, remaining tasks are distributed round-robin
- Each agent receives at most one more task than the agent with the fewest

---

### Get Agent Tasks

Retrieve all tasks assigned to the authenticated agent.

**Endpoint:** `GET /api/tasks/agent-tasks`

**Authentication:** Required

**Request Headers:**
```http
Cookie: accessToken=<your_access_token>
```

**Success Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "agentId": "507f191e810c19729de860ea",
    "tasks": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "firstName": "John Doe",
        "phone": "1234567890",
        "notes": "Follow up on product inquiry",
        "completed": false
      },
      {
        "_id": "507f1f77bcf86cd799439013",
        "firstName": "Jane Smith",
        "phone": "0987654321",
        "notes": "Schedule demo call",
        "completed": true
      }
    ],
    "uploadDate": "2024-01-15T10:30:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439014",
    "agentId": "507f191e810c19729de860ea",
    "tasks": [
      {
        "_id": "507f1f77bcf86cd799439015",
        "firstName": "Bob Johnson",
        "phone": "5555555555",
        "notes": "Technical support request",
        "completed": false
      }
    ],
    "uploadDate": "2024-01-14T09:15:00.000Z"
  }
]
```

**Response Notes:**
- Returns all task batches assigned to the agent
- Sorted by `uploadDate` in descending order (newest first)
- Tasks are populated with full task details
- Empty array if no tasks assigned

**Error Responses:**
```json
// 401 Unauthorized
{
  "message": "Not authorized, no token"
}

// 500 Internal Server Error
{
  "message": "Error fetching agent tasks",
  "error": "Detailed error message"
}
```

---

### Update Task Status

Update the completion status of a specific task.

**Endpoint:** `PUT /api/tasks/agent-tasks/:id/status`

**Authentication:** Required

**URL Parameters:**
- `id` - Task ID (MongoDB ObjectId)

**Request Headers:**
```http
Content-Type: application/json
Cookie: accessToken=<your_access_token>
```

**Request Body:**
```json
{
  "completed": true
}
```

**Success Response (200 OK):**
```json
{
  "message": "Task updated successfully",
  "task": {
    "_id": "507f1f77bcf86cd799439012",
    "firstName": "John Doe",
    "phone": "1234567890",
    "notes": "Follow up on product inquiry",
    "completed": true
  }
}
```

**Error Responses:**
```json
// 401 Unauthorized
{
  "message": "Not authorized, no token"
}

// 403 Forbidden - Task not assigned to this agent
{
  "message": "Task not found or not assigned to this agent"
}

// 404 Not Found
{
  "message": "Task not found"
}

// 500 Internal Server Error
{
  "message": "Error updating task status",
  "error": "Detailed error message"
}
```

**Notes:**
- Only the assigned agent can update their tasks
- Task ownership is verified before update
- Both `completed: true` and `completed: false` are valid

---

## Dashboard Endpoints

### Get Dashboard

Get user dashboard information.

**Endpoint:** `GET /api/dashboard`

**Authentication:** Required

**Request Headers:**
```http
Cookie: accessToken=<your_access_token>
```

**Success Response (200 OK):**
```json
{
  "message": "Welcome to your dashboard",
  "user": {
    "_id": "507f191e810c19729de860ea",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "agent",
    "mobileNumber": "1234567890",
    "countryCode": "+1",
    "active": true
  },
  "role": "agent"
}
```

**Error Responses:**
```json
// 401 Unauthorized
{
  "message": "Not authorized, no token"
}

// 404 Not Found
{
  "message": "User not found"
}

// 500 Internal Server Error
{
  "message": "Server error"
}
```

**Notes:**
- Password field is excluded from response
- Returns complete user profile information

---

## Error Responses

All error responses follow a consistent format:

```json
{
  "message": "Human-readable error message",
  "error": "Detailed error (optional, typically in development)"
}
```

### Common Error Scenarios

**Authentication Errors:**
```json
// Missing Token
{
  "message": "Not authorized, no token"
}

// Invalid Token
{
  "message": "Not authorized, token failed"
}

// Expired Token
{
  "message": "Invalid or expired access token"
}
```

**Validation Errors:**
```json
// Missing Required Field
{
  "error": "User validation failed: email: Path `email` is required."
}

// Invalid Format
{
  "message": "Invalid format. Required columns: FirstName, Phone, Notes"
}
```

**Resource Errors:**
```json
// Not Found
{
  "message": "User not found"
}

// Forbidden
{
  "message": "Task not found or not assigned to this agent"
}
```

---

## Status Codes

The API uses standard HTTP status codes:

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PUT, POST requests |
| 201 | Created | Successful resource creation |
| 400 | Bad Request | Validation errors, malformed requests |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Valid auth but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Server-side errors |

---

## Rate Limiting

**Note:** Rate limiting is not currently implemented but recommended for production.

Suggested limits:
- Authentication endpoints: 5 requests per minute per IP
- File upload: 10 requests per hour per user
- General API: 100 requests per minute per user

---

## CORS Policy

The API accepts requests from:
- `http://localhost:3000` (development)
- Production domain (configure via environment variables)

**Credentials:** Enabled (required for cookie-based authentication)

---

## Testing the API

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "mobileNumber": "1234567890",
    "countryCode": "+1"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

**Get Tasks:**
```bash
curl http://localhost:5000/api/tasks/agent-tasks \
  -b cookies.txt
```

**Upload File:**
```bash
curl -X POST http://localhost:5000/api/tasks/upload \
  -b cookies.txt \
  -F "file=@tasks.csv"
```

### Using Postman

1. Import the endpoints from this documentation
2. Use "Cookies" tab to manage authentication cookies
3. For file upload, use "Body" → "form-data" → select "file" type

---

## Changelog

### Version 1.0.0
- Initial API release
- Authentication with JWT
- Task upload and distribution
- Agent task management
- Task status updates

---

## Support

For API issues or questions:
- GitHub Issues: [Create an issue](https://github.com/Vashishta-Mithra-Reddy/agentx/issues)
- Email: your-email@example.com
