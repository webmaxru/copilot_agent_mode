# API Architecture Documentation

## Overview

The OctoCAT Supply Chain Management API is built using a **layered architecture** pattern with clear separation of concerns. This document describes the architecture, design patterns, and best practices used throughout the API layer.

## Architectural Layers

```
┌─────────────────────────────────────┐
│         Routes Layer                │  ← HTTP Request/Response handling
│  (Express.js Route Handlers)        │     Input validation, error routing
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Repository Layer               │  ← Data access and business logic
│  (Data Access Objects)              │     SQL query construction
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│       Database Layer                │  ← SQLite persistence
│  (SQLite Connection & Queries)      │     Schema, migrations, indexes
└─────────────────────────────────────┘
```

### 1. Routes Layer (`src/routes/`)

**Responsibilities:**
- Handle HTTP requests and responses
- Route validation and parameter extraction
- Delegate business logic to repositories
- Format responses and handle errors
- Apply middleware (CORS, error handling, etc.)

**Example:**
```typescript
// src/routes/supplier.ts
router.post('/', async (req, res, next) => {
  try {
    const repo = await getSuppliersRepository();
    const newSupplier = await repo.create(req.body as Omit<Supplier, 'supplierId'>);
    res.status(201).json(newSupplier);
  } catch (error) {
    next(error);
  }
});
```

**Key Principles:**
- Routes should be thin - focus on HTTP concerns only
- All business logic belongs in repositories
- Always use try/catch and pass errors to `next()`
- Use appropriate HTTP status codes (201 for created, 204 for deleted, etc.)

### 2. Repository Layer (`src/repositories/`)

**Responsibilities:**
- Execute database queries using parameterized SQL
- Transform data between database (snake_case) and JavaScript (camelCase)
- Implement domain-specific query methods
- Handle database errors and throw appropriate exceptions
- Provide abstraction over raw SQL

**Example:**
```typescript
// src/repositories/suppliersRepo.ts
export class SuppliersRepository {
  async findAll(): Promise<Supplier[]> {
    const rows = await this.db.all<any>('SELECT * FROM suppliers ORDER BY supplier_id');
    return rows.map((row) => objectToCamelCase(row) as Supplier);
  }
  
  async create(supplier: Omit<Supplier, 'supplierId'>): Promise<Supplier> {
    const { sql, values } = buildInsertSQL('suppliers', supplier);
    const result = await this.db.run(sql, values);
    return await this.findById(result.lastID!);
  }
}
```

**Key Principles:**
- All SQL queries must use parameterized statements (no string concatenation)
- Repositories should not know about HTTP or Express
- Transform database rows to domain models (camelCase)
- Use utility functions (`buildInsertSQL`, `buildUpdateSQL`, `objectToCamelCase`)
- Throw domain-specific errors (`NotFoundError`, `ValidationError`, etc.)

### 3. Database Layer (`src/db/`)

**Responsibilities:**
- Manage SQLite database connection
- Execute migrations on startup
- Provide connection pooling/singleton pattern
- Configure database settings (WAL mode, foreign keys, etc.)
- Seed initial data for development/demo

**Key Principles:**
- Use WAL mode for better concurrency
- Foreign keys must be enabled
- Migrations are immutable and sequential
- Test mode uses in-memory database (`:memory:`)

## Error Handling Strategy

### Custom Error Types

The API uses a hierarchy of custom error types for consistent error handling:

```typescript
DatabaseError (base class)
├── NotFoundError        → 404 status
├── ValidationError      → 400 status
└── ConflictError        → 409 status
```

### Error Flow

```
Repository throws error
        ↓
Route catches error and calls next(error)
        ↓
Express errorHandler middleware
        ↓
JSON error response with appropriate status code
```

### Example Error Handling

```typescript
// In repository
if (result.changes === 0) {
  throw new NotFoundError('Supplier', id);
}

// In route
router.delete('/:id', async (req, res, next) => {
  try {
    const repo = await getSuppliersRepository();
    await repo.delete(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);  // Passed to error middleware
  }
});

// Error middleware converts to HTTP response
export function errorHandler(error: any, req: any, res: any, next: any) {
  if (error instanceof DatabaseError) {
    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
  }
  // ... handle other errors
}
```

## Request/Response Flow

### Typical Request Flow

1. **HTTP Request arrives** at Express server
2. **CORS middleware** validates origin and headers
3. **Route handler** extracts parameters and validates input
4. **Repository method** is called to perform database operation
5. **Database query** executes with parameterized SQL
6. **Result transformation** converts snake_case to camelCase
7. **HTTP Response** sent with appropriate status code and JSON body

### Error Flow

1. **Exception thrown** in repository or route
2. **Error caught** by try/catch in route handler
3. **Error passed** to `next(error)`
4. **Error middleware** catches and converts to HTTP response
5. **Client receives** JSON error with status code and message

## Middleware

### Current Middleware Stack

1. **CORS** - Cross-origin resource sharing configuration
2. **express.json()** - Parse JSON request bodies
3. **Route handlers** - Handle specific endpoints
4. **Error handler** - Convert errors to HTTP responses
5. **Swagger UI** - Serve API documentation

### Adding New Middleware

Place middleware before route handlers in `src/index.ts`:

```typescript
app.use(cors());
app.use(express.json());
// Add your middleware here
app.use('/api/suppliers', suppliersRouter);
// Error handler must be last
app.use(errorHandler);
```

## Data Model Conventions

### Naming Conventions

| Layer      | Convention   | Example               |
|------------|--------------|---------------------- |
| Database   | snake_case   | `supplier_id`, `contact_person` |
| TypeScript | camelCase    | `supplierId`, `contactPerson` |
| HTTP URLs  | kebab-case   | `/api/order-details` |

### Type Definitions

All entities have corresponding TypeScript interfaces in `src/models/`:

```typescript
// src/models/supplier.ts
export interface Supplier {
  supplierId: number;
  name: string;
  description?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
}
```

### Omit Pattern for Creation

When creating new entities, use `Omit` to exclude auto-generated IDs:

```typescript
const newSupplier: Omit<Supplier, 'supplierId'> = {
  name: 'New Supplier',
  email: 'contact@example.com'
};
```

## Repository Pattern Benefits

### Why We Use Repositories

1. **Separation of Concerns** - Routes don't know about SQL
2. **Testability** - Easy to mock database for unit tests
3. **Reusability** - Repository methods can be used across multiple routes
4. **Type Safety** - Strong typing for database operations
5. **Maintainability** - SQL queries centralized in one place
6. **Security** - Enforces parameterized queries preventing SQL injection

### Repository Singleton Pattern

Repositories use a singleton pattern to avoid creating multiple database connections:

```typescript
let suppliersRepo: SuppliersRepository | null = null;

export async function getSuppliersRepository(): Promise<SuppliersRepository> {
  if (!suppliersRepo) {
    suppliersRepo = await createSuppliersRepository(false);
  }
  return suppliersRepo;
}
```

In test mode, a new instance is created for each test to ensure isolation.

## SQL Injection Prevention

All database queries use parameterized statements:

```typescript
// ✅ SAFE - Parameterized query
const supplier = await db.get('SELECT * FROM suppliers WHERE supplier_id = ?', [id]);

// ❌ UNSAFE - String concatenation
const supplier = await db.get(`SELECT * FROM suppliers WHERE supplier_id = ${id}`);
```

The repository layer enforces this pattern through utility functions:

```typescript
const { sql, values } = buildInsertSQL('suppliers', supplier);
// sql: "INSERT INTO suppliers (name, email) VALUES (?, ?)"
// values: ["Acme Corp", "contact@acme.com"]
```

## Performance Considerations

### Database Indexes

Key indexes are created in migrations for frequently queried columns:

```sql
CREATE INDEX idx_branches_headquarters_id ON branches(headquarters_id);
CREATE INDEX idx_products_supplier_id ON products(supplier_id);
CREATE INDEX idx_products_sku ON products(sku);
```

### Query Optimization

- Use `SELECT *` only when all columns are needed
- Add indexes for foreign keys and frequently filtered columns
- Use `LIMIT` for pagination to avoid loading large datasets
- Leverage SQLite query planner with `EXPLAIN QUERY PLAN`

### Avoiding N+1 Queries

When fetching related data, use JOINs instead of multiple queries:

```typescript
// ❌ N+1 problem
const branches = await branchRepo.findAll();
for (const branch of branches) {
  branch.headquarters = await hqRepo.findById(branch.headquartersId);
}

// ✅ Single query with JOIN
const branches = await db.all(`
  SELECT b.*, h.name as hq_name 
  FROM branches b 
  JOIN headquarters h ON b.headquarters_id = h.headquarters_id
`);
```

## Testing Strategy

### Unit Tests

Repository methods are tested with in-memory SQLite database:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createSuppliersRepository } from './suppliersRepo';

describe('SuppliersRepository', () => {
  it('should create a new supplier', async () => {
    const repo = await createSuppliersRepository(true); // true = test mode
    const supplier = await repo.create({ name: 'Test Supplier' });
    expect(supplier.supplierId).toBeDefined();
  });
});
```

### Integration Tests

Route tests use `supertest` to test the full HTTP stack:

```typescript
import request from 'supertest';
import app from '../index';

describe('Supplier API', () => {
  it('GET /api/suppliers should return all suppliers', async () => {
    const response = await request(app).get('/api/suppliers');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
```

## API Versioning Strategy

### Current Approach

The API currently does not implement versioning. All endpoints are at `/api/*`.

### Future Versioning

When breaking changes are needed, consider:

1. **URL-based versioning**: `/api/v1/suppliers`, `/api/v2/suppliers`
2. **Header-based versioning**: `Accept: application/vnd.api+json;version=2`
3. **Query parameter**: `/api/suppliers?version=2`

Recommendation: Use URL-based versioning for simplicity and discoverability.

## Security Best Practices

### Current Security Measures

1. **Parameterized Queries** - Prevents SQL injection
2. **CORS Configuration** - Restricts cross-origin requests
3. **Error Hiding** - Production mode hides internal errors
4. **Foreign Key Constraints** - Maintains referential integrity
5. **Input Validation** - TypeScript types provide basic validation

### Future Security Enhancements

- [ ] Authentication (JWT, OAuth)
- [ ] Authorization (role-based access control)
- [ ] Rate limiting
- [ ] Request size limits
- [ ] Helmet.js security headers
- [ ] Input sanitization and validation library (e.g., Zod, Joi)

## Extending the API

### Adding a New Entity

Follow these steps to add a new entity to the API:

1. **Add migration** in `sql/migrations/` with table schema
2. **Create model** in `src/models/` with TypeScript interface
3. **Create repository** in `src/repositories/` with CRUD methods
4. **Create routes** in `src/routes/` with HTTP handlers
5. **Add Swagger docs** using JSDoc comments in routes
6. **Register route** in `src/index.ts`
7. **Add seed data** (optional) in `sql/seed/`
8. **Write tests** for repository and routes

See [API Development Guide](./api-development.md) for detailed step-by-step instructions.

## Related Documentation

- [Database Schema and Integration](./sqlite-integration.md) - SQLite setup, migrations, seeding
- [Repository Patterns](./repository-patterns.md) - Data access patterns and examples
- [API Development Guide](./api-development.md) - Step-by-step guide for adding features
- [Overall Architecture](./architecture.md) - Full system architecture overview

## API Documentation

Interactive API documentation is available at:
- **Swagger UI**: `http://localhost:3000/api-docs` (when server is running)
- **OpenAPI Spec**: `api/api-swagger.json`
