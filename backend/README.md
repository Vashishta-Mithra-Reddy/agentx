# AgentX Backend

This is the backend server for the AgentX task distribution and management system.

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **File Parsing**: csv-parser, xlsx
- **Password Hashing**: bcrypt

## Project Structure

```
backend/
├── src/
│   ├── controllers/          # Business logic handlers
│   │   ├── authController.ts # Authentication & user management
│   │   └── taskController.ts # Task upload, distribution & management
│   ├── middleware/           # Custom middleware
│   │   └── auth.ts          # JWT authentication middleware
│   ├── models/              # Mongoose schemas & models
│   │   ├── User.ts          # User model (agents/admins)
│   │   └── Task.ts          # Task and DistributedTask models
│   ├── routes/              # API route definitions
│   │   ├── authRoutes.ts    # /api/auth routes
│   │   └── taskRoutes.ts    # /api/tasks routes
│   └── index.ts             # Application entry point & server setup
├── dist/                    # Compiled JavaScript (generated)
├── .env.example            # Environment variables template
├── package.json            # Dependencies & scripts
└── tsconfig.json           # TypeScript configuration
```

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and configure your MongoDB URI and JWT secrets.

3. **Ensure MongoDB is running:**
   - Local: `mongod`
   - Or use MongoDB Atlas cloud instance

## Development

Run the development server with hot-reload:

```bash
npm run dev
```

This uses `nodemon` to automatically restart the server when files change.

## Building

Compile TypeScript to JavaScript:

```bash
npm run build
```

This creates the `dist/` directory with compiled JavaScript files.

## Production

Start the production server:

```bash
npm start
```

This runs the compiled JavaScript from the `dist/` directory.

## Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production server

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login user | No |
| POST | `/refresh` | Refresh access token | No |
| GET | `/verify` | Verify access token | Yes |
| POST | `/logout` | Logout user | Yes |
| POST | `/add-agent` | Add new agent | No* |

*Note: In production, `/add-agent` should be protected with admin authorization

### Tasks (`/api/tasks`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/upload` | Upload & distribute tasks | Yes |
| GET | `/agent-tasks` | Get tasks for logged-in agent | Yes |
| PUT | `/agent-tasks/:id/status` | Update task completion status | Yes |

### Dashboard (`/api`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/dashboard` | Get user dashboard info | Yes |

## Models

### User Model

**Schema:**
```typescript
{
  name: string;           // Required
  email: string;          // Required, unique
  password: string;       // Required, bcrypt hashed
  role: string;           // Default: 'agent'
  mobileNumber: string;   // Required
  countryCode: string;    // Required
  active: boolean;        // Default: false
}
```

**Methods:**
- `comparePassword(candidatePassword: string): Promise<boolean>` - Compare plain password with hashed password

**Hooks:**
- Pre-save hook to hash password before saving

### Task Model

**Schema:**
```typescript
{
  firstName: string;      // Required
  phone: string;          // Required
  notes: string;          // Required
  completed: boolean;     // Default: false
}
```

### DistributedTask Model

**Schema:**
```typescript
{
  agentId: ObjectId;      // Required, references User
  tasks: ObjectId[];      // Array of Task references
  uploadDate: Date;       // Default: Date.now
}
```

## Middleware

### Authentication Middleware (`protect`)

Located in `src/middleware/auth.ts`

**Purpose:** Protects routes by verifying JWT access token from cookies

**Usage:**
```typescript
import { protect } from './middleware/auth';
router.get('/protected-route', protect, controller);
```

**Behavior:**
- Extracts `accessToken` from cookies
- Verifies token using JWT_SECRET
- Attaches `userId` to request object
- Returns 401 if token is missing or invalid

## Controllers

### Auth Controller

**Functions:**
- `register` - Create new user account (inactive by default)
- `login` - Authenticate user and set JWT cookies
- `refresh` - Generate new access/refresh tokens
- `logout` - Clear authentication cookies
- `verify` - Verify current access token
- `addAgent` - Create new active agent account

**Token Management:**
- Access Token: 15 minutes expiry
- Refresh Token: 7 days expiry
- Stored in httpOnly cookies

### Task Controller

**Functions:**
- `uploadTasks` - Upload CSV/Excel file, parse, validate, and distribute tasks
- `getAgentTasks` - Retrieve all tasks assigned to authenticated agent
- `updateTaskStatus` - Update completion status of a specific task

**File Processing:**
- Supported formats: CSV, XLS, XLSX
- Required columns: FirstName, Phone, Notes
- Uses multer for file upload (memory storage)
- csv-parser for CSV files
- xlsx library for Excel files

**Distribution Algorithm:**
1. Count total tasks and active agents
2. Calculate base tasks per agent (floor division)
3. Distribute base amount to each agent
4. Distribute remainder using round-robin
5. Save distributed tasks to database

## Environment Variables

See `.env.example` for all available environment variables:

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for access tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens
- `FRONTEND_URL` - Frontend URL for CORS

## Security Considerations

1. **Password Security**
   - Passwords hashed using bcrypt with salt
   - Never stored or transmitted in plain text

2. **JWT Security**
   - Short-lived access tokens (15 minutes)
   - Longer refresh tokens (7 days)
   - Tokens stored in httpOnly cookies
   - HTTPS required in production

3. **CORS**
   - Configured to allow only specified origins
   - Credentials enabled for cookie transmission

4. **Input Validation**
   - File type validation (CSV, XLS, XLSX only)
   - Required field validation for tasks
   - Task ownership verification before updates

5. **Production Checklist**
   - [ ] Change JWT_SECRET and JWT_REFRESH_SECRET
   - [ ] Enable HTTPS
   - [ ] Set NODE_ENV=production
   - [ ] Configure proper CORS origins
   - [ ] Use environment-specific MongoDB instance
   - [ ] Implement rate limiting (recommended)
   - [ ] Add request logging (recommended)
   - [ ] Implement admin authorization for sensitive endpoints

## Error Handling

The application uses standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

Error responses follow this format:
```json
{
  "message": "Error description",
  "error": "Detailed error message (in development)"
}
```

## Database Indexes

**Recommended indexes for production:**

```javascript
// User collection
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1, active: 1 });

// Task collection
db.tasks.createIndex({ completed: 1 });

// DistributedTask collection
db.distributedtasks.createIndex({ agentId: 1 });
db.distributedtasks.createIndex({ uploadDate: -1 });
```

## Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Ensure MongoDB is running (`mongod` or MongoDB service)

**2. Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Change PORT in `.env` or kill process using port 5000

**3. JWT Token Error**
```
Invalid or expired access token
```
**Solution:** Token may have expired. Use refresh token endpoint or login again

**4. File Upload Error**
```
Only CSV, XLS, XLSX files are allowed
```
**Solution:** Ensure uploaded file has correct MIME type and extension

## Performance Optimization

For production deployments:

1. **Database Optimization**
   - Create indexes on frequently queried fields
   - Use projection to limit returned fields
   - Consider implementing pagination for large datasets

2. **Connection Pooling**
   - Mongoose handles this by default
   - Configure pool size via connection options if needed

3. **Caching**
   - Consider Redis for session storage
   - Cache frequently accessed data

4. **File Upload**
   - Consider implementing file size limits
   - Add virus scanning for production
   - Use cloud storage (S3, etc.) for large files

## Future Enhancements

- [ ] Add request validation middleware (express-validator)
- [ ] Implement rate limiting (express-rate-limit)
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Implement automated testing (Jest, Supertest)
- [ ] Add request logging (Morgan, Winston)
- [ ] WebSocket support for real-time updates
- [ ] Admin dashboard backend endpoints
- [ ] Task export functionality
- [ ] Email notifications via SendGrid/Nodemailer
- [ ] Task analytics and reporting endpoints

## Contributing

When contributing to the backend:

1. Follow TypeScript best practices
2. Maintain consistent error handling patterns
3. Add appropriate type definitions
4. Document new API endpoints
5. Keep controllers focused and thin
6. Use middleware for cross-cutting concerns

## License

ISC
