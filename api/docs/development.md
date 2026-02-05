# Development Guide

Complete guide for setting up, developing, testing, and deploying the OctoCAT Supply Chain Management API.

## Table of Contents

- [Local Setup](#local-setup)
- [Development Workflow](#development-workflow)
- [Running Tests](#running-tests)
- [Building](#building)
- [Database Management](#database-management)
- [Code Quality](#code-quality)
- [Debugging](#debugging)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Local Setup

### Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Git**: For version control
- **VS Code** (recommended): For best development experience

### Initial Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/webmaxru/copilot_agent_mode.git
   cd copilot_agent_mode
   ```

2. **Install dependencies**:
   ```bash
   # Install all workspace dependencies (root + api + frontend)
   npm install
   
   # Or install API dependencies only
   npm install --workspace=api
   ```

3. **Initialize the database**:
   ```bash
   # Initialize database with migrations and seed data
   npm run db:init --workspace=api
   ```

4. **Start the development server**:
   ```bash
   # Start API in development mode with hot reload
   npm run dev --workspace=api
   ```

5. **Verify the setup**:
   - API: http://localhost:3000
   - Swagger UI: http://localhost:3000/api-docs
   - Test endpoint: http://localhost:3000/api/products

---

## Development Workflow

### Project Structure

```
api/
├── src/
│   ├── db/              # Database configuration and utilities
│   ├── models/          # TypeScript entity interfaces
│   ├── repositories/    # Data access layer
│   ├── routes/          # Express route handlers
│   ├── utils/           # Utility functions
│   ├── index.ts         # Application entry point
│   └── init-db.ts       # Database initialization script
├── sql/
│   ├── migrations/      # SQL schema migrations
│   └── seed/            # SQL seed data
├── docs/                # API documentation
└── package.json
```

### Development Mode

The API uses `tsx` for hot-reloading during development:

```bash
npm run dev --workspace=api
```

This automatically:
- Compiles TypeScript on the fly
- Restarts the server on file changes
- Initializes the database if needed

### Making Code Changes

1. **Create a new branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Follow existing code patterns
   - Update Swagger annotations in models/routes
   - Add tests for new functionality

3. **Test your changes**:
   ```bash
   npm run test --workspace=api
   ```

4. **Build to verify**:
   ```bash
   npm run build --workspace=api
   ```

5. **Commit and push**:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin feature/your-feature-name
   ```

### Adding a New Entity

To add a new entity (e.g., `Category`):

1. **Create migration**:
   - Add `api/sql/migrations/002_add_categories.sql`
   
   ```sql
   CREATE TABLE categories (
       category_id INTEGER PRIMARY KEY,
       name TEXT NOT NULL,
       description TEXT
   );
   ```

2. **Create model**:
   - Add `api/src/models/category.ts`
   
   ```typescript
   export interface Category {
     categoryId: number;
     name: string;
     description: string;
   }
   ```

3. **Create repository**:
   - Add `api/src/repositories/categoriesRepo.ts`
   - Implement CRUD methods following existing patterns

4. **Create routes**:
   - Add `api/src/routes/category.ts`
   - Register routes in `api/src/index.ts`

5. **Add tests**:
   - Add `api/src/repositories/categoriesRepo.test.ts`
   - Add `api/src/routes/category.test.ts`

6. **Update Swagger**:
   - Add JSDoc annotations in model and route files

7. **Run migrations**:
   ```bash
   npm run db:migrate --workspace=api
   ```

---

## Running Tests

### Test Commands

```bash
# Run all tests
npm run test --workspace=api

# Run tests with coverage report
npm run test:coverage --workspace=api

# Run tests in watch mode (for development)
npm run test --workspace=api -- --watch

# Run specific test file
npm run test --workspace=api -- src/repositories/productsRepo.test.ts
```

### Test Structure

Tests are colocated with source files:
- Unit tests: `*.test.ts` files next to the code they test
- Test framework: Vitest
- Database: In-memory SQLite (`:memory:`) for fast, isolated tests

### Writing Tests

#### Repository Tests

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductsRepository } from './productsRepo';

describe('ProductsRepository', () => {
  let mockDb: any;
  let repo: ProductsRepository;

  beforeEach(() => {
    mockDb = {
      run: vi.fn(),
      get: vi.fn(),
      all: vi.fn(),
      close: vi.fn()
    };
    repo = new ProductsRepository(mockDb);
  });

  it('should find all products', async () => {
    mockDb.all.mockResolvedValue([
      { product_id: 1, name: 'Product 1', price: 10.0 }
    ]);

    const products = await repo.findAll();

    expect(products).toHaveLength(1);
    expect(products[0].productId).toBe(1);
  });
});
```

#### Route Tests

```typescript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index';

describe('GET /api/products', () => {
  it('should return all products', async () => {
    const response = await request(app)
      .get('/api/products')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });
});
```

### Test Coverage

View coverage report:

```bash
npm run test:coverage --workspace=api
```

Coverage reports are generated in `api/coverage/`:
- `coverage/index.html` - HTML coverage report
- `coverage/lcov.info` - LCOV format for CI tools

---

## Building

### Build Commands

```bash
# Build TypeScript to JavaScript
npm run build --workspace=api

# Build from repository root
npm run build
```

### Build Output

- **Output directory**: `api/dist/`
- **Entry point**: `api/dist/index.js`

### Build Configuration

TypeScript configuration is in `api/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true
  }
}
```

### Running Built Code

```bash
# Build first
npm run build --workspace=api

# Run the built application
npm run start --workspace=api
```

---

## Database Management

### Database Commands

```bash
# Initialize database (migrations + seed)
npm run db:init --workspace=api

# Run migrations only
npm run db:migrate --workspace=api

# Seed data only
npm run db:seed --workspace=api
```

### Database Location

- **Development**: `api/data/app.db`
- **Testing**: `:memory:` (in-memory)
- **Custom location**: Set `DB_FILE` environment variable

### Database Configuration

Configure via environment variables:

```bash
export DB_FILE=/path/to/database.db
export DB_ENABLE_WAL=true
export DB_FOREIGN_KEYS=true
export DB_TIMEOUT=30000
```

### Viewing Database Contents

Using SQLite CLI:

```bash
# Open database
sqlite3 api/data/app.db

# List tables
.tables

# View schema
.schema products

# Query data
SELECT * FROM products LIMIT 5;

# Exit
.quit
```

### Database Migrations

1. **Create a new migration**:
   ```bash
   # Create file: api/sql/migrations/002_description.sql
   ```

2. **Add SQL statements**:
   ```sql
   -- Add new column
   ALTER TABLE products ADD COLUMN category TEXT;
   
   -- Create index
   CREATE INDEX idx_products_category ON products(category);
   ```

3. **Run migration**:
   ```bash
   npm run db:migrate --workspace=api
   ```

**Important**: Never modify existing migration files. Always create new ones.

### Resetting the Database

```bash
# Delete database file
rm api/data/app.db

# Reinitialize
npm run db:init --workspace=api
```

---

## Code Quality

### Linting

Currently, no linter is configured. Consider adding ESLint:

```bash
# Install ESLint (example)
npm install --save-dev --workspace=api \
  eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### Code Formatting

Consider adding Prettier for consistent formatting:

```bash
# Install Prettier (example)
npm install --save-dev --workspace=api prettier
```

### Type Checking

Verify TypeScript types:

```bash
# Check for type errors without building
npx tsc --noEmit --workspace=api
```

---

## Debugging

### VS Code Debugging

1. **Launch configuration** (`.vscode/launch.json`):
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "type": "node",
         "request": "launch",
         "name": "Debug API",
         "program": "${workspaceFolder}/api/src/index.ts",
         "cwd": "${workspaceFolder}/api",
         "runtimeExecutable": "npx",
         "runtimeArgs": ["tsx"],
         "skipFiles": ["<node_internals>/**"]
       }
     ]
   }
   ```

2. **Set breakpoints** in source files
3. **Press F5** to start debugging

### Console Logging

Add logging to track execution:

```typescript
console.log('Processing product:', product);
console.error('Error occurred:', error);
```

### Database Query Logging

Enable verbose logging:

```typescript
// In api/src/db/sqlite.ts
db.on('trace', (sql) => {
  console.log('SQL:', sql);
});
```

---

## Deployment

### Environment Variables

Set required environment variables:

```bash
export NODE_ENV=production
export PORT=3000
export DB_FILE=/path/to/production/database.db
export DB_ENABLE_WAL=true
```

### Docker Deployment

Build Docker image:

```bash
cd api
docker build -t octocat-api .
```

Run container:

```bash
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e DB_FILE=/app/data/app.db \
  -v $(pwd)/data:/app/data \
  octocat-api
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure database backups
- [ ] Set up error logging (e.g., Sentry)
- [ ] Configure CORS for specific origins
- [ ] Add rate limiting
- [ ] Enable HTTPS
- [ ] Set up monitoring
- [ ] Configure log rotation
- [ ] Document deployment process

---

## Troubleshooting

### Common Issues

#### Port Already in Use

**Symptoms**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions**:
1. Stop the existing process using the port:
   ```bash
   # Find process ID
   lsof -i :3000
   
   # Kill process
   kill -9 <PID>
   ```

2. Use a different port:
   ```bash
   export PORT=3001
   npm run dev --workspace=api
   ```

#### Database Locked

**Symptoms**: `Error: SQLITE_BUSY: database is locked`

**Causes**:
- Another process accessing the database
- Long-running transaction
- Unclosed database connection

**Solutions**:
1. Ensure WAL mode is enabled (default)
2. Check for unclosed connections
3. Increase timeout setting:
   ```bash
   export DB_TIMEOUT=60000
   ```

#### Foreign Key Constraint Error

**Symptoms**: `Error: FOREIGN KEY constraint failed`

**Causes**:
- Trying to insert a record with invalid foreign key
- Deleting a parent record with dependent children

**Solutions**:
1. Verify referenced entities exist before creating relationships
2. Use CASCADE delete when appropriate
3. Check the order of operations

#### Module Not Found

**Symptoms**: `Error: Cannot find module 'xyz'`

**Solutions**:
1. Reinstall dependencies:
   ```bash
   rm -rf node_modules package-lock.json
   npm install --workspace=api
   ```

2. Verify import paths are correct

#### Test Failures

**Symptoms**: Tests fail unexpectedly

**Solutions**:
1. Run tests in isolation:
   ```bash
   npm run test --workspace=api -- --run
   ```

2. Check for test database issues:
   - Ensure tests use in-memory database
   - Verify migrations run before tests

3. Review recent code changes

#### Build Errors

**Symptoms**: TypeScript compilation errors

**Solutions**:
1. Check for type errors:
   ```bash
   npx tsc --noEmit
   ```

2. Review error messages and fix type issues
3. Ensure all dependencies are installed

### Getting Help

- **GitHub Issues**: https://github.com/webmaxru/copilot_agent_mode/issues
- **Documentation**: Check other docs in `api/docs/`
- **Swagger UI**: http://localhost:3000/api-docs (when running)

### Debug Mode

Enable verbose logging:

```bash
export DEBUG=*
npm run dev --workspace=api
```

---

## Best Practices

### Code Organization

1. Keep routes thin - delegate to repositories
2. Use TypeScript types everywhere
3. Handle errors consistently
4. Document complex logic with comments
5. Follow existing naming conventions

### Database

1. Always use parameterized queries
2. Run migrations before seeding
3. Test migrations on a copy first
4. Never modify existing migrations
5. Keep seed data minimal

### Testing

1. Write tests for new features
2. Mock external dependencies
3. Use in-memory database for speed
4. Aim for high coverage on critical paths
5. Run tests before committing

### Git Workflow

1. Create feature branches
2. Write descriptive commit messages
3. Keep commits focused and atomic
4. Test before pushing
5. Document breaking changes

---

## Additional Resources

- [API Overview](../README.md) - API architecture and quick start
- [Database Documentation](./database.md) - Schema and migrations
- [Models Documentation](./models.md) - Entity models
- [Endpoints Documentation](./endpoints.md) - API endpoints
- [Repository Pattern](./repository-pattern.md) - Data access layer
- [Architecture](../../docs/architecture.md) - System architecture
- [SQLite Integration](../../docs/sqlite-integration.md) - Database details
