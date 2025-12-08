# OctoCAT Supply Chain Management API

A RESTful API for managing supply chain operations including suppliers, products, orders, deliveries, and branch locations. Built with Express.js, TypeScript, and SQLite.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone https://github.com/webmaxru/copilot_agent_mode.git
   cd copilot_agent_mode
   ```

2. **Install dependencies** from the repository root:
   ```bash
   npm install
   ```

3. **Build the API**:
   ```bash
   npm run build --workspace=api
   ```

### Running the API

#### Development Mode (with auto-reload)

```bash
npm run dev --workspace=api
```

The API will start on `http://localhost:3000` with:
- API endpoints at `http://localhost:3000/api/*`
- Swagger documentation at `http://localhost:3000/api-docs`
- JSON OpenAPI spec at `http://localhost:3000/api-docs.json`

#### Production Mode

```bash
# Build first
npm run build --workspace=api

# Start the server
npm start --workspace=api
```

### Database Initialization

The database is automatically initialized on first startup. To manually manage the database:

```bash
# Initialize database with migrations and seed data
npm run db:init --workspace=api

# Run migrations only (no seeding)
npm run db:migrate --workspace=api

# Seed database only
npm run db:seed --workspace=api
```

## ⚙️ Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `DB_FILE` | `./data/app.db` | SQLite database file path (absolute or relative to api/) |
| `DB_ENGINE` | `sqlite` | Database engine type |
| `DB_ENABLE_WAL` | `true` | Enable Write-Ahead Logging for better concurrency |
| `DB_TIMEOUT` | `30000` | Database connection timeout (ms) |
| `DB_FOREIGN_KEYS` | `true` | Enable foreign key constraints |
| `API_CORS_ORIGINS` | (see below) | Comma-separated list of allowed CORS origins |

**Default CORS Origins:**
- `http://localhost:5137` (frontend dev server)
- `http://localhost:3001`
- All GitHub Codespaces domains (`*.app.github.dev`)

**Example Configuration:**

```bash
# .env file or shell export
export PORT=3001
export DB_FILE=/path/to/custom/database.db
export API_CORS_ORIGINS=http://localhost:3000,http://example.com
```

## 🧪 Running Tests

### Run All Tests

```bash
npm test --workspace=api
```

### Run Tests with Coverage

```bash
npm run test:coverage --workspace=api
```

Tests use an in-memory SQLite database (`:memory:`) for isolation and speed.

## 📁 Project Structure

```
api/
├── src/
│   ├── index.ts              # Express app setup and server entry point
│   ├── init-db.ts            # Database initialization script
│   ├── seedData.ts           # Legacy seed data (replaced by SQL files)
│   ├── db/
│   │   ├── config.ts         # Database configuration
│   │   ├── migrate.ts        # Migration runner
│   │   ├── seed.ts           # Seed data loader
│   │   └── sqlite.ts         # SQLite database connection
│   ├── models/               # TypeScript entity models
│   │   ├── branch.ts
│   │   ├── delivery.ts
│   │   ├── headquarters.ts
│   │   ├── order.ts
│   │   ├── orderDetail.ts
│   │   ├── orderDetailDelivery.ts
│   │   ├── product.ts
│   │   └── supplier.ts
│   ├── repositories/         # Data access layer (Repository pattern)
│   │   ├── branchesRepo.ts
│   │   ├── deliveriesRepo.ts
│   │   ├── headquartersRepo.ts
│   │   ├── orderDetailsRepo.ts
│   │   ├── orderDetailDeliveriesRepo.ts
│   │   ├── ordersRepo.ts
│   │   ├── productsRepo.ts
│   │   └── suppliersRepo.ts
│   ├── routes/               # Express route handlers
│   │   ├── branch.ts
│   │   ├── delivery.ts
│   │   ├── headquarters.ts
│   │   ├── order.ts
│   │   ├── orderDetail.ts
│   │   ├── orderDetailDelivery.ts
│   │   ├── product.ts
│   │   └── supplier.ts
│   └── utils/
│       ├── errors.ts         # Custom error types and error handling middleware
│       └── sql.ts            # SQL query builders and utilities
├── sql/
│   ├── migrations/           # Database schema migrations
│   │   └── 001_init.sql
│   └── seed/                 # Initial seed data SQL files
│       ├── 001_suppliers.sql
│       ├── 002_headquarters.sql
│       ├── 003_branches.sql
│       └── 004_products.sql
├── data/                     # SQLite database files (gitignored)
├── api-swagger.json          # OpenAPI 3.0 specification
├── package.json              # Project dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── vitest.config.ts          # Test configuration
```

## 🔌 API Endpoints

### Quick Reference

| Entity | Endpoint | Methods | Description |
|--------|----------|---------|-------------|
| **Suppliers** | `/api/suppliers` | GET, POST | Manage suppliers |
| | `/api/suppliers/:id` | GET, PUT, DELETE | Single supplier operations |
| **Headquarters** | `/api/headquarters` | GET, POST | Manage headquarters |
| | `/api/headquarters/:id` | GET, PUT, DELETE | Single headquarters operations |
| **Branches** | `/api/branches` | GET, POST | Manage branch locations |
| | `/api/branches/:id` | GET, PUT, DELETE | Single branch operations |
| **Products** | `/api/products` | GET, POST | Manage product catalog |
| | `/api/products/:id` | GET, PUT, DELETE | Single product operations |
| **Orders** | `/api/orders` | GET, POST | Manage orders |
| | `/api/orders/:id` | GET, PUT, DELETE | Single order operations |
| **Order Details** | `/api/order-details` | GET, POST | Manage order line items |
| | `/api/order-details/:id` | GET, PUT, DELETE | Single order detail operations |
| **Deliveries** | `/api/deliveries` | GET, POST | Manage deliveries |
| | `/api/deliveries/:id` | GET, PUT, DELETE | Single delivery operations |
| **Order Detail Deliveries** | `/api/order-detail-deliveries` | GET, POST | Manage order-delivery relationships |
| | `/api/order-detail-deliveries/:id` | GET, PUT, DELETE | Single relationship operations |

### Complete Documentation

For detailed endpoint documentation with request/response examples, visit the **Swagger UI**:

👉 **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)** (when running locally)

Or view the OpenAPI specification: `api-swagger.json`

## 🏗️ Architecture Overview

### Repository Pattern

The API uses the **Repository Pattern** for data access, providing:

- **Separation of concerns**: Routes handle HTTP, repositories handle data
- **Type safety**: Full TypeScript support with strong typing
- **Testability**: Easy to mock for unit tests
- **Consistency**: Standardized data access patterns across all entities

**Example Usage:**

```typescript
import { getBranchesRepository } from './repositories/branchesRepo';

// Get repository instance
const repo = await getBranchesRepository();

// Fetch all branches
const branches = await repo.findAll();

// Find by ID
const branch = await repo.findById(1);

// Create new entity
const newBranch = await repo.create({
  headquartersId: 1,
  name: 'New Branch',
  address: '123 Main St',
  // ...
});

// Update entity
const updated = await repo.update(1, { name: 'Updated Name' });

// Delete entity
await repo.delete(1);
```

### Error Handling

The API uses custom error types that automatically map to HTTP status codes:

| Error Type | HTTP Status | Usage |
|------------|-------------|-------|
| `NotFoundError` | 404 | Entity not found by ID |
| `ValidationError` | 400 | Invalid request data |
| `ConflictError` | 409 | Constraint violation (e.g., foreign key) |
| `DatabaseError` | 500 | General database errors |

**Example:**

```typescript
// In repository
if (!entity) {
  throw new NotFoundError('Branch not found');
}

// In route - error middleware handles it automatically
router.get('/:id', async (req, res, next) => {
  try {
    const repo = await getBranchesRepository();
    const branch = await repo.findById(parseInt(req.params.id));
    if (!branch) {
      throw new NotFoundError('Branch not found');
    }
    res.json(branch);
  } catch (error) {
    next(error); // Handled by errorHandler middleware
  }
});
```

### Database Schema

The database follows the Entity-Relationship Diagram:

```
Headquarters (1) ──→ (N) Branches
Suppliers (1) ──→ (N) Products
Suppliers (1) ──→ (N) Deliveries
Branches (1) ──→ (N) Orders
Orders (1) ──→ (N) OrderDetails
Products (1) ──→ (N) OrderDetails
OrderDetails (N) ←→ (N) Deliveries (via OrderDetailDeliveries junction)
```

See [`docs/architecture.md`](../docs/architecture.md) and [`docs/sqlite-integration.md`](../docs/sqlite-integration.md) for details.

### Naming Conventions

- **Database**: `snake_case` (e.g., `branch_id`, `headquarters_id`)
- **TypeScript/API**: `camelCase` (e.g., `branchId`, `headquartersId`)
- **Automatic conversion** handled by `objectToCamelCase` utility

## 🛠️ Development Guide

### Adding a New Endpoint

1. **Define the model** (if new entity):
   ```typescript
   // src/models/myEntity.ts
   export interface MyEntity {
     myEntityId?: number;
     name: string;
     description?: string;
   }
   ```

2. **Create the repository**:
   ```typescript
   // src/repositories/myEntityRepo.ts
   import { getDatabase, DatabaseConnection } from '../db/sqlite';
   import { MyEntity } from '../models/myEntity';
   
   export class MyEntityRepository {
     private db: DatabaseConnection;
     
     constructor(db: DatabaseConnection) {
       this.db = db;
     }
     
     async findAll(): Promise<MyEntity[]> {
       const rows = await this.db.all('SELECT * FROM my_entities');
       return rows.map(objectToCamelCase);
     }
     
     // ... other CRUD methods
   }
   
   export async function getMyEntityRepository(): Promise<MyEntityRepository> {
     const db = await getDatabase();
     return new MyEntityRepository(db);
   }
   ```

3. **Create the routes**:
   ```typescript
   // src/routes/myEntity.ts
   import express from 'express';
   import { getMyEntityRepository } from '../repositories/myEntityRepo';
   
   const router = express.Router();
   
   router.get('/', async (req, res, next) => {
     try {
       const repo = await getMyEntityRepository();
       const entities = await repo.findAll();
       res.json(entities);
     } catch (error) {
       next(error);
     }
   });
   
   // ... other routes
   
   export default router;
   ```

4. **Register routes** in `src/index.ts`:
   ```typescript
   import myEntityRoutes from './routes/myEntity';
   app.use('/api/my-entities', myEntityRoutes);
   ```

5. **Update Swagger** documentation (see next section)

6. **Write tests** (see Testing section)

### Updating Swagger Documentation

Add JSDoc comments to your route file:

```typescript
/**
 * @swagger
 * /api/my-entities:
 *   get:
 *     summary: Get all entities
 *     tags: [MyEntity]
 *     responses:
 *       200:
 *         description: List of entities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MyEntity'
 */
```

The Swagger spec is auto-generated from JSDoc comments and served at `/api-docs`.

### Writing Tests

**Repository Tests** (with mocked database):

```typescript
// src/repositories/myEntityRepo.test.ts
import { describe, it, expect, vi } from 'vitest';
import { MyEntityRepository } from './myEntityRepo';

describe('MyEntityRepository', () => {
  const mockDb = {
    all: vi.fn(),
    get: vi.fn(),
    run: vi.fn(),
  };

  it('should fetch all entities', async () => {
    mockDb.all.mockResolvedValue([
      { my_entity_id: 1, name: 'Test' }
    ]);
    
    const repo = new MyEntityRepository(mockDb as any);
    const result = await repo.findAll();
    
    expect(result).toHaveLength(1);
    expect(result[0].myEntityId).toBe(1);
  });
});
```

**Route Tests** (integration with supertest):

```typescript
// src/routes/myEntity.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import myEntityRoutes from './myEntity';

describe('MyEntity Routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/my-entities', myEntityRoutes);

  it('GET /api/my-entities should return all entities', async () => {
    const response = await request(app).get('/api/my-entities');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
```

### Database Migrations

To modify the database schema:

1. **Create a new migration file**: `sql/migrations/002_my_change.sql`
2. **Write SQL** with proper `CREATE`, `ALTER`, or `DROP` statements
3. **Run migrations**: `npm run db:migrate --workspace=api`

**Important**: Never modify existing migration files. Always create new ones.

## 📚 Additional Documentation

- **[Architecture Overview](../docs/architecture.md)** - System architecture and design
- **[SQLite Integration](../docs/sqlite-integration.md)** - Database setup and usage
- **[API Instructions](.github/instructions/api.instructions.md)** - Code review guidelines
- **[Demo Script](../docs/demo-script.md)** - Demo scenarios and walkthroughs

## 🤝 Contributing

When contributing to the API:

1. Follow the existing patterns (repository pattern, error handling)
2. Maintain type safety (avoid `any` types)
3. Add tests for new features
4. Update Swagger documentation
5. Use parameterized SQL queries (never build raw query strings)
6. Follow naming conventions (camelCase in TS, snake_case in DB)

See `.github/instructions/api.instructions.md` for detailed code review guidelines.

## 📄 License

MIT

---

**Need help?** Check the [main README](../README.md) or open an issue on GitHub.
