# Database Schema Documentation

This document describes the database schema and data models used in the AgentX system.

## Overview

AgentX uses MongoDB as its database. The schema is implemented using Mongoose ODM for Node.js.

**Database Name:** `agentx`

**Collections:**
- `users` - User accounts (agents and admins)
- `tasks` - Individual tasks
- `distributedtasks` - Task distribution records

## Collections

### Users Collection

Stores user account information including authentication credentials and profile data.

**Collection Name:** `users`

#### Schema Definition

```typescript
{
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'agent'
  },
  mobileNumber: {
    type: String,
    required: true
  },
  countryCode: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: false
  }
}
```

#### Field Descriptions

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | ObjectId | Auto | - | MongoDB document ID |
| `name` | String | Yes | - | User's full name |
| `email` | String | Yes | - | Unique email address for login |
| `password` | String | Yes | - | Bcrypt hashed password (never plain text) |
| `role` | String | No | 'agent' | User role: 'agent' or 'admin' |
| `mobileNumber` | String | Yes | - | Contact phone number |
| `countryCode` | String | Yes | - | Phone country code (e.g., '+1', '+91') |
| `active` | Boolean | No | false | Account activation status |

#### Indexes

```javascript
// Unique index on email for fast lookups and uniqueness
db.users.createIndex({ email: 1 }, { unique: true });

// Compound index for querying active agents
db.users.createIndex({ role: 1, active: 1 });
```

#### Middleware Hooks

**Pre-save Hook:**
- Automatically hashes password before saving if password is modified
- Uses bcrypt with salt rounds of 10

**Instance Methods:**
- `comparePassword(candidatePassword: string): Promise<boolean>` - Compares plain text password with hashed password

#### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "$2a$10$XYZ...(hashed)",
  "role": "agent",
  "mobileNumber": "1234567890",
  "countryCode": "+1",
  "active": true
}
```

#### Usage Notes

- Email must be unique across all users
- Password is automatically hashed on creation and updates
- New registrations default to `active: false` and require admin activation
- Agents added via `/add-agent` endpoint are created with `active: true`

---

### Tasks Collection

Stores individual task records with contact information and completion status.

**Collection Name:** `tasks`

#### Schema Definition

```typescript
{
  firstName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  }
}
```

#### Field Descriptions

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | ObjectId | Auto | - | MongoDB document ID |
| `firstName` | String | Yes | - | Contact's first name |
| `phone` | String | Yes | - | Contact's phone number |
| `notes` | String | Yes | - | Task description or notes |
| `completed` | Boolean | No | false | Task completion status |

#### Indexes

```javascript
// Index on completion status for filtering
db.tasks.createIndex({ completed: 1 });

// Compound index for agent-specific task queries (if needed)
// This would require adding agentId to schema
```

#### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439012",
  "firstName": "Jane Smith",
  "phone": "9876543210",
  "notes": "Follow up on product inquiry regarding pricing",
  "completed": false
}
```

#### Usage Notes

- Tasks are created in bulk during file upload
- Each task is independent and can be assigned to multiple agents through DistributedTask
- Completion status is updated by agents when they finish a task
- No direct relationship to users in schema (linked via DistributedTask)

---

### DistributedTasks Collection

Maps tasks to agents, tracking which tasks are assigned to which agent and when.

**Collection Name:** `distributedtasks`

#### Schema Definition

```typescript
{
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  uploadDate: {
    type: Date,
    default: Date.now
  }
}
```

#### Field Descriptions

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | ObjectId | Auto | - | MongoDB document ID |
| `agentId` | ObjectId | Yes | - | Reference to User (agent) |
| `tasks` | ObjectId[] | No | [] | Array of Task references |
| `uploadDate` | Date | No | Date.now | When tasks were distributed |

#### Indexes

```javascript
// Index on agentId for fast agent task lookups
db.distributedtasks.createIndex({ agentId: 1 });

// Index on uploadDate for sorting by recency
db.distributedtasks.createIndex({ uploadDate: -1 });

// Compound index for agent + date queries
db.distributedtasks.createIndex({ agentId: 1, uploadDate: -1 });
```

#### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439014",
  "agentId": "507f1f77bcf86cd799439011",
  "tasks": [
    "507f1f77bcf86cd799439012",
    "507f1f77bcf86cd799439013"
  ],
  "uploadDate": "2024-01-15T10:30:00.000Z"
}
```

#### Populated Example

When querying with `.populate('tasks')`:

```json
{
  "_id": "507f1f77bcf86cd799439014",
  "agentId": "507f1f77bcf86cd799439011",
  "tasks": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "firstName": "Jane Smith",
      "phone": "9876543210",
      "notes": "Follow up on product inquiry",
      "completed": false
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "firstName": "Bob Johnson",
      "phone": "5555555555",
      "notes": "Schedule demo call",
      "completed": true
    }
  ],
  "uploadDate": "2024-01-15T10:30:00.000Z"
}
```

#### Usage Notes

- One DistributedTask document per upload batch per agent
- If agent has no tasks in a batch, they get a document with empty tasks array
- Tasks are distributed equally among active agents
- uploadDate tracks when the batch was uploaded, not individual task completion

---

## Relationships

### Entity Relationship Diagram

```
┌─────────────────┐
│     Users       │
│                 │
│  _id (PK)      │
│  email         │
│  password      │
│  role          │
│  active        │
└────────┬────────┘
         │
         │ agentId (FK)
         │
         ▼
┌─────────────────────┐         ┌─────────────────┐
│  DistributedTasks   │◄────────│     Tasks       │
│                     │ tasks[] │                 │
│  _id (PK)          │  (FK)   │  _id (PK)      │
│  agentId (FK)      │         │  firstName     │
│  tasks[]           │         │  phone         │
│  uploadDate        │         │  notes         │
└─────────────────────┘         │  completed     │
                                └─────────────────┘
```

### Relationship Types

1. **User → DistributedTask** (One-to-Many)
   - One user (agent) can have multiple DistributedTask records
   - Each DistributedTask belongs to exactly one agent
   - Foreign key: `agentId` in DistributedTask references `_id` in User

2. **DistributedTask → Task** (Many-to-Many)
   - One DistributedTask can reference multiple Tasks
   - One Task can be referenced by multiple DistributedTasks (though typically not in current implementation)
   - Foreign key: `tasks` array in DistributedTask contains Task `_id` values

## Data Flow

### Task Upload and Distribution

```
1. Admin uploads CSV/Excel file
   ↓
2. Parse file → Create Task documents
   ↓
3. Retrieve all active agents
   ↓
4. Calculate distribution:
   - baseTasksPerAgent = floor(totalTasks / totalAgents)
   - remainder = totalTasks % totalAgents
   ↓
5. Create DistributedTask documents:
   - Each agent gets baseTasksPerAgent tasks
   - First 'remainder' agents get one extra task
   ↓
6. Save DistributedTask documents
```

### Task Retrieval by Agent

```
1. Agent requests their tasks
   ↓
2. Query: DistributedTask.find({ agentId: agentId })
   ↓
3. Populate task references
   ↓
4. Sort by uploadDate (newest first)
   ↓
5. Return populated tasks
```

### Task Status Update

```
1. Agent updates task completion status
   ↓
2. Verify agent owns the task:
   - Find DistributedTask with agentId and taskId
   ↓
3. Update Task document:
   - Set completed = true/false
   ↓
4. Return updated task
```

## Queries

### Common Query Examples

#### Get All Active Agents
```javascript
db.users.find({ role: 'agent', active: true })
```

#### Get Tasks for Specific Agent
```javascript
db.distributedtasks.find({ agentId: ObjectId("...") })
  .populate('tasks')
  .sort({ uploadDate: -1 })
```

#### Get Incomplete Tasks
```javascript
db.tasks.find({ completed: false })
```

#### Get User by Email
```javascript
db.users.findOne({ email: 'user@example.com' })
```

#### Update Task Status
```javascript
db.tasks.updateOne(
  { _id: ObjectId("...") },
  { $set: { completed: true } }
)
```

#### Count Tasks per Agent
```javascript
db.distributedtasks.aggregate([
  {
    $project: {
      agentId: 1,
      taskCount: { $size: "$tasks" }
    }
  }
])
```

## Performance Considerations

### Indexing Strategy

1. **Users Collection**
   - Unique index on `email` for authentication lookups
   - Compound index on `role` and `active` for agent queries

2. **Tasks Collection**
   - Index on `completed` for filtering
   - Consider adding text index on `notes` for search (if needed)

3. **DistributedTasks Collection**
   - Index on `agentId` for agent task queries
   - Index on `uploadDate` for sorting
   - Compound index for optimized agent + date queries

### Query Optimization

1. **Use Projection**: Only select needed fields
   ```javascript
   User.findById(id).select('-password')
   ```

2. **Populate Selectively**: Only populate when needed
   ```javascript
   DistributedTask.find({ agentId }).populate('tasks')
   ```

3. **Limit Results**: Use pagination for large datasets
   ```javascript
   Task.find().limit(50).skip(page * 50)
   ```

4. **Lean Queries**: Use `.lean()` for read-only operations
   ```javascript
   Task.find().lean()
   ```

## Data Validation

### Application-Level Validation

Mongoose schemas enforce:
- Required fields
- Data types
- Unique constraints (email)
- Default values

### Additional Validation Recommendations

1. **Email Format**: Use validator package
   ```typescript
   email: {
     type: String,
     required: true,
     unique: true,
     validate: {
       validator: (v) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v),
       message: 'Invalid email format'
     }
   }
   ```

2. **Password Strength**: Enforce in controller
   ```typescript
   if (password.length < 8) {
     throw new Error('Password must be at least 8 characters');
   }
   ```

3. **Phone Validation**: Validate format
   ```typescript
   mobileNumber: {
     type: String,
     required: true,
     validate: {
       validator: (v) => /^\d{10,15}$/.test(v),
       message: 'Invalid phone number'
     }
   }
   ```

## Backup and Recovery

### Backup Strategies

1. **MongoDB Atlas**: Automatic backups enabled
2. **Self-hosted**: 
   ```bash
   # Backup
   mongodump --db agentx --out /backup/path
   
   # Restore
   mongorestore --db agentx /backup/path/agentx
   ```

### Data Migration

For schema changes:

1. Create migration scripts
2. Test on development data
3. Backup production before running
4. Run migration
5. Verify data integrity

## Security Considerations

1. **Password Security**
   - Never store plain text passwords
   - Use bcrypt with appropriate salt rounds
   - Exclude password from queries using `.select('-password')`

2. **Input Sanitization**
   - Validate all user inputs
   - Use Mongoose built-in validators
   - Consider using express-validator

3. **Query Injection Prevention**
   - Mongoose provides protection against NoSQL injection
   - Always use parameterized queries
   - Validate and sanitize user inputs

4. **Access Control**
   - Verify user permissions before data access
   - Implement role-based access control
   - Ensure agents can only access their assigned tasks

## Future Schema Enhancements

Potential improvements:

1. **Task Priority Field**
   ```typescript
   priority: {
     type: String,
     enum: ['low', 'medium', 'high'],
     default: 'medium'
   }
   ```

2. **Task Deadline**
   ```typescript
   deadline: {
     type: Date,
     required: false
   }
   ```

3. **Task Categories**
   ```typescript
   category: {
     type: String,
     enum: ['sales', 'support', 'followup'],
     required: true
   }
   ```

4. **Task History/Audit Trail**
   ```typescript
   history: [{
     action: String,
     userId: ObjectId,
     timestamp: Date
   }]
   ```

5. **Agent Performance Metrics**
   ```typescript
   // In User schema
   metrics: {
     tasksCompleted: Number,
     averageCompletionTime: Number,
     rating: Number
   }
   ```

---

This documentation should be updated whenever the schema changes.
