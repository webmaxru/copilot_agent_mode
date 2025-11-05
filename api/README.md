# OctoCAT Supply Chain API

REST API for the OctoCAT Supply Chain Management System, built with Express.js, TypeScript, and SQLite.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 8+

### Installation & Setup

1. **Install dependencies** (from the repository root):
   ```bash
   npm install
   ```

2. **Build the API**:
   ```bash
   npm run build --workspace=api
   ```

3. **Initialize the database** (runs migrations and seeds):
   ```bash
   npm run db:init --workspace=api
   ```

4. **Start the development server**:
   ```bash
   npm run dev --workspace=api
   ```

The API will be available at `http://localhost:3000`.

### Access the Documentation
Once running, visit:
- **Swagger UI**: http://localhost:3000/api-docs
- **OpenAPI JSON**: http://localhost:3000/api-docs.json

## 📋 Architecture & Design Patterns

### Repository Pattern
The API uses the Repository pattern to abstract database operations:

```typescript
// Example: Using the Suppliers Repository
import { getSuppliersRepository } from './repositories/suppliersRepo';

const repo = await getSuppliersRepository();
const suppliers = await repo.findAll();
const supplier = await repo.findById(1);
```

**Benefits:**
- Type-safe database operations
- Consistent error handling
- SQL injection protection via parameterized queries
- Easy testing with mock repositories

### Routes & Controllers
Routes are thin controllers that handle:
- Request validation
- Business logic orchestration
- Response formatting

Complex logic lives in repository methods, not route handlers.

### Entity Model
The API manages supply chain entities following this ERD:

```
Headquarters ──< Branch ──< Order ──< OrderDetail >── Product
                                           │
                                           └─< OrderDetailDelivery >── Delivery ──> Supplier
```

See [Architecture Documentation](../docs/architecture.md) for detailed ERD diagrams.

## 🔧 Environment Variables & Configuration

The API supports the following environment variables:

### Server Configuration
| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP server port |
| `API_CORS_ORIGINS` | See below | Comma-separated list of allowed CORS origins |
| `NODE_ENV` | - | Set to `development` for verbose logging |

**Default CORS origins:**
- `http://localhost:5137`
- `http://localhost:3001`
- All GitHub Codespace domains (`*.app.github.dev`)

### Database Configuration
| Variable | Default | Description |
|----------|---------|-------------|
| `DB_FILE` | `./data/app.db` | SQLite database file path (absolute or relative to `api/`) |
| `DB_ENGINE` | `sqlite` | Database engine (currently only SQLite supported) |
| `DB_ENABLE_WAL` | `true` | Enable Write-Ahead Logging for better concurrency |
| `DB_TIMEOUT` | `30000` | Connection timeout in milliseconds |
| `DB_FOREIGN_KEYS` | `true` | Enable foreign key constraints |

### Testing Configuration
| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `test` | Automatically uses in-memory database |
| `VITEST` | `true` | Set by Vitest test runner |

### Example Configuration

Create a `.env` file in the `api/` directory:

```bash
# Server
PORT=3001
NODE_ENV=development

# Database
DB_FILE=/absolute/path/to/my-app.db
DB_ENABLE_WAL=true

# CORS
API_CORS_ORIGINS=http://localhost:3001,http://localhost:5173
```

## 🛡️ Error Handling

The API uses custom error classes with appropriate HTTP status codes:

### Error Types

| Error Class | Status Code | When to Use |
|-------------|-------------|-------------|
| `NotFoundError` | 404 | Entity not found by ID |
| `ValidationError` | 400 | Invalid input data or constraints |
| `ConflictError` | 409 | Unique constraint violations |
| `DatabaseError` | 500 | Generic database errors |

### Error Response Format

All errors follow a consistent JSON structure:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Supplier with ID 999 not found"
  }
}
```

### Example Error Scenarios

**404 Not Found:**
```bash
GET /api/suppliers/999
```
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Supplier with ID 999 not found"
  }
}
```

**400 Validation Error:**
```bash
POST /api/suppliers
{
  "name": "",
  "email": "invalid-email"
}
```
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation error: Name is required"
  }
}
```

**409 Conflict:**
```bash
POST /api/branches
{
  "headquarterId": 999
}
```
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation error: Invalid reference to related entity"
  }
}
```

### Error Handling in Code

```typescript
import { NotFoundError, ValidationError } from './utils/errors';

// Throw specific errors
if (!supplier) {
  throw new NotFoundError('Supplier', id);
}

if (!data.name) {
  throw new ValidationError('Name is required');
}
```

## 🧪 Testing Guide

### Running Tests

```bash
# Run all tests
npm run test --workspace=api

# Run with coverage
npm run test:coverage --workspace=api

# Watch mode (for development)
npm run test --workspace=api -- --watch
```

### Test Structure

The API uses **Vitest** for testing with:
- **Unit tests**: Repository methods with in-memory database
- **Integration tests**: Route handlers with Supertest

### Example Test

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../index';

describe('Suppliers API', () => {
  it('should return all suppliers', async () => {
    const response = await request(app)
      .get('/api/suppliers')
      .expect(200);
    
    expect(response.body).toBeInstanceOf(Array);
  });
});
```

### Testing with Seed Data

Tests use an in-memory database that's automatically seeded. You can reference seed data IDs:

```typescript
// Seed data has supplier IDs 1, 2, 3
const response = await request(app)
  .get('/api/suppliers/1')
  .expect(200);

expect(response.body.name).toBe('PurrTech Innovations');
```

## 📊 Database Management

### Schema Migrations

Migrations are SQL files in `sql/migrations/` executed sequentially:

```
sql/migrations/
  └── 001_init.sql          # Initial schema
```

**Creating a new migration:**
1. Create file: `002_add_column.sql`
2. Add SQL statements
3. Run migrations: `npm run db:migrate --workspace=api`

**Important:** Never modify existing migration files. Always create new ones.

### Seed Data

Seed files in `sql/seed/` provide sample data for development and demos:

```
sql/seed/
  ├── 001_suppliers.sql
  ├── 002_headquarters.sql
  ├── 003_branches.sql
  └── 004_products.sql
```

**Reseed database:**
```bash
# Drop and recreate with fresh seed data
npm run db:init --workspace=api -- --seed
```

### Database Tools

```bash
# Run migrations only
npm run db:migrate --workspace=api

# Seed only (doesn't drop existing data)
npm run db:seed --workspace=api

# Full reset (migrations + seed)
npm run db:init --workspace=api
```

### Backup & Restore

SQLite stores everything in a single file:

```bash
# Backup
cp api/data/app.db api/data/backup-$(date +%Y%m%d).db

# Restore
cp api/data/backup-20231225.db api/data/app.db
```

See [SQLite Integration Guide](../docs/sqlite-integration.md) for detailed database documentation.

## 🔍 API Reference

### Available Endpoints

All endpoints are prefixed with `/api`:

| Entity | Endpoints |
|--------|-----------|
| **Suppliers** | `GET/POST /api/suppliers`, `GET/PUT/DELETE /api/suppliers/:id` |
| **Products** | `GET/POST /api/products`, `GET/PUT/DELETE /api/products/:id` |
| **Headquarters** | `GET/POST /api/headquarters`, `GET/PUT/DELETE /api/headquarters/:id` |
| **Branches** | `GET/POST /api/branches`, `GET/PUT/DELETE /api/branches/:id` |
| **Orders** | `GET/POST /api/orders`, `GET/PUT/DELETE /api/orders/:id` |
| **Order Details** | `GET/POST /api/order-details`, `GET/PUT/DELETE /api/order-details/:id` |
| **Deliveries** | `GET/POST /api/deliveries`, `GET/PUT/DELETE /api/deliveries/:id` |
| **Order Detail Deliveries** | `GET/POST /api/order-detail-deliveries`, `GET/PUT/DELETE /api/order-detail-deliveries/:id` |

### Example API Calls

**Get all suppliers:**
```bash
curl http://localhost:3000/api/suppliers
```

**Get specific supplier:**
```bash
curl http://localhost:3000/api/suppliers/1
```

**Create a new supplier:**
```bash
curl -X POST http://localhost:3000/api/suppliers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MeowTech Solutions",
    "description": "Innovative cat technology provider",
    "contactPerson": "Jane Doe",
    "email": "jane@meowtech.com",
    "phone": "555-1234"
  }'
```

**Update a supplier:**
```bash
curl -X PUT http://localhost:3000/api/suppliers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "PurrTech Innovations Inc.",
    "description": "Premium smart cat technology leader"
  }'
```

**Delete a supplier:**
```bash
curl -X DELETE http://localhost:3000/api/suppliers/1
```

For complete request/response schemas and examples, see the [Swagger Documentation](http://localhost:3000/api-docs).

## 🔗 Frontend Integration

### Connecting from the Frontend

The frontend connects via environment variables:

```typescript
// frontend/.env
VITE_API_URL=http://localhost:3000
```

### Example Integration

```typescript
// Fetch suppliers
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/suppliers`);
const suppliers = await response.json();

// Create a new order
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    branchId: 1,
    orderDate: new Date().toISOString(),
    status: 'pending'
  })
});
```

### CORS Configuration

The API is pre-configured to accept requests from:
- `http://localhost:5137` (Vite default)
- `http://localhost:3001`
- All GitHub Codespaces domains

To add more origins:
```bash
export API_CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

## 🛠️ Development Workflow

### 1. Local Development

```bash
# Terminal 1: Start API in watch mode
npm run dev --workspace=api

# Terminal 2: Run tests in watch mode
npm run test --workspace=api -- --watch
```

### 2. Making Changes

1. **Modify routes** in `src/routes/*.ts`
2. **Update Swagger docs** via JSDoc comments
3. **Add tests** for new functionality
4. **Run linter/build** before committing

### 3. Adding a New Endpoint

Example: Add a search endpoint for products

1. **Update route file** (`src/routes/product.ts`):
```typescript
/**
 * @swagger
 * /api/products/search:
 *   get:
 *     summary: Search products by name
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Matching products
 */
router.get('/search', async (req, res, next) => {
  // Implementation
});
```

2. **Add repository method** if needed
3. **Write tests**
4. **Verify Swagger UI** updates

### 4. Database Schema Changes

1. Create new migration: `sql/migrations/002_add_feature.sql`
2. Update models if needed
3. Adjust seed data if schema requires it
4. Test with: `npm run db:init --workspace=api`

## 🐛 Troubleshooting

### Common Issues

#### Database Locked Error
**Symptom:** `SQLITE_BUSY: database is locked`

**Solutions:**
- Ensure no other process is accessing the database
- Check for unclosed database connections in code
- Verify WAL mode is enabled: `DB_ENABLE_WAL=true`

#### Port Already in Use
**Symptom:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions:**
```bash
# Find the process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 npm run dev --workspace=api
```

#### Foreign Key Constraint Error
**Symptom:** `SQLITE_CONSTRAINT: FOREIGN KEY constraint failed`

**Solutions:**
- Ensure referenced entities exist before creating relationships
- Check seed data order (suppliers before products, headquarters before branches, etc.)
- Verify foreign keys are enabled: `DB_FOREIGN_KEYS=true`

#### Missing Migration Errors
**Symptom:** `table does not exist`

**Solutions:**
```bash
# Reinitialize database
rm -f api/data/app.db
npm run db:init --workspace=api
```

#### CORS Errors in Frontend
**Symptom:** `Access to fetch at 'http://localhost:3000' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Solutions:**
```bash
# Add your frontend origin
export API_CORS_ORIGINS=http://localhost:5173
npm run dev --workspace=api
```

### Debug Mode

Enable verbose logging:
```bash
NODE_ENV=development npm run dev --workspace=api
```

This shows:
- All SQL queries
- Database connection details
- Detailed error traces

### Health Check

Test if the API is running:
```bash
curl http://localhost:3000/
# Expected: "Hello, world!"
```

## 📚 Related Documentation

- [Architecture Overview](../docs/architecture.md) - High-level system design
- [SQLite Integration](../docs/sqlite-integration.md) - Database details and patterns
- [API Instructions](../.github/instructions/api.instructions.md) - Code review guidelines
- [Database Instructions](../.github/instructions/database.instructions.md) - Schema guidelines
- [Root README](../README.md) - Project overview and setup

## 🎯 Best Practices

### Code Style
- Use TypeScript strict mode
- Prefer `async/await` over callbacks
- Keep routes thin (< 30 lines)
- Extract complex logic to repository methods

### Security
- Always use parameterized SQL queries
- Validate input before database operations
- Don't expose internal error details in production
- Use environment variables for sensitive configuration

### Performance
- Avoid N+1 queries (use JOINs when fetching related data)
- Add indexes for frequently queried columns
- Limit query results with pagination
- Use WAL mode for better concurrency

### Testing
- Write tests for new repository methods
- Use in-memory database for unit tests
- Test error scenarios, not just happy paths
- Maintain >80% code coverage

## 🤝 Contributing

When making changes:

1. Follow the [API Instructions](../.github/instructions/api.instructions.md)
2. Update Swagger docs for any endpoint changes
3. Add tests for new functionality
4. Update migration files for schema changes
5. Keep documentation in sync with code changes

---

*Built with TypeScript, Express.js, and SQLite. Created to demonstrate GitHub Copilot capabilities.*
