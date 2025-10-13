# Contributing to AgentX

Thank you for your interest in contributing to AgentX! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. We expect all contributors to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (v4.4 or higher)
- Git
- A code editor (VS Code recommended)

### Setting Up Your Development Environment

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/agentx.git
   cd agentx
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/Vashishta-Mithra-Reddy/agentx.git
   ```

4. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

5. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

6. **Start MongoDB**
   ```bash
   mongod
   ```

7. **Run the development server**
   ```bash
   npm run dev
   ```

## Development Workflow

### Creating a Feature Branch

1. **Sync with upstream**
   ```bash
   git checkout main
   git pull upstream main
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

   Branch naming conventions:
   - `feature/` - New features
   - `fix/` - Bug fixes
   - `docs/` - Documentation changes
   - `refactor/` - Code refactoring
   - `test/` - Adding or updating tests

### Making Changes

1. Make your changes in the feature branch
2. Test your changes thoroughly
3. Ensure code follows the coding standards
4. Update documentation if necessary

### Keeping Your Branch Updated

```bash
git fetch upstream
git rebase upstream/main
```

## Coding Standards

### TypeScript Guidelines

- **Use TypeScript features**: Leverage types, interfaces, and type inference
- **Avoid `any` type**: Use specific types whenever possible
- **Interface naming**: Use PascalCase with 'I' prefix (e.g., `IUser`, `ITask`)
- **File naming**: Use camelCase for files (e.g., `authController.ts`)

### Code Style

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Use semicolons
- **Line length**: Aim for max 100 characters
- **Trailing commas**: Use in multi-line objects and arrays

### Example Code Style

```typescript
// Good
import { Request, Response } from 'express';
import User from '../models/User';

export const getUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
```

### Best Practices

1. **Error Handling**
   - Always use try-catch blocks for async operations
   - Return appropriate HTTP status codes
   - Provide meaningful error messages

2. **Security**
   - Never commit sensitive data or credentials
   - Validate and sanitize user inputs
   - Use parameterized queries to prevent injection attacks
   - Follow principle of least privilege

3. **Performance**
   - Use database indexes for frequently queried fields
   - Implement pagination for large datasets
   - Avoid N+1 query problems
   - Use projection to limit returned fields

4. **Code Organization**
   - Keep functions small and focused (single responsibility)
   - Use descriptive variable and function names
   - Group related functionality together
   - Extract reusable logic into utilities

## Commit Guidelines

### Commit Message Format

Use clear and descriptive commit messages following this format:

```
<type>: <subject>

<body (optional)>

<footer (optional)>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no code change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
# Good commit messages
feat: add task priority field to Task model
fix: resolve authentication token expiration issue
docs: update API documentation for task endpoints
refactor: extract task distribution logic to separate function

# Bad commit messages
update stuff
fix bug
changes
asdf
```

### Commit Best Practices

- Keep commits atomic (one logical change per commit)
- Write commit messages in present tense
- Reference issue numbers when applicable (e.g., "fix #123")
- Commit early and often

## Pull Request Process

### Before Submitting

1. **Ensure your code builds**
   ```bash
   npm run build
   ```

2. **Test your changes**
   - Manual testing of affected features
   - Verify no existing functionality is broken

3. **Update documentation**
   - Update README.md if needed
   - Update API documentation for new endpoints
   - Add inline comments for complex logic

4. **Rebase and squash commits** (if necessary)
   ```bash
   git rebase -i upstream/main
   ```

### Submitting a Pull Request

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request on GitHub**
   - Navigate to your fork on GitHub
   - Click "New Pull Request"
   - Select your feature branch
   - Fill out the PR template

3. **PR Title Format**
   ```
   [Type] Brief description
   
   Examples:
   [Feature] Add task priority levels
   [Fix] Resolve JWT token refresh issue
   [Docs] Update setup instructions
   ```

4. **PR Description Should Include**
   - Summary of changes
   - Motivation and context
   - Related issue numbers
   - Screenshots (for UI changes)
   - Testing performed
   - Checklist of completed items

### Pull Request Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Other (please describe)

## Related Issues
Closes #(issue number)

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
Describe how you tested these changes

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Changes tested locally
```

### Review Process

- Maintainers will review your PR
- Address any requested changes
- Once approved, your PR will be merged
- Your contribution will be credited

## Testing Guidelines

### Manual Testing Checklist

When testing your changes, verify:

- [ ] Authentication flow works correctly
- [ ] All API endpoints return expected responses
- [ ] Error cases are handled properly
- [ ] Database operations complete successfully
- [ ] No console errors or warnings
- [ ] Changes work across different scenarios

### Testing New Features

1. **Positive Testing**
   - Test with valid inputs
   - Verify expected behavior

2. **Negative Testing**
   - Test with invalid inputs
   - Test missing required fields
   - Test with malformed data

3. **Edge Cases**
   - Empty inputs
   - Very large inputs
   - Boundary values
   - Concurrent operations

### Example Test Scenarios

**Testing Task Upload:**
```bash
# Valid CSV
curl -X POST http://localhost:5000/api/tasks/upload \
  -b cookies.txt \
  -F "file=@valid_tasks.csv"

# Invalid file type
curl -X POST http://localhost:5000/api/tasks/upload \
  -b cookies.txt \
  -F "file=@document.pdf"

# Missing columns
curl -X POST http://localhost:5000/api/tasks/upload \
  -b cookies.txt \
  -F "file=@invalid_format.csv"
```

## Documentation

### Code Documentation

- Add JSDoc comments for functions and classes
- Document complex algorithms
- Explain non-obvious code decisions
- Keep comments up-to-date with code changes

### Example Documentation

```typescript
/**
 * Distributes tasks equally among active agents using round-robin algorithm
 * 
 * @param tasks - Array of tasks to distribute
 * @param agents - Array of active agents
 * @returns Promise resolving to saved distributed tasks
 * @throws {Error} If no agents are available or database operation fails
 */
const distributeTasksToAgents = async (
  tasks: ITask[],
  agents: IUser[]
): Promise<IDistributedTask[]> => {
  // Implementation
};
```

### API Documentation

When adding new endpoints:

1. Update `docs/API.md`
2. Include request/response examples
3. Document all parameters and fields
4. List possible error responses
5. Add usage examples

## Reporting Bugs

### Before Reporting

1. Check if the bug has already been reported
2. Verify you're using the latest version
3. Collect relevant information

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., macOS 12.0]
- Node.js version: [e.g., 16.14.0]
- MongoDB version: [e.g., 4.4.10]

## Screenshots
If applicable

## Additional Context
Any other relevant information
```

## Suggesting Enhancements

### Enhancement Template

```markdown
## Feature Description
Clear description of the proposed feature

## Motivation
Why is this feature needed?

## Proposed Solution
How should it work?

## Alternatives Considered
What other approaches were considered?

## Additional Context
Any other relevant information
```

## Questions?

If you have questions about contributing:

- Open a [GitHub Discussion](https://github.com/Vashishta-Mithra-Reddy/agentx/discussions)
- Open an issue with the "question" label
- Reach out to maintainers

## Recognition

Contributors will be recognized in:
- Project README
- Release notes
- Contributors page

Thank you for contributing to AgentX! 🎉
