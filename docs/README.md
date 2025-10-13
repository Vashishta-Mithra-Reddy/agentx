# AgentX Documentation

Welcome to the AgentX documentation! This directory contains comprehensive guides and references for the AgentX Task Distribution & Management System.

## 📚 Documentation Index

### Getting Started
- **[Main README](../README.md)** - Project overview, features, quick start guide, and architecture
- **[Backend README](../backend/README.md)** - Backend-specific documentation, project structure, and development guide

### API Reference
- **[API Documentation](API.md)** - Complete API reference with all endpoints, request/response examples, and authentication details

### Database
- **[Database Schema](DATABASE.md)** - Detailed database schema, models, relationships, and query examples

### Deployment
- **[Deployment Guide](DEPLOYMENT.md)** - Step-by-step deployment instructions for multiple platforms

### Contributing
- **[Contributing Guidelines](../CONTRIBUTING.md)** - How to contribute, coding standards, and pull request process

### Examples
- **[Example Files](../examples/README.md)** - Sample CSV files and usage examples

## 📖 Quick Navigation

### For New Users
1. Start with the [Main README](../README.md) to understand what AgentX is
2. Follow the setup instructions in the [Main README](../README.md)
3. Check the [Example Files](../examples/README.md) to see how to upload tasks
4. Refer to the [API Documentation](API.md) for endpoint details

### For Developers
1. Read the [Backend README](../backend/README.md) for development setup
2. Review the [Database Schema](DATABASE.md) to understand data models
3. Follow the [Contributing Guidelines](../CONTRIBUTING.md) for code standards
4. Use the [API Documentation](API.md) as a reference while developing

### For DevOps/Deployment
1. Review the [Main README](../README.md) prerequisites
2. Follow the [Deployment Guide](DEPLOYMENT.md) for your chosen platform
3. Use the [Backend README](../backend/README.md) for build and start commands
4. Reference [Database Schema](DATABASE.md) for setting up indexes in production

## 🎯 Documentation Overview

### API.md - API Documentation
Complete reference for all API endpoints including:
- Authentication endpoints (register, login, logout, token refresh)
- Task management endpoints (upload, retrieve, update)
- Dashboard endpoint
- Request/response formats
- Error handling
- Testing examples with cURL and Postman

### DATABASE.md - Database Schema
Comprehensive database documentation covering:
- Collection schemas (Users, Tasks, DistributedTasks)
- Field descriptions and types
- Relationships and foreign keys
- Indexes for performance
- Query examples
- Security considerations
- Migration strategies

### DEPLOYMENT.md - Deployment Guide
Platform-specific deployment instructions for:
- Heroku
- Railway
- Render
- AWS EC2
- DigitalOcean
- MongoDB Atlas setup
- Environment configuration
- Security hardening
- Monitoring and maintenance

## 🔑 Key Concepts

### Authentication
AgentX uses JWT (JSON Web Tokens) with httpOnly cookies for secure authentication. See [API.md](API.md#authentication) for details.

### Task Distribution
Tasks are distributed equally among active agents using a fair round-robin algorithm. See [DATABASE.md](DATABASE.md#data-flow) for the algorithm details.

### Role-Based Access
- **Agents**: Can view and update their assigned tasks
- **Admins**: Can upload tasks and manage agents (authorization to be implemented)

## 🛠️ Common Tasks

### Setting Up Development Environment
```bash
# Clone repository
git clone https://github.com/Vashishta-Mithra-Reddy/agentx.git
cd agentx/backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start development server
npm run dev
```

See [Backend README](../backend/README.md) for more details.

### Uploading Tasks
```bash
# Upload CSV file
curl -X POST http://localhost:5000/api/tasks/upload \
  -b cookies.txt \
  -F "file=@tasks.csv"
```

See [API.md](API.md#upload-tasks) and [examples/README.md](../examples/README.md) for more details.

### Deploying to Production
```bash
# Build the application
npm run build

# Start production server
npm start
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for platform-specific instructions.

## 📝 Documentation Standards

All documentation follows these principles:
- **Clear and concise**: Easy to understand for all skill levels
- **Example-driven**: Includes practical examples and code snippets
- **Up-to-date**: Reflects the current state of the codebase
- **Well-organized**: Logical structure with clear headings and navigation

## 🔄 Keeping Documentation Updated

When making changes to the codebase:
1. Update relevant documentation in the same PR
2. Add examples for new features
3. Update API docs for new/modified endpoints
4. Update database docs for schema changes
5. Update deployment docs for infrastructure changes

## 🤝 Contributing to Documentation

We welcome documentation improvements! See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

When contributing documentation:
- Check for spelling and grammar
- Ensure examples are tested and working
- Maintain consistent formatting
- Add to the table of contents
- Update links if moving/renaming files

## 📞 Getting Help

If you can't find what you're looking for:
- Check the [GitHub Issues](https://github.com/Vashishta-Mithra-Reddy/agentx/issues)
- Review existing [Discussions](https://github.com/Vashishta-Mithra-Reddy/agentx/discussions)
- Open a new issue with the "documentation" label

## 📄 License

This documentation is part of the AgentX project and is licensed under the ISC License.

---

**Last Updated**: 2024-10-03

For questions or suggestions about the documentation, please open an issue on GitHub.
