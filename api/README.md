# OctoCAT Supply Chain Management API

This is the REST API component of the OctoCAT Supply Chain Management System, built with Express.js, TypeScript, and SQLite. The API provides comprehensive endpoints for managing suppliers, headquarters, branches, products, orders, deliveries, and their relationships.

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the API Locally](#running-the-api-locally)
  - [Running Tests](#running-tests)
- [API Architecture](#api-architecture)
  - [Express.js Setup](#expressjs-setup)
  - [Repository Pattern](#repository-pattern)
  - [Error Handling Strategy](#error-handling-strategy)
  - [Middleware Overview](#middleware-overview)
  - [Database Layer Abstraction](#database-layer-abstraction)
- [Database Management](#database-management)
  - [SQLite Database Initialization](#sqlite-database-initialization)
  - [Migration System](#migration-system)
  - [Seeding Process](#seeding-process)
  - [Test Database Configuration](#test-database-configuration)
  - [Database Utilities](#database-utilities)
- [API Endpoints](#api-endpoints)
  - [Swagger Documentation](#swagger-documentation)
  - [Available Entity Routes](#available-entity-routes)
- [Data Models](#data-models)
  - [Entity Models](#entity-models)
  - [Relationships Between Entities](#relationships-between-entities)
  - [TypeScript Interfaces](#typescript-interfaces)
- [Development Guidelines](#development-guidelines)
  - [Code Structure and Conventions](#code-structure-and-conventions)
  - [Adding New Endpoints](#adding-new-endpoints)
  - [Creating New Repositories](#creating-new-repositories)
  - [Testing Approach](#testing-approach)
  - [TypeScript Configuration](#typescript-configuration)
- [Build and Deployment](#build-and-deployment)
  - [Build Process](#build-process)
  - [Docker Containerization](#docker-containerization)
  - [Production Considerations](#production-considerations)
- [Troubleshooting](#troubleshooting)
  - [Common Issues and Solutions](#common-issues-and-solutions)
  - [Debug Tips](#debug-tips)
  - [Log Locations](#log-locations)

---

## Getting Started

### Prerequisites

Before running the API, ensure you have the following installed:

- **Node.js**: Version 20 or higher (recommended: 20 LTS)
- **npm**: Version 9 or higher (comes with Node.js)
- **Git**: For cloning the repository

### Installation

1. Navigate to the API directory:
   ```bash
   cd api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. The API will automatically initialize the database when you first run it.

### Environment Variables

The API supports the following environment variables for configuration:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Port number for the API server |
| `DB_FILE` | `./data/app.db` | Path to the SQLite database file |
| `DB_ENGINE` | `sqlite` | Database engine (currently only SQLite is supported) |
| `DB_ENABLE_WAL` | `true` | Enable Write-Ahead Logging for better concurrency |
| `DB_TIMEOUT` | `30000` | Database connection timeout in milliseconds |
| `DB_FOREIGN_KEYS` | `true` | Enable foreign key constraints |
| `API_CORS_ORIGINS` | See code | Comma-separated list of allowed CORS origins |
| `NODE_ENV` | - | Set to `development` for verbose logging |

**Example `.env` file:**
```bash
PORT=3000
DB_FILE=./data/app.db
NODE_ENV=development
API_CORS_ORIGINS=http://localhost:5137,http://localhost:3001
```

### Running the API Locally

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
# Build the TypeScript code
npm run build

# Start the production server
npm start
```

The API will be available at `http://localhost:3000` (or the port specified in `PORT` environment variable).

**API Documentation** is available at:
- Swagger UI: `http://localhost:3000/api-docs`
- OpenAPI JSON: `http://localhost:3000/api-docs.json`

### Running Tests

Run all tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

Tests use an in-memory SQLite database (`:memory:`) for fast, isolated execution.

---

## API Architecture

### Express.js Setup

The API is built using Express.js 4.x with the following key features:

- **JSON parsing**: Built-in middleware for parsing JSON request bodies
- **CORS**: Configured to allow cross-origin requests from the frontend
- **Swagger/OpenAPI**: Auto-generated documentation using `swagger-jsdoc`
- **Error handling**: Centralized error handling middleware
- **Modular routing**: Separate route files for each entity

**Main application file**: [`src/index.ts`](./src/index.ts)

Key initialization steps:
1. Configure CORS with allowed origins
2. Set up Swagger documentation
3. Register entity routes
4. Initialize database (run migrations and seed data)
5. Start the Express server

### Repository Pattern

The API uses the **Repository Pattern** to abstract database access and provide a clean separation between business logic and data access:

**Benefits:**
- **Type safety**: Full TypeScript support with typed models
- **Testability**: Easy to mock for unit tests
- **Maintainability**: Centralized database logic
- **SQL injection protection**: All queries use parameterized statements
- **Automatic mapping**: Converts between snake_case (database) and camelCase (JavaScript)

**Example repository usage:**
```typescript
import { getSuppliersRepository } from './repositories/suppliersRepo';

// Get repository instance
const repo = await getSuppliersRepository();

// Perform CRUD operations
const suppliers = await repo.findAll();
const supplier = await repo.findById(1);
const newSupplier = await repo.create({ name: 'Acme Corp', ... });
const updated = await repo.update(1, { name: 'New Name' });
await repo.delete(1);
```

**Repository location**: [`src/repositories/`](./src/repositories/)

### Error Handling Strategy

The API uses custom error types defined in [`src/utils/errors.ts`](./src/utils/errors.ts):

| Error Type | HTTP Status | Use Case |
|------------|-------------|----------|
| `DatabaseError` | 500 | General database errors |
| `NotFoundError` | 404 | Entity not found by ID |
| `ValidationError` | 400 | Invalid input data |
| `ConflictError` | 409 | Constraint violations (e.g., duplicate keys, foreign key violations) |

**Error handling flow:**
1. Repository throws a domain-specific error
2. Express error middleware catches the error
3. Middleware converts to appropriate HTTP response with status code and error details

**Example error response:**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Supplier with ID 999 not found"
  }
}
```

### Middleware Overview

The API uses the following middleware in order:

1. **CORS middleware**: Enables cross-origin requests from configured origins
2. **JSON body parser**: Parses incoming JSON request bodies
3. **Route handlers**: Entity-specific route handlers
4. **Error handler**: Centralized error handling (must be last)

### Database Layer Abstraction

The database layer is abstracted through several modules in [`src/db/`](./src/db/):

- **`sqlite.ts`**: Core database connection and query methods
- **`config.ts`**: Database configuration and environment variable handling
- **`migrate.ts`**: Migration execution and tracking
- **`seed.ts`**: Database seeding with sample data

**Key features:**
- Connection pooling and reuse
- WAL (Write-Ahead Logging) mode for better concurrency
- Foreign key constraint enforcement
- Automatic migration on startup
- In-memory mode for testing

---

## Database Management

### SQLite Database Initialization

The database is automatically initialized when you start the server for the first time:

```bash
npm run dev
```

This will:
1. Create the database file at `api/data/app.db` (or the path specified in `DB_FILE`)
2. Run all pending migrations from `sql/migrations/`
3. Seed the database with sample data (if empty)

**Manual initialization:**
```bash
# Initialize with migrations and seed data
npm run db:init

# Run migrations only
npm run db:migrate

# Seed database only
npm run db:seed
```

### Migration System

Database schema changes are managed through sequential SQL migration files in [`sql/migrations/`](./sql/migrations/).

**Migration file naming convention:**
```
NNN_description.sql
```
- `NNN`: Three-digit sequence number (e.g., `001`, `002`, `003`)
- `description`: Brief description of the migration

**Current migrations:**
- `001_init.sql`: Initial schema with all tables, indexes, and constraints

**How migrations work:**
1. Migrations are tracked in a `migrations` table
2. On startup, the system checks for pending migrations
3. Pending migrations are executed in sequential order
4. Each migration is marked as completed in the tracking table

**Creating a new migration:**
1. Create a new file: `api/sql/migrations/002_add_new_column.sql`
2. Add your SQL statements:
   ```sql
   ALTER TABLE suppliers ADD COLUMN rating INTEGER DEFAULT 5;
   ```
3. Run migrations: `npm run db:migrate`

**Best practices:**
- Never modify existing migration files (they are immutable)
- Use `IF NOT EXISTS` clauses where possible for idempotency
- Test migrations on a copy of the database before production
- Provide rollback instructions in comments if needed

### Seeding Process

Sample data is provided through seed files in [`sql/seed/`](./sql/seed/):

| File | Description |
|------|-------------|
| `001_suppliers.sql` | Supplier data |
| `002_headquarters.sql` | Headquarters data |
| `003_branches.sql` | Branch locations |
| `004_products.sql` | Product catalog |

**Seed execution order:**
Seeds are executed in numerical order to maintain referential integrity (e.g., headquarters must exist before branches).

**Running seeds manually:**
```bash
npm run db:seed
```

**Seed file structure:**
```sql
-- Example: 001_suppliers.sql
INSERT INTO suppliers (supplier_id, name, description, contact_person, email, phone)
VALUES 
  (1, 'Tech Supplies Inc', 'Electronics supplier', 'John Doe', 'john@techsupplies.com', '555-0100'),
  (2, 'Office Goods Co', 'Office equipment', 'Jane Smith', 'jane@officegoods.com', '555-0200');
```

**Important notes:**
- Seed data uses explicit IDs for deterministic, reproducible results
- When adding NOT NULL columns, update seed files accordingly
- Seeds should be minimal but illustrative for development and demos

### Test Database Configuration

For unit and integration tests, the API uses an **in-memory database** (`:memory:`):

**Benefits:**
- Fast test execution
- Isolated test environment
- No cleanup required
- No file system dependencies

**Configuration** in [`src/db/config.ts`](./src/db/config.ts):
```typescript
export const TEST_DB_CONFIG = {
  ...DB_CONFIG,
  DB_FILE: ':memory:', // In-memory database for tests
};
```

**Test setup example:**
```typescript
import { getDatabase } from '../db/sqlite';

// Use in-memory database for tests
const db = await getDatabase(true); // true = test mode
```

### Database Utilities

Utility modules in [`src/db/`](./src/db/) provide:

**`sqlite.ts`** - Database connection and query interface:
```typescript
export interface DatabaseConnection {
  run<T = any>(sql: string, params?: any[]): Promise<RunResult>;
  get<T = any>(sql: string, params?: any[]): Promise<T | undefined>;
  all<T = any>(sql: string, params?: any[]): Promise<T[]>;
  close(): Promise<void>;
}
```

**`sql.ts`** (in `utils/`) - SQL query builders:
- `buildInsertSQL()`: Generate parameterized INSERT statements
- `buildUpdateSQL()`: Generate parameterized UPDATE statements
- `objectToCamelCase()`: Convert snake_case database columns to camelCase
- `objectToSnakeCase()`: Convert camelCase objects to snake_case

---

## API Endpoints

### Swagger Documentation

The API provides comprehensive OpenAPI/Swagger documentation:

- **Swagger UI**: `http://localhost:3000/api-docs`
- **OpenAPI JSON**: `http://localhost:3000/api-docs.json`
- **Pre-generated spec**: [`api-swagger.json`](./api-swagger.json)

The Swagger UI allows you to:
- Browse all available endpoints
- View request/response schemas
- Try out API calls directly in the browser
- See example requests and responses

### Available Entity Routes

All routes are prefixed with `/api`:

| Entity | Base Route | Description |
|--------|-----------|-------------|
| **Suppliers** | `/api/suppliers` | Manage supplier information |
| **Headquarters** | `/api/headquarters` | Manage company headquarters |
| **Branches** | `/api/branches` | Manage branch locations (linked to headquarters) |
| **Products** | `/api/products` | Manage product catalog (linked to suppliers) |
| **Orders** | `/api/orders` | Manage customer orders (linked to branches) |
| **Order Details** | `/api/order-details` | Manage order line items (linked to orders and products) |
| **Deliveries** | `/api/deliveries` | Manage delivery tracking (linked to suppliers) |
| **Order Detail Deliveries** | `/api/order-detail-deliveries` | Junction table linking order details to deliveries |

**Standard CRUD operations** for most entities:
- `GET /api/{entity}` - Get all records
- `GET /api/{entity}/{id}` - Get record by ID
- `POST /api/{entity}` - Create new record
- `PUT /api/{entity}/{id}` - Update record by ID
- `DELETE /api/{entity}/{id}` - Delete record by ID

**Example API call:**
```bash
# Get all suppliers
curl http://localhost:3000/api/suppliers

# Get supplier by ID
curl http://localhost:3000/api/suppliers/1

# Create a new supplier
curl -X POST http://localhost:3000/api/suppliers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Supplier",
    "description": "Description here",
    "contactPerson": "John Doe",
    "email": "john@example.com",
    "phone": "555-1234"
  }'
```

---

## Data Models

### Entity Models

TypeScript interfaces for all entities are defined in [`src/models/`](./src/models/):

| Model File | Interface | Description |
|------------|-----------|-------------|
| `supplier.ts` | `Supplier` | Supplier information |
| `headquarters.ts` | `Headquarters` | Company headquarters |
| `branch.ts` | `Branch` | Branch locations |
| `product.ts` | `Product` | Product catalog items |
| `order.ts` | `Order` | Customer orders |
| `orderDetail.ts` | `OrderDetail` | Order line items |
| `delivery.ts` | `Delivery` | Delivery tracking |
| `orderDetailDelivery.ts` | `OrderDetailDelivery` | Order-delivery junction |

**Example model** ([`src/models/supplier.ts`](./src/models/supplier.ts)):
```typescript
export interface Supplier {
  supplierId: number;
  name: string;
  description: string;
  contactPerson: string;
  email: string;
  phone: string;
}
```

### Relationships Between Entities

The data model follows the ERD diagram in [`ERD.png`](./ERD.png):

```
Headquarters (1) ──────< (N) Branch
Branch (1) ──────< (N) Order
Order (1) ──────< (N) OrderDetail
OrderDetail (N) >────── (1) Product
Product (N) >────── (1) Supplier
Delivery (N) >────── (1) Supplier
OrderDetailDelivery (N) >────── (1) OrderDetail
OrderDetailDelivery (N) >────── (1) Delivery
```

**Key relationships:**
- A **Headquarters** can have multiple **Branches**
- A **Branch** can place multiple **Orders**
- An **Order** contains multiple **OrderDetails** (line items)
- Each **OrderDetail** references a specific **Product**
- Each **Product** is provided by a **Supplier**
- A **Supplier** provides multiple **Deliveries**
- **OrderDetailDeliveries** is a junction table linking order details to deliveries (many-to-many)

**Foreign key constraints** are enforced in the database to maintain referential integrity.

### TypeScript Interfaces

All models include:

1. **TypeScript interface** for type safety:
   ```typescript
   export interface Supplier {
     supplierId: number;
     name: string;
     // ...
   }
   ```

2. **Swagger/OpenAPI schema** for documentation:
   ```typescript
   /**
    * @swagger
    * components:
    *   schemas:
    *     Supplier:
    *       type: object
    *       properties:
    *         supplierId:
    *           type: integer
    *         name:
    *           type: string
    */
   ```

**Naming conventions:**
- **TypeScript models**: camelCase (e.g., `supplierId`, `contactPerson`)
- **Database columns**: snake_case (e.g., `supplier_id`, `contact_person`)
- Automatic conversion handled by repository layer utilities

---

## Development Guidelines

### Code Structure and Conventions

The API follows a modular, layered architecture:

```
api/
├── src/
│   ├── index.ts              # Main application entry point
│   ├── init-db.ts            # Database initialization script
│   ├── db/                   # Database layer
│   │   ├── config.ts         # Database configuration
│   │   ├── migrate.ts        # Migration runner
│   │   ├── seed.ts           # Seed data loader
│   │   └── sqlite.ts         # SQLite connection and queries
│   ├── models/               # TypeScript interfaces and Swagger schemas
│   │   ├── supplier.ts
│   │   ├── product.ts
│   │   └── ...
│   ├── repositories/         # Data access layer (repository pattern)
│   │   ├── suppliersRepo.ts
│   │   ├── productsRepo.ts
│   │   └── ...
│   ├── routes/               # Express route handlers
│   │   ├── supplier.ts
│   │   ├── product.ts
│   │   └── ...
│   └── utils/                # Shared utilities
│       ├── errors.ts         # Error types and handlers
│       └── sql.ts            # SQL query builders
├── sql/                      # SQL scripts
│   ├── migrations/           # Schema migrations
│   └── seed/                 # Seed data
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── vitest.config.ts          # Test configuration
```

**Coding conventions:**
- Use **TypeScript** for all source files
- Follow **camelCase** for variables and functions
- Follow **PascalCase** for classes and interfaces
- Use **async/await** for asynchronous operations
- Add **JSDoc comments** for public APIs
- Include **Swagger annotations** in route files
- Use **parameterized queries** to prevent SQL injection
- Handle errors using custom error types

### Adding New Endpoints

To add a new endpoint for an existing entity:

1. **Update the route file** (e.g., `src/routes/supplier.ts`):
   ```typescript
   /**
    * @swagger
    * /api/suppliers/search:
    *   get:
    *     summary: Search suppliers by name
    *     tags: [Suppliers]
    *     parameters:
    *       - in: query
    *         name: name
    *         schema:
    *           type: string
    *     responses:
    *       200:
    *         description: List of matching suppliers
    */
   router.get('/search', async (req, res, next) => {
     try {
       const { name } = req.query;
       const repo = await getSuppliersRepository();
       const suppliers = await repo.findByName(name as string);
       res.json(suppliers);
     } catch (error) {
       next(error);
     }
   });
   ```

2. **Add repository method** (e.g., `src/repositories/suppliersRepo.ts`):
   ```typescript
   async findByName(name: string): Promise<Supplier[]> {
     try {
       const sql = 'SELECT * FROM suppliers WHERE name LIKE ? ORDER BY name';
       const rows = await this.db.all<any>(sql, [`%${name}%`]);
       return rows.map((row) => objectToCamelCase(row) as Supplier);
     } catch (error) {
       handleDatabaseError(error);
     }
   }
   ```

3. **Add tests** (e.g., `src/repositories/suppliersRepo.test.ts`):
   ```typescript
   it('should find suppliers by name', async () => {
     // Test implementation
   });
   ```

### Creating New Repositories

To create a repository for a new entity:

1. **Define the model** in `src/models/newEntity.ts`:
   ```typescript
   export interface NewEntity {
     id: number;
     name: string;
     // ...
   }
   ```

2. **Create repository class** in `src/repositories/newEntityRepo.ts`:
   ```typescript
   import { getDatabase, DatabaseConnection } from '../db/sqlite';
   import { NewEntity } from '../models/newEntity';
   import { handleDatabaseError, NotFoundError } from '../utils/errors';
   import { buildInsertSQL, buildUpdateSQL, objectToCamelCase } from '../utils/sql';

   export class NewEntityRepository {
     private db: DatabaseConnection;

     constructor(db: DatabaseConnection) {
       this.db = db;
     }

     async findAll(): Promise<NewEntity[]> {
       try {
         const rows = await this.db.all<any>('SELECT * FROM new_entities');
         return rows.map((row) => objectToCamelCase(row) as NewEntity);
       } catch (error) {
         handleDatabaseError(error);
       }
     }

     async findById(id: number): Promise<NewEntity | null> {
       try {
         const row = await this.db.get<any>('SELECT * FROM new_entities WHERE id = ?', [id]);
         return row ? (objectToCamelCase(row) as NewEntity) : null;
       } catch (error) {
         handleDatabaseError(error);
       }
     }

     async create(entity: Omit<NewEntity, 'id'>): Promise<NewEntity> {
       try {
         const { sql, values } = buildInsertSQL('new_entities', entity);
         const result = await this.db.run(sql, values);
         const created = await this.findById(result.lastID!);
         if (!created) {
           throw new Error('Failed to create entity');
         }
         return created;
       } catch (error) {
         handleDatabaseError(error);
       }
     }

     async update(id: number, entity: Partial<Omit<NewEntity, 'id'>>): Promise<NewEntity> {
       try {
         const { sql, values } = buildUpdateSQL('new_entities', entity, id);
         await this.db.run(sql, values);
         const updated = await this.findById(id);
         if (!updated) {
           throw new NotFoundError('NewEntity', id);
         }
         return updated;
       } catch (error) {
         handleDatabaseError(error, 'NewEntity', id);
       }
     }

     async delete(id: number): Promise<void> {
       try {
         const result = await this.db.run('DELETE FROM new_entities WHERE id = ?', [id]);
         if (result.changes === 0) {
           throw new NotFoundError('NewEntity', id);
         }
       } catch (error) {
         handleDatabaseError(error, 'NewEntity', id);
       }
     }
   }

   export async function getNewEntityRepository(): Promise<NewEntityRepository> {
     const db = await getDatabase();
     return new NewEntityRepository(db);
   }
   ```

3. **Create route file** in `src/routes/newEntity.ts` following existing patterns

4. **Register route** in `src/index.ts`:
   ```typescript
   import newEntityRoutes from './routes/newEntity';
   app.use('/api/new-entities', newEntityRoutes);
   ```

### Testing Approach

The API uses **Vitest** for testing (configured in [`vitest.config.ts`](./vitest.config.ts)).

**Test types:**

1. **Unit tests** for repositories:
   ```typescript
   import { describe, it, expect, beforeEach, afterEach } from 'vitest';
   import { getDatabase } from '../db/sqlite';
   import { SuppliersRepository } from '../repositories/suppliersRepo';

   describe('SuppliersRepository', () => {
     let db: DatabaseConnection;
     let repo: SuppliersRepository;

     beforeEach(async () => {
       db = await getDatabase(true); // Use in-memory DB
       repo = new SuppliersRepository(db);
     });

     afterEach(async () => {
       await db.close();
     });

     it('should find all suppliers', async () => {
       const suppliers = await repo.findAll();
       expect(suppliers).toBeInstanceOf(Array);
     });
   });
   ```

2. **Integration tests** for routes:
   ```typescript
   import request from 'supertest';
   import { describe, it, expect } from 'vitest';

   describe('Supplier API', () => {
     it('should get all suppliers', async () => {
       const response = await request(app).get('/api/suppliers');
       expect(response.status).toBe(200);
       expect(response.body).toBeInstanceOf(Array);
     });
   });
   ```

**Running tests:**
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Coverage report location: api/coverage/
```

**Test best practices:**
- Use in-memory database for isolation and speed
- Clean up database connections after each test
- Test both success and error cases
- Mock external dependencies when appropriate
- Follow existing test patterns in the repository

### TypeScript Configuration

TypeScript is configured in [`tsconfig.json`](./tsconfig.json):

```json
{
  "compilerOptions": {
    "target": "ES6",
    "module": "commonjs",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Key settings:**
- **Strict mode**: Enabled for maximum type safety
- **Target**: ES6 for modern JavaScript features
- **Module**: CommonJS for Node.js compatibility
- **Output**: Compiled JavaScript goes to `dist/` directory

---

## Build and Deployment

### Build Process

The build process compiles TypeScript to JavaScript:

```bash
npm run build
```

This:
1. Runs the TypeScript compiler (`tsc`)
2. Compiles all files in `src/` to JavaScript in `dist/`
3. Preserves directory structure
4. Generates source maps (if configured)

**Build output:**
```
dist/
├── index.js
├── init-db.js
├── db/
├── models/
├── repositories/
├── routes/
└── utils/
```

### Docker Containerization

The API includes a multi-stage Dockerfile for efficient containerization:

**Dockerfile** ([`Dockerfile`](./Dockerfile)):
```dockerfile
# Stage 1: Build
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
```

**Building the Docker image:**
```bash
docker build -t octocat-api .
```

**Running the container:**
```bash
docker run -p 3000:3000 \
  -e DB_FILE=/app/data/app.db \
  -v $(pwd)/data:/app/data \
  octocat-api
```

**Using Docker Compose** (from project root):
```bash
docker-compose up api
```

### Production Considerations

Before deploying to production:

1. **Environment variables:**
   - Set `NODE_ENV=production`
   - Configure `DB_FILE` to a persistent volume
   - Restrict `API_CORS_ORIGINS` to known domains
   - Set appropriate `PORT` for your infrastructure

2. **Database:**
   - Use a persistent volume for the database file
   - Set up regular automated backups
   - Consider database replication for high availability
   - Monitor database file size and plan for growth

3. **Security:**
   - Enable HTTPS (reverse proxy like nginx or Traefik)
   - Implement rate limiting
   - Add authentication/authorization if needed
   - Review and restrict CORS origins
   - Keep dependencies updated

4. **Performance:**
   - Enable WAL mode (`DB_ENABLE_WAL=true`)
   - Use a process manager (PM2, systemd)
   - Set up horizontal scaling if needed
   - Monitor API response times and database queries

5. **Logging and Monitoring:**
   - Set up structured logging (e.g., Winston, Pino)
   - Monitor error rates and API health
   - Set up alerts for critical errors
   - Track database performance metrics

6. **Build optimization:**
   - Use `npm ci` instead of `npm install` for reproducible builds
   - Prune dev dependencies in production
   - Minify if needed (though TypeScript output is already optimized)

**Example production start script with PM2:**
```bash
pm2 start dist/index.js --name octocat-api -i max
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Database Locked Error

**Symptom**: `Error: SQLITE_BUSY: database is locked`

**Causes:**
- Long-running transactions
- Unclosed database connections
- Multiple processes accessing the same database file

**Solutions:**
- Ensure all database operations use `await` properly
- Close database connections when done
- Enable WAL mode: `DB_ENABLE_WAL=true`
- Increase timeout: `DB_TIMEOUT=60000`

#### 2. Foreign Key Constraint Errors

**Symptom**: `Error: FOREIGN KEY constraint failed`

**Causes:**
- Trying to insert a record that references a non-existent parent
- Trying to delete a parent record that has dependent children
- Foreign keys not enabled

**Solutions:**
- Verify that referenced records exist before insertion
- Delete dependent records first, or use `ON DELETE CASCADE`
- Ensure foreign keys are enabled: `DB_FOREIGN_KEYS=true`
- Check the database schema for relationship constraints

#### 3. Migration Fails to Run

**Symptom**: Migrations don't execute or produce SQL errors

**Causes:**
- SQL syntax errors in migration file
- Migration file not properly named
- Conflicting schema changes

**Solutions:**
- Validate SQL syntax before running migration
- Check migration file naming: `NNN_description.sql`
- Test migration on a database backup first
- Review migration order and dependencies

#### 4. Port Already in Use

**Symptom**: `Error: listen EADDRINUSE: address already in use :::3000`

**Causes:**
- Another process is using port 3000
- Previous server instance not properly shut down

**Solutions:**
- Find and kill the process: `lsof -ti:3000 | xargs kill -9`
- Use a different port: `PORT=3001 npm run dev`
- Check for zombie Node processes

#### 5. Module Not Found Errors

**Symptom**: `Error: Cannot find module './dist/index.js'`

**Causes:**
- TypeScript not compiled
- Build output missing

**Solutions:**
- Run build first: `npm run build`
- Verify `dist/` directory exists
- Check TypeScript compilation errors

#### 6. CORS Errors in Browser

**Symptom**: `Access-Control-Allow-Origin` error in browser console

**Causes:**
- Frontend origin not in allowed CORS origins
- CORS middleware misconfigured

**Solutions:**
- Add frontend URL to `API_CORS_ORIGINS` environment variable
- Check CORS configuration in `src/index.ts`
- Verify the request includes proper headers

### Debug Tips

**Enable verbose logging:**
```bash
NODE_ENV=development npm run dev
```

**Check database queries:**
Add logging to SQL queries in `src/db/sqlite.ts`:
```typescript
console.log('Executing SQL:', sql, params);
```

**Inspect the database:**
```bash
# Open SQLite shell
sqlite3 api/data/app.db

# List tables
.tables

# View table schema
.schema suppliers

# Query data
SELECT * FROM suppliers;

# Exit
.quit
```

**Test individual endpoints:**
```bash
# Use curl for quick tests
curl -v http://localhost:3000/api/suppliers

# Or use tools like Postman, Insomnia, or HTTPie
```

**Debug TypeScript compilation:**
```bash
# Check for TypeScript errors
npx tsc --noEmit

# Watch mode for continuous compilation
npx tsc --watch
```

**Check environment variables:**
```bash
# Print all environment variables
node -e "console.log(process.env)"

# Check specific variable
node -e "console.log(process.env.DB_FILE)"
```

### Log Locations

**Console output:**
- Development: stdout/stderr (visible in terminal)
- Production: redirect to log files or logging service

**Database logs:**
- SQLite doesn't have separate log files
- Enable query logging in code for debugging

**Application logs:**
- Error logs: Captured by Express error middleware
- Request logs: Can add Morgan middleware for HTTP request logging

**Test output:**
- Test results: stdout when running `npm test`
- Coverage reports: `api/coverage/` directory

**Production logging recommendations:**
- Use a logging library like Winston or Pino
- Configure log rotation to prevent disk space issues
- Send logs to a centralized logging service (e.g., CloudWatch, Datadog, Logstash)
- Set up structured logging with request IDs for tracing

---

## Additional Resources

- **Architecture Overview**: [`../docs/architecture.md`](../docs/architecture.md)
- **SQLite Integration Guide**: [`../docs/sqlite-integration.md`](../docs/sqlite-integration.md)
- **API Code Guidelines**: [`../.github/instructions/api.instructions.md`](../.github/instructions/api.instructions.md)
- **Entity Relationship Diagram**: [`ERD.png`](./ERD.png)
- **OpenAPI Specification**: [`api-swagger.json`](./api-swagger.json)
- **Main Repository README**: [`../README.md`](../README.md)

---

## Contributing

When contributing to the API:

1. Follow the [Development Guidelines](#development-guidelines)
2. Review the [API Code Guidelines](../.github/instructions/api.instructions.md)
3. Add tests for new features
4. Update Swagger documentation
5. Update this README if adding new sections or significant features
6. Run linting and tests before submitting: `npm run build && npm test`

---

## License

MIT License - See the main repository LICENSE file for details.
