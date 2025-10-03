"# AgentX - Task Distribution & Management System

AgentX is a comprehensive task distribution and management system designed to efficiently distribute tasks among multiple agents. The system enables administrators to upload tasks via CSV/Excel files and automatically distributes them among active agents using an intelligent round-robin algorithm.

## 🌟 Features

- **User Authentication & Authorization**
  - JWT-based authentication with access and refresh tokens
  - Role-based access control (Admin/Agent)
  - Secure password hashing with bcrypt
  - Cookie-based token management

- **Task Management**
  - Bulk task upload via CSV, XLS, and XLSX files
  - Automatic task distribution among active agents
  - Equal distribution with round-robin for remainder tasks
  - Task status tracking (completed/pending)
  - Agent-specific task retrieval

- **Agent Management**
  - Agent registration and activation
  - Mobile number verification with country code support
  - Active/inactive agent status management

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Node.js with Express.js
- TypeScript for type safety
- MongoDB with Mongoose ODM
- JWT for authentication
- Multer for file uploads
- CSV-parser and XLSX for file processing

**Database:**
- MongoDB (NoSQL database)

### Project Structure

```
agentx/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   │   ├── authController.ts
│   │   │   └── taskController.ts
│   │   ├── middleware/        # Custom middleware
│   │   │   └── auth.ts
│   │   ├── models/            # Database models
│   │   │   ├── User.ts
│   │   │   └── Task.ts
│   │   ├── routes/            # API routes
│   │   │   ├── authRoutes.ts
│   │   │   └── taskRoutes.ts
│   │   └── index.ts           # Application entry point
│   ├── package.json
│   └── tsconfig.json
└── frontend/                  # (To be implemented)
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (v4.4 or higher)
  - Local installation OR
  - MongoDB Atlas account (cloud)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Vashishta-Mithra-Reddy/agentx.git
cd agentx
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Environment Configuration

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Configure the following environment variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/agentx
# For MongoDB Atlas:
# MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/agentx?retryWrites=true&w=majority

# JWT Secrets (Change these in production!)
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here
```

### 4. Start the Backend Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT).

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "mobileNumber": "1234567890",
  "countryCode": "+1"
}
```

**Response:**
```json
{
  "message": "User registered successfully"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "message": "Logged in successfully",
  "role": "agent"
}
```
*Sets httpOnly cookies: `accessToken` (15m) and `refreshToken` (7d)*

#### Verify Token
```http
GET /api/auth/verify
Cookie: accessToken=<token>
```

**Response:**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "role": "agent"
  }
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "token": "<refresh_token>"
}
```

#### Logout
```http
POST /api/auth/logout
Cookie: accessToken=<token>
```

#### Add Agent (Admin)
```http
POST /api/auth/add-agent
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "securePassword123",
  "mobileNumber": "9876543210",
  "countryCode": "+1"
}
```

### Task Endpoints

All task endpoints require authentication (accessToken cookie).

#### Upload Tasks
```http
POST /api/tasks/upload
Content-Type: multipart/form-data
Cookie: accessToken=<token>

file: <CSV/XLS/XLSX file>
```

**CSV/Excel Format Requirements:**
- Required columns: `FirstName`, `Phone`, `Notes`
- Supported formats: `.csv`, `.xls`, `.xlsx`

**Example CSV:**
```csv
FirstName,Phone,Notes
John Doe,1234567890,Follow up on product inquiry
Jane Smith,9876543210,Schedule demo call
```

**Response:**
```json
{
  "message": "Tasks distributed successfully",
  "savedDistributedTasks": [...]
}
```

#### Get Agent Tasks
```http
GET /api/tasks/agent-tasks
Cookie: accessToken=<token>
```

**Response:**
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
      }
    ],
    "uploadDate": "2024-01-15T10:30:00.000Z"
  }
]
```

#### Update Task Status
```http
PUT /api/tasks/agent-tasks/:id/status
Content-Type: application/json
Cookie: accessToken=<token>

{
  "completed": true
}
```

**Response:**
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

### Dashboard
```http
GET /api/dashboard
Cookie: accessToken=<token>
```

**Response:**
```json
{
  "message": "Welcome to your dashboard",
  "user": {
    "_id": "507f191e810c19729de860ea",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "agent",
    "mobileNumber": "1234567890",
    "countryCode": "+1",
    "active": true
  },
  "role": "agent"
}
```

## 🗃️ Database Schema

### User Collection
```typescript
{
  name: string;           // User's full name
  email: string;          // Unique email address
  password: string;       // Bcrypt hashed password
  role: string;           // 'agent' (default) or 'admin'
  mobileNumber: string;   // Contact number
  countryCode: string;    // Country code (e.g., '+1')
  active: boolean;        // Activation status (default: false)
}
```

### Task Collection
```typescript
{
  firstName: string;      // Contact's first name
  phone: string;          // Contact's phone number
  notes: string;          // Task notes/description
  completed: boolean;     // Task completion status (default: false)
}
```

### DistributedTask Collection
```typescript
{
  agentId: ObjectId;      // Reference to User (agent)
  tasks: ObjectId[];      // Array of Task references
  uploadDate: Date;       // Task distribution timestamp (default: now)
}
```

## 🔐 Authentication Flow

1. **Registration**: User registers with credentials → Account created (inactive by default)
2. **Activation**: Admin activates agent account
3. **Login**: User logs in → Server generates access token (15min) and refresh token (7d)
4. **Token Storage**: Tokens stored in httpOnly cookies (secure, not accessible via JavaScript)
5. **Authorization**: Protected routes verify access token via middleware
6. **Token Refresh**: When access token expires, use refresh token to get new tokens
7. **Logout**: Clears both tokens from cookies

## 📊 Task Distribution Algorithm

The system uses a fair distribution algorithm:

1. **Calculate Base Distribution**: `baseTasksPerAgent = floor(totalTasks / totalAgents)`
2. **Distribute Base Tasks**: Each agent receives `baseTasksPerAgent` tasks
3. **Round-Robin Remaining**: Remaining tasks (`totalTasks % totalAgents`) distributed one per agent in round-robin fashion
4. **Result**: Maximum difference between any two agents is 1 task

**Example:**
- 10 tasks, 3 agents → Agent1: 4 tasks, Agent2: 3 tasks, Agent3: 3 tasks
- 15 tasks, 4 agents → Each agent: 4 tasks (except one gets 3)

## 🛡️ Security Features

- **Password Security**: Bcrypt hashing with salt
- **JWT Tokens**: 
  - Access tokens: 15 minutes expiry
  - Refresh tokens: 7 days expiry
- **HTTP-Only Cookies**: Prevents XSS attacks
- **CORS Configuration**: Restricts origins
- **Input Validation**: File type and format validation
- **Task Ownership Verification**: Agents can only update their assigned tasks

## 🧪 Testing

Currently, the project does not have automated tests. To manually test:

1. **Start MongoDB**:
   ```bash
   mongod
   ```

2. **Start Backend**:
   ```bash
   cd backend
   npm run dev
   ```

3. **Test with cURL or Postman**:
   ```bash
   # Register a user
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"test123","mobileNumber":"1234567890","countryCode":"+1"}'
   ```

## 🚢 Deployment

### Environment Preparation

1. Set `NODE_ENV=production` in your environment
2. Use strong, unique values for `JWT_SECRET` and `JWT_REFRESH_SECRET`
3. Configure MongoDB Atlas or your production MongoDB instance
4. Set up HTTPS for secure cookie transmission

### Build and Deploy

```bash
cd backend
npm install --production
npm run build
npm start
```

### Recommended Platforms

- **Backend**: Heroku, Railway, Render, AWS EC2, DigitalOcean
- **Database**: MongoDB Atlas (free tier available)
- **Environment Variables**: Configure via platform's dashboard or CLI

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Maintain consistent code formatting
- Add comments for complex logic
- Update documentation for new features
- Test your changes thoroughly

## 📝 License

This project is licensed under the ISC License.

## 👥 Authors

- Vashishta Mithra Reddy

## 🐛 Known Issues

- Frontend implementation is pending
- No automated test suite yet
- File size limits not explicitly configured

## 🗺️ Roadmap

- [ ] Frontend implementation (React/Next.js)
- [ ] Automated testing (Jest/Mocha)
- [ ] Real-time notifications
- [ ] Task analytics dashboard
- [ ] Export task reports
- [ ] Multi-language support
- [ ] Email notifications
- [ ] Task priority levels
- [ ] Task deadline management

## 📞 Support

For support, email your-email@example.com or open an issue on GitHub.

---

**Built with ❤️ using Node.js, TypeScript, and MongoDB**" 
