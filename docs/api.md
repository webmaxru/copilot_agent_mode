# API Documentation

This document provides comprehensive documentation for the OctoCAT Supply Chain Management API layer, covering architecture, setup, development workflow, and contribution guidelines.

## Table of Contents

- [Overview](#overview)
- [API Folder Structure](#api-folder-structure)
- [Getting Started](#getting-started)
- [Data Layer](#data-layer)
- [Routing and Endpoints](#routing-and-endpoints)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Contribution Guidelines](#contribution-guidelines)
- [Configuration](#configuration)

## Overview

The API is a RESTful service built with Express.js and TypeScript, using SQLite for data persistence. It follows a repository pattern for data access and provides comprehensive OpenAPI/Swagger documentation.

**Tech Stack:**
- **Runtime:** Node.js with TypeScript
- **Web Framework:** Express.js
- **Database:** SQLite (file-based with WAL mode)
- **Documentation:** Swagger/OpenAPI 3.0
- **Testing:** Vitest with coverage support
- **Build:** TypeScript compiler (tsc)

## API Folder Structure

```
api/
├── src/
│   ├── db/                    # Database layer
│   │   ├── config.ts          # Database configuration
│   │   ├── migrate.ts         # Migration runner
│   │   ├── seed.ts            # Seed data loader
│   │   └── sqlite.ts          # SQLite connection management
│   ├── models/                # TypeScript entity models
│   │   ├── supplier.ts
│   │   ├── product.ts
│   │   ├── order.ts
│   │   └── ...
│   ├── repositories/          # Data access layer
│   │   ├── suppliersRepo.ts
│   │   ├── productsRepo.ts
│   │   └── ...
│   ├── routes/                # Express route handlers
│   │   ├── supplier.ts
│   │   ├── product.ts
│   │   └── ...
│   ├── utils/                 # Shared utilities
│   │   ├── errors.ts          # Error handling utilities
│   │   └── sql.ts             # SQL helper functions
│   ├── index.ts               # Application entry point
│   └── init-db.ts             # Database initialization script
├── sql/
│   ├── migrations/            # Database schema migrations
│   │   └── 001_init.sql
│   └── seed/                  # Seed data scripts
│       ├── 001_suppliers.sql
│       ├── 002_headquarters.sql
│       └── ...
├── data/                      # Database files (git-ignored)
│   └── app.db                 # SQLite database file
├── api-swagger.json           # Static OpenAPI spec
├── package.json               # NPM dependencies and scripts
├── tsconfig.json              # TypeScript configuration
└── vitest.config.ts           # Test configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

From the repository root:

```bash
# Install all dependencies (root + workspaces)
npm install

# Or install API dependencies only
npm install --workspace=api
```

### Build

```bash
# Build API only
npm run build --workspace=api

# Build from root (builds all workspaces)
npm run build
```

Build output is placed in `api/dist/`.

### Running the API

**Development mode** (with hot reload):

```bash
npm run dev --workspace=api
```

**Production mode** (requires build first):

```bash
npm run build --workspace=api
npm run start --workspace=api
```

The server starts on `http://localhost:3000` by default (configurable via `PORT` environment variable).

### Database Initialization

The database is automatically initialized when the server starts for the first time. This includes:
1. Creating the database file at `api/data/app.db`
2. Running pending migrations
3. Seeding sample data (if the database is empty)

**Manual database management:**

```bash
# Initialize with migrations and seed data
npm run db:init --workspace=api

# Run migrations only (no seeding)
npm run db:migrate --workspace=api

# Seed database only (requires tables to exist)
# Note: The npm run db:seed command has a module resolution issue.
# Use this workaround instead (run from the api directory):
cd api && npx tsx src/init-db.ts --seed
```

### Accessing API Documentation

Once the server is running, interactive Swagger documentation is available at:

- **Swagger UI:** http://localhost:3000/api-docs
- **OpenAPI JSON:** http://localhost:3000/api-docs.json

## Data Layer

### SQLite Setup

The API uses SQLite for persistent data storage with the following configuration:

- **Database File:** `api/data/app.db` (configurable via `DB_FILE`)
- **WAL Mode:** Enabled by default for better concurrency (configurable via `DB_ENABLE_WAL`)
- **Foreign Keys:** Enabled by default (configurable via `DB_FOREIGN_KEYS`)
- **Test Mode:** Uses in-memory database (`:memory:`) for isolation

See [SQLite Integration](./sqlite-integration.md) for detailed database documentation.

### Repository Pattern

The API uses the repository pattern to encapsulate data access logic and provide a clean interface between business logic and the database.

**Key Features:**
- Type-safe TypeScript interfaces
- Automatic conversion between snake_case (database) and camelCase (TypeScript)
- Parameterized queries to prevent SQL injection
- Custom error types (NotFoundError, ValidationError, ConflictError)
- Singleton database connection per repository instance

**Repository Example:**

```typescript
import { getSuppliersRepository } from './repositories/suppliersRepo';

// Get repository instance
const repo = await getSuppliersRepository();

// CRUD operations
const suppliers = await repo.findAll();
const supplier = await repo.findById(1);
const newSupplier = await repo.create({ name: 'New Supplier', ... });
const updated = await repo.update(1, { name: 'Updated Name' });
await repo.delete(1);

// Custom queries
const results = await repo.findByName('Tech');
const exists = await repo.exists(1);
```

**Available Repositories:**
- `suppliersRepo.ts` - Supplier management
- `headquartersRepo.ts` - Headquarters management
- `branchesRepo.ts` - Branch management
- `productsRepo.ts` - Product catalog
- `ordersRepo.ts` - Order management
- `orderDetailsRepo.ts` - Order line items
- `deliveriesRepo.ts` - Delivery tracking
- `orderDetailDeliveriesRepo.ts` - Order-delivery relationships

### Migrations

Database schema changes are managed through sequential migration files in `api/sql/migrations/`.

**Migration File Naming:**
- Format: `NNN_description.sql` (e.g., `001_init.sql`, `002_add_indexes.sql`)
- Executed in numerical order
- Tracked in the `migrations` table to prevent re-execution

**Creating a New Migration:**

1. Create a new migration file with the next sequential number:
   ```bash
   # Example: api/sql/migrations/002_add_user_table.sql
   ```

2. Add your SQL statements:
   ```sql
   -- Migration 002: Add user table
   
   CREATE TABLE users (
       user_id INTEGER PRIMARY KEY,
       username TEXT NOT NULL UNIQUE,
       email TEXT NOT NULL UNIQUE,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   -- Add indexes
   CREATE INDEX idx_users_email ON users(email);
   ```

3. Run migrations:
   ```bash
   npm run db:migrate --workspace=api
   ```

**Migration Best Practices:**
- Never modify existing migration files (immutable history)
- Use `IF NOT EXISTS` where feasible for idempotency
- Add indexes for foreign keys and frequently queried columns
- Include rollback strategy in comments if manual reversal is needed
- Test migrations on a copy of production data before deploying

### Seed Data

Seed data provides sample data for development and demo purposes. Seed files are located in `api/sql/seed/`.

**Seed File Naming:**
- Format: `NNN_entity.sql` (e.g., `001_suppliers.sql`)
- Executed in order to maintain referential integrity
- Should use deterministic IDs for consistency across runs

**Seed File Example:**

```sql
-- Seed suppliers
INSERT INTO suppliers (supplier_id, name, description, contact_person, email, phone)
VALUES 
  (1, 'TechSupply Inc', 'Electronics supplier', 'John Doe', 'john@techsupply.com', '555-0101'),
  (2, 'OfficeWorld', 'Office supplies', 'Jane Smith', 'jane@officeworld.com', '555-0102');
```

**Updating Seed Data:**

When adding new required columns:
1. Update existing seed files to include values for the new column
2. Maintain referential order (e.g., suppliers before products)
3. Ensure IDs remain consistent for dependent data

## Routing and Endpoints

### Route Structure

Routes are organized by entity in `api/src/routes/`, with each file exporting an Express router that is mounted in `index.ts`.

**Route File Template:**

```typescript
import express from 'express';
import { getEntityRepository } from '../repositories/entityRepo';
import { NotFoundError } from '../utils/errors';

const router = express.Router();

// GET /api/entities - Get all entities
router.get('/', async (req, res, next) => {
  try {
    const repo = await getEntityRepository();
    const entities = await repo.findAll();
    res.json(entities);
  } catch (error) {
    next(error);
  }
});

// GET /api/entities/:id - Get entity by ID
router.get('/:id', async (req, res, next) => {
  try {
    const repo = await getEntityRepository();
    const entity = await repo.findById(parseInt(req.params.id));
    if (!entity) {
      res.status(404).send('Entity not found');
      return;
    }
    res.json(entity);
  } catch (error) {
    next(error);
  }
});

// POST /api/entities - Create new entity
router.post('/', async (req, res, next) => {
  try {
    const repo = await getEntityRepository();
    const newEntity = await repo.create(req.body);
    res.status(201).json(newEntity);
  } catch (error) {
    next(error);
  }
});

// PUT /api/entities/:id - Update entity
router.put('/:id', async (req, res, next) => {
  try {
    const repo = await getEntityRepository();
    const updated = await repo.update(parseInt(req.params.id), req.body);
    res.json(updated);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).send('Entity not found');
    } else {
      next(error);
    }
  }
});

// DELETE /api/entities/:id - Delete entity
router.delete('/:id', async (req, res, next) => {
  try {
    const repo = await getEntityRepository();
    await repo.delete(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).send('Entity not found');
    } else {
      next(error);
    }
  }
});

export default router;
```

### Available Endpoints

All endpoints are prefixed with `/api/`:

| Entity | Base Path | Description |
|--------|-----------|-------------|
| Suppliers | `/api/suppliers` | Supplier management |
| Headquarters | `/api/headquarters` | Company headquarters |
| Branches | `/api/branches` | Branch locations |
| Products | `/api/products` | Product catalog |
| Orders | `/api/orders` | Customer orders |
| Order Details | `/api/order-details` | Order line items |
| Deliveries | `/api/deliveries` | Delivery tracking |
| Order-Delivery Links | `/api/order-detail-deliveries` | Order-delivery relationships |

**Standard Operations** (available for most entities):
- `GET /api/{entity}` - List all records
- `GET /api/{entity}/{id}` - Get single record by ID
- `POST /api/{entity}` - Create new record
- `PUT /api/{entity}/{id}` - Update existing record
- `DELETE /api/{entity}/{id}` - Delete record

### Swagger/OpenAPI Documentation

All routes include Swagger annotations for automatic documentation generation.

**Adding Swagger Documentation:**

```typescript
/**
 * @swagger
 * /api/entities:
 *   get:
 *     summary: Returns all entities
 *     tags: [Entities]
 *     responses:
 *       200:
 *         description: List of all entities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Entity'
 */
router.get('/', async (req, res, next) => {
  // Handler implementation
});
```

### Authentication & Authorization

**Current State:** No authentication required (demo application)

For production deployments, consider adding:
- JWT-based authentication middleware
- Role-based access control (RBAC)
- API key validation for service-to-service calls

### CORS Configuration

CORS is configured to allow requests from the frontend. By default, the following origins are allowed:

```typescript
const corsOrigins = [
  'http://localhost:5137',  // Frontend dev server
  'http://localhost:3001',
  /^https:\/\/.*\.app\.github\.dev$/,  // GitHub Codespaces
];
```

**To customize allowed origins**, set the `API_CORS_ORIGINS` environment variable:

```bash
# Allow specific origins (comma-separated)
API_CORS_ORIGINS=http://localhost:3000,https://example.com npm run dev

# In a .env file:
API_CORS_ORIGINS=http://localhost:3000,https://example.com,https://app.mysite.com
```

## Error Handling

### Error Types

The API uses custom error classes for consistent error handling:

```typescript
// Base error class
class DatabaseError extends Error {
  code: string;
  statusCode: number;
}

// Specific error types
class NotFoundError extends DatabaseError        // 404 - Entity not found
class ValidationError extends DatabaseError      // 400 - Invalid input
class ConflictError extends DatabaseError        // 409 - Constraint violation
```

### Error Response Format

All errors return a consistent JSON structure:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Supplier with ID 123 not found"
  }
}
```

### Using Error Handling in Routes

```typescript
import { NotFoundError, ValidationError } from '../utils/errors';

router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new ValidationError('Invalid ID format');
    }
    
    const entity = await repo.findById(id);
    if (!entity) {
      throw new NotFoundError('Entity', id);
    }
    
    res.json(entity);
  } catch (error) {
    next(error);  // Pass to error handling middleware
  }
});
```

### Error Handling Middleware

The global error handler is automatically applied in `index.ts`:

```typescript
import { errorHandler } from './utils/errors';

app.use(errorHandler);
```

This middleware catches all errors passed via `next(error)` and formats them consistently.

## Testing

### Test Structure

Tests are colocated with source files using the `.test.ts` suffix:

```
api/src/
├── repositories/
│   ├── suppliersRepo.ts
│   └── suppliersRepo.test.ts
└── routes/
    ├── branch.ts
    └── branch.test.ts
```

### Running Tests

```bash
# Run all tests
npm run test --workspace=api

# Run tests with coverage
npm run test:coverage --workspace=api

# Run tests in watch mode (for development)
npm run test --workspace=api -- --watch
```

### Test Configuration

Tests use Vitest with in-memory SQLite for fast, isolated testing:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

### Unit Testing Repositories

Repository tests use mocked database connections:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SuppliersRepository } from './suppliersRepo';

describe('SuppliersRepository', () => {
  let repository: SuppliersRepository;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      run: vi.fn(),
      get: vi.fn(),
      all: vi.fn(),
      close: vi.fn(),
    };
    repository = new SuppliersRepository(mockDb);
  });

  it('should find all suppliers', async () => {
    mockDb.all.mockResolvedValue([
      { supplier_id: 1, name: 'Test Supplier', ... }
    ]);
    
    const result = await repository.findAll();
    
    expect(result).toHaveLength(1);
    expect(result[0].supplierId).toBe(1);
  });
});
```

### Integration Testing Routes

Route tests use an in-memory database for realistic integration testing:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import branchRoutes from './branch';
import { getDatabase } from '../db/sqlite';

describe('Branch Routes', () => {
  let app: express.Application;

  beforeEach(async () => {
    // Use in-memory database for testing
    const db = await getDatabase(true);
    
    app = express();
    app.use(express.json());
    app.use('/api/branches', branchRoutes);
  });

  it('GET /api/branches should return all branches', async () => {
    const response = await request(app)
      .get('/api/branches')
      .expect(200);
      
    expect(Array.isArray(response.body)).toBe(true);
  });
});
```

### Adding New Tests

When adding new functionality:

1. **Repository changes:** Add unit tests with mocked database
2. **Route changes:** Add integration tests using supertest
3. **Model changes:** Update related repository and route tests
4. **Error handling:** Test both success and error paths

**Test Coverage Goals:**
- Maintain >80% coverage for repositories
- Test all critical API endpoints
- Cover error scenarios (404, 400, 409, 500)

## Contribution Guidelines

### Adding New Entities

When adding a new entity to the system, follow these steps:

#### 1. Create the Model

Create a TypeScript interface in `api/src/models/{entity}.ts`:

```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     Entity:
 *       type: object
 *       properties:
 *         entityId:
 *           type: integer
 *         name:
 *           type: string
 */
export interface Entity {
  entityId: number;
  name: string;
  description?: string;
}
```

#### 2. Add Database Migration

Create a migration file in `api/sql/migrations/` with the next sequential number:

```sql
-- Migration 00X: Add entity table

CREATE TABLE entities (
    entity_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT
);

CREATE INDEX idx_entities_name ON entities(name);
```

#### 3. Create Seed Data

Add seed data in `api/sql/seed/00X_entities.sql`:

```sql
INSERT INTO entities (entity_id, name, description)
VALUES 
  (1, 'Example Entity', 'Description');
```

#### 4. Implement Repository

Create `api/src/repositories/entitiesRepo.ts`:

```typescript
import { getDatabase, DatabaseConnection } from '../db/sqlite';
import { Entity } from '../models/entity';
import { handleDatabaseError, NotFoundError } from '../utils/errors';
import { buildInsertSQL, buildUpdateSQL, objectToCamelCase } from '../utils/sql';

export class EntitiesRepository {
  private db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  async findAll(): Promise<Entity[]> {
    const rows = await this.db.all<any>('SELECT * FROM entities ORDER BY entity_id');
    return rows.map(row => objectToCamelCase(row) as Entity);
  }

  async findById(id: number): Promise<Entity | null> {
    const row = await this.db.get<any>('SELECT * FROM entities WHERE entity_id = ?', [id]);
    return row ? objectToCamelCase(row) as Entity : null;
  }

  async create(entity: Omit<Entity, 'entityId'>): Promise<Entity> {
    const { sql, values } = buildInsertSQL('entities', entity);
    const result = await this.db.run(sql, values);
    const created = await this.findById(result.lastID!);
    if (!created) {
      throw new Error('Failed to retrieve created entity');
    }
    return created;
  }

  async update(id: number, updates: Partial<Entity>): Promise<Entity> {
    const { sql, values } = buildUpdateSQL('entities', updates, id);
    const result = await this.db.run(sql, values);
    if (result.changes === 0) {
      throw new NotFoundError('Entity', id);
    }
    return (await this.findById(id))!;
  }

  async delete(id: number): Promise<void> {
    const result = await this.db.run('DELETE FROM entities WHERE entity_id = ?', [id]);
    if (result.changes === 0) {
      throw new NotFoundError('Entity', id);
    }
  }
}

let repositoryInstance: EntitiesRepository | null = null;

export async function getEntitiesRepository(): Promise<EntitiesRepository> {
  if (!repositoryInstance) {
    const db = await getDatabase();
    repositoryInstance = new EntitiesRepository(db);
  }
  return repositoryInstance;
}
```

#### 5. Create Routes

Create `api/src/routes/entity.ts` following the route template shown earlier.

#### 6. Register Routes

Add the route to `api/src/index.ts`:

```typescript
import entityRoutes from './routes/entity';
app.use('/api/entities', entityRoutes);
```

#### 7. Add Tests

Create unit tests in `api/src/repositories/entitiesRepo.test.ts` and integration tests in `api/src/routes/entity.test.ts`.

#### 8. Update Documentation

Update Swagger annotations and this documentation if the entity introduces new patterns or concepts.

### Naming Conventions

**TypeScript:**
- Use **camelCase** for variables, functions, properties: `entityId`, `findById`
- Use **PascalCase** for classes, interfaces, types: `Entity`, `EntitiesRepository`
- Use **SCREAMING_SNAKE_CASE** for constants: `DB_FILE`, `MAX_RETRIES`

**Database:**
- Use **snake_case** for table and column names: `entity_id`, `created_at`
- Use **plural** table names: `suppliers`, `products` (following the existing codebase convention)

**Files:**
- Use **camelCase** for TypeScript files: `entitiesRepo.ts`, `supplier.ts`
- Use **kebab-case** for config files: `vitest.config.ts`
- Test files: add `.test.ts` suffix: `entitiesRepo.test.ts`

### Code Style

- Use TypeScript strict mode (enabled in `tsconfig.json`)
- Avoid `any` type; use proper types or `unknown`
- Use async/await (not callbacks or raw promises)
- Handle all errors explicitly (wrap in try-catch, pass to `next()`)
- Keep functions small and focused (< 50 lines)
- Add JSDoc comments for public APIs
- Use Prettier/ESLint if configured in the project

### Pull Request Guidelines

1. Create a feature branch from `main`
2. Make focused, atomic commits
3. Run tests locally before pushing: `npm run test --workspace=api`
4. Build successfully: `npm run build --workspace=api`
5. Update documentation if behavior changes
6. Link related issues in PR description

## Configuration

### Environment Variables

The API supports the following environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP port for the server |
| `DB_FILE` | `./data/app.db` | Path to SQLite database file |
| `DB_ENGINE` | `sqlite` | Database engine (currently only SQLite) |
| `DB_ENABLE_WAL` | `true` | Enable Write-Ahead Logging for better concurrency |
| `DB_TIMEOUT` | `30000` | Database connection timeout (milliseconds) |
| `DB_FOREIGN_KEYS` | `true` | Enable foreign key constraints |
| `API_CORS_ORIGINS` | See `index.ts` | Comma-separated list of allowed CORS origins |
| `NODE_ENV` | - | Set to `development` for verbose logging |

**Example `.env` file:**

```bash
PORT=3000
DB_FILE=/absolute/path/to/database.db
DB_ENABLE_WAL=true
DB_FOREIGN_KEYS=true
API_CORS_ORIGINS=http://localhost:5137,http://localhost:3001
NODE_ENV=development
```

### Database Configuration

Database configuration is centralized in `api/src/db/config.ts`:

```typescript
export const DB_CONFIG = {
  DB_FILE: process.env.DB_FILE || './data/app.db',
  DB_ENGINE: process.env.DB_ENGINE || 'sqlite',
  ENABLE_WAL: process.env.DB_ENABLE_WAL !== 'false',
  TIMEOUT: parseInt(process.env.DB_TIMEOUT || '30000'),
  FOREIGN_KEYS: process.env.DB_FOREIGN_KEYS !== 'false'
};
```

### TypeScript Configuration

Key TypeScript compiler settings (`tsconfig.json`):

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

## Troubleshooting

### Common Issues

**Database locked error:**
- Cause: Long-running transaction or unclosed connection
- Solution: Ensure all database operations use `await` and connections are properly managed. Enable WAL mode (`DB_ENABLE_WAL=true`)

**Foreign key constraint failed:**
- Cause: Attempting to create/update records that reference non-existent parent records
- Solution: Ensure parent records exist before creating relationships. Check seed file execution order.

**Migration fails:**
- Cause: SQL syntax error or schema conflict
- Solution: Check migration file syntax. Ensure migration is compatible with existing schema. Test on a database copy first.

**Port already in use:**
- Cause: Another process is using port 3000
- Solution: Kill the process or use a different port: `PORT=3001 npm run dev --workspace=api`

**Module not found errors:**
- Cause: Missing dependencies
- Solution: Run `npm install --workspace=api` or `npm install` from root

### Debug Mode

Enable verbose logging:

```bash
NODE_ENV=development npm run dev --workspace=api
```

This shows all SQL queries and detailed error information.

### Database Inspection

Use SQLite CLI to inspect the database:

```bash
sqlite3 api/data/app.db

# List tables
.tables

# Show table schema
.schema suppliers

# Query data
SELECT * FROM suppliers LIMIT 5;

# Exit
.quit
```

## Additional Resources

- [Architecture Overview](./architecture.md) - High-level system architecture
- [SQLite Integration](./sqlite-integration.md) - Detailed database documentation
- [Main README](../README.md) - Project overview and quick start
- [OpenAPI Spec](../api/api-swagger.json) - Static OpenAPI specification
- [Express Documentation](https://expressjs.com/) - Express.js framework docs
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - TypeScript language guide
- [SQLite Documentation](https://www.sqlite.org/docs.html) - SQLite database engine docs
- [Vitest Documentation](https://vitest.dev/) - Testing framework docs
