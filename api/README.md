# OctoCAT Supply Chain Management - API Documentation

Welcome to the OctoCAT Supply API documentation! This REST API provides comprehensive endpoints for managing a supply chain system including suppliers, headquarters, branches, products, orders, and deliveries.

## Table of Contents

- [Quick Start](#quick-start)
- [API Endpoints](#api-endpoints)
- [Architecture](#architecture)
- [Error Handling](#error-handling)
- [Development Guide](#development-guide)
- [Testing](#testing)
- [Database](#database)

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- SQLite3

### Installation & Running

```bash
# Install dependencies (from root)
npm install

# Initialize database (first time only)
npm run db:init --workspace=api

# Start development server
npm run dev --workspace=api

# The API will be available at http://localhost:3000
# Swagger UI documentation at http://localhost:3000/api-docs
```

### API Base URL

- Development: `http://localhost:3000`
- All API endpoints are prefixed with `/api`

## API Endpoints

### Suppliers

Manage supplier information for products.

#### Endpoints

- `GET /api/suppliers` - Get all suppliers
- `GET /api/suppliers/:id` - Get supplier by ID
- `POST /api/suppliers` - Create new supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier

#### Example: Get All Suppliers

```bash
curl http://localhost:3000/api/suppliers
```

Response:
```json
[
  {
    "supplierId": 1,
    "name": "TechPro Solutions",
    "description": "Leading technology supplier",
    "contactPerson": "John Smith",
    "email": "john@techpro.com",
    "phone": "555-1234"
  }
]
```

#### Example: Create Supplier

```bash
curl -X POST http://localhost:3000/api/suppliers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Supplier Co",
    "description": "Office supplies supplier",
    "contactPerson": "Jane Doe",
    "email": "jane@newsupplier.com",
    "phone": "555-5678"
  }'
```

Response (201 Created):
```json
{
  "supplierId": 2,
  "name": "New Supplier Co",
  "description": "Office supplies supplier",
  "contactPerson": "Jane Doe",
  "email": "jane@newsupplier.com",
  "phone": "555-5678"
}
```

### Headquarters

Manage company headquarters information.

#### Endpoints

- `GET /api/headquarters` - Get all headquarters
- `GET /api/headquarters/:id` - Get headquarters by ID
- `POST /api/headquarters` - Create new headquarters
- `PUT /api/headquarters/:id` - Update headquarters
- `DELETE /api/headquarters/:id` - Delete headquarters

#### Schema

```typescript
{
  headquartersId: number;
  name: string;
  description?: string;
  address?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
}
```

### Branches

Manage branch locations linked to headquarters.

#### Endpoints

- `GET /api/branches` - Get all branches
- `GET /api/branches/:id` - Get branch by ID
- `POST /api/branches` - Create new branch
- `PUT /api/branches/:id` - Update branch
- `DELETE /api/branches/:id` - Delete branch

#### Schema

```typescript
{
  branchId: number;
  headquartersId: number;  // Foreign key to headquarters
  name: string;
  description?: string;
  address?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
}
```

#### Example: Create Branch

```bash
curl -X POST http://localhost:3000/api/branches \
  -H "Content-Type: application/json" \
  -d '{
    "headquartersId": 1,
    "name": "Downtown Branch",
    "address": "123 Main St",
    "contactPerson": "Bob Wilson",
    "email": "bob@company.com",
    "phone": "555-9999"
  }'
```

### Products

Manage product catalog with pricing and supplier information.

#### Endpoints

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/name/:name` - Get product by name
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

#### Schema

```typescript
{
  productId: number;
  supplierId: number;      // Foreign key to suppliers
  name: string;
  description?: string;
  price: number;
  sku: string;             // Stock keeping unit
  unit: string;            // e.g., "each", "box", "kg"
  imgName?: string;        // Image filename
  discount?: number;       // Discount percentage (0.0-1.0)
}
```

#### Example: Get Product by ID

```bash
curl http://localhost:3000/api/products/1
```

Response:
```json
{
  "productId": 1,
  "supplierId": 1,
  "name": "Laptop Computer",
  "description": "High-performance laptop",
  "price": 1299.99,
  "sku": "LAP-001",
  "unit": "each",
  "imgName": "laptop.jpg",
  "discount": 0.1
}
```

### Orders

Manage customer orders from branches.

#### Endpoints

- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

#### Schema

```typescript
{
  orderId: number;
  branchId: number;        // Foreign key to branches
  orderDate: string;       // ISO date string
  name: string;
  description?: string;
  status: string;          // e.g., "pending", "processing", "completed"
}
```

#### Example: Create Order

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "branchId": 1,
    "orderDate": "2024-01-15",
    "name": "Office Equipment Order",
    "description": "Q1 office supplies",
    "status": "pending"
  }'
```

### Order Details

Manage line items for orders.

#### Endpoints

- `GET /api/order-details` - Get all order details
- `GET /api/order-details/:id` - Get order detail by ID
- `POST /api/order-details` - Create new order detail
- `PUT /api/order-details/:id` - Update order detail
- `DELETE /api/order-details/:id` - Delete order detail

#### Schema

```typescript
{
  orderDetailId: number;
  orderId: number;         // Foreign key to orders
  productId: number;       // Foreign key to products
  quantity: number;
  unitPrice: number;
  notes?: string;
}
```

### Deliveries

Track deliveries from suppliers.

#### Endpoints

- `GET /api/deliveries` - Get all deliveries
- `GET /api/deliveries/:id` - Get delivery by ID
- `POST /api/deliveries` - Create new delivery
- `PUT /api/deliveries/:id` - Update delivery
- `DELETE /api/deliveries/:id` - Delete delivery

#### Schema

```typescript
{
  deliveryId: number;
  supplierId: number;      // Foreign key to suppliers
  deliveryDate: string;    // ISO date string
  name: string;
  description?: string;
  status: string;          // e.g., "pending", "in-transit", "delivered"
}
```

### Order Detail Deliveries

Junction table linking order details to deliveries.

#### Endpoints

- `GET /api/order-detail-deliveries` - Get all order detail deliveries
- `GET /api/order-detail-deliveries/:id` - Get order detail delivery by ID
- `POST /api/order-detail-deliveries` - Create new order detail delivery
- `PUT /api/order-detail-deliveries/:id` - Update order detail delivery
- `DELETE /api/order-detail-deliveries/:id` - Delete order detail delivery

#### Schema

```typescript
{
  orderDetailDeliveryId: number;
  orderDetailId: number;   // Foreign key to order_details
  deliveryId: number;      // Foreign key to deliveries
  quantity: number;
  notes?: string;
}
```

## Architecture

### Overview

The API follows a clean, layered architecture:

```
┌─────────────────────────────────────────┐
│         Express Routes Layer            │
│  (Request validation, Response format)  │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│       Repository Layer (Data Access)    │
│  (Business logic, SQL queries)          │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         SQLite Database                 │
│  (Persistent storage with ACID)         │
└─────────────────────────────────────────┘
```

### Repository Pattern

The API uses the **Repository Pattern** to abstract database operations and provide a clean interface for data access.

#### Benefits

- **Separation of concerns**: Routes handle HTTP, repositories handle data
- **Testability**: Easy to mock repositories for unit testing
- **Type safety**: Full TypeScript typing throughout
- **SQL injection protection**: All queries use parameterized statements
- **Reusability**: Repository methods can be shared across routes

#### Example Repository

```typescript
// repositories/suppliersRepo.ts
export class SuppliersRepository {
  private db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  async findAll(): Promise<Supplier[]> {
    const rows = await this.db.all<any>(
      'SELECT * FROM suppliers ORDER BY supplier_id'
    );
    return rows.map(row => objectToCamelCase(row) as Supplier);
  }

  async findById(id: number): Promise<Supplier | null> {
    const row = await this.db.get<any>(
      'SELECT * FROM suppliers WHERE supplier_id = ?',
      [id]
    );
    return row ? objectToCamelCase(row) as Supplier : null;
  }

  async create(supplier: Omit<Supplier, 'supplierId'>): Promise<Supplier> {
    const { sql, values } = buildInsertSQL('suppliers', supplier);
    const result = await this.db.run(sql, values);
    return await this.findById(result.lastID!);
  }

  // ... update, delete methods
}
```

#### Using Repositories in Routes

```typescript
// routes/supplier.ts
router.get('/', async (req, res, next) => {
  try {
    const repo = await getSuppliersRepository();
    const suppliers = await repo.findAll();
    res.json(suppliers);
  } catch (error) {
    next(error);  // Error middleware handles it
  }
});
```

### Data Model Mapping

The API automatically converts between database conventions (snake_case) and JavaScript conventions (camelCase):

**Database (SQLite)**
```sql
SELECT supplier_id, contact_person FROM suppliers;
```

**JavaScript/TypeScript**
```typescript
{
  supplierId: 1,
  contactPerson: "John Smith"
}
```

This mapping is handled by utility functions:
- `objectToCamelCase()` - Database rows → JavaScript objects
- `buildInsertSQL()` - JavaScript objects → INSERT statements
- `buildUpdateSQL()` - JavaScript objects → UPDATE statements

### Middleware

#### CORS Middleware

Configured to allow cross-origin requests from the frontend:

```typescript
app.use(cors({
  origin: ['http://localhost:5137', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
```

#### Error Handler Middleware

Centralized error handling for consistent API responses:

```typescript
app.use(errorHandler);

// Automatically converts errors to proper HTTP responses
// NotFoundError → 404
// ValidationError → 400
// ConflictError → 409
// DatabaseError → 500
```

## Error Handling

### Custom Error Types

The API provides specialized error types for different scenarios:

#### NotFoundError (404)

Thrown when a requested resource doesn't exist.

```typescript
throw new NotFoundError('Supplier', 123);
```

Response:
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Supplier with ID 123 not found"
  }
}
```

#### ValidationError (400)

Thrown for invalid input data or constraint violations.

```typescript
throw new ValidationError('Email format is invalid');
```

Response:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation error: Email format is invalid"
  }
}
```

#### ConflictError (409)

Thrown for constraint violations like duplicate unique keys.

```typescript
throw new ConflictError('Supplier with this email already exists');
```

Response:
```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Conflict: Supplier with this email already exists"
  }
}
```

#### DatabaseError (500)

Generic database errors for unexpected issues.

Response:
```json
{
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Database operation failed: ..."
  }
}
```

### Error Handling in Routes

Always wrap async operations in try-catch and pass errors to `next()`:

```typescript
router.get('/:id', async (req, res, next) => {
  try {
    const repo = await getSuppliersRepository();
    const supplier = await repo.findById(parseInt(req.params.id));
    if (supplier) {
      res.json(supplier);
    } else {
      res.status(404).send('Supplier not found');
    }
  } catch (error) {
    next(error);  // Middleware converts to proper response
  }
});
```

## Development Guide

### Adding a New Endpoint

Follow these steps to add a new endpoint to an existing entity:

1. **Add the route handler** in `src/routes/<entity>.ts`:

```typescript
// GET /api/suppliers/search?q=keyword
router.get('/search', async (req, res, next) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter required' });
    }
    
    const repo = await getSuppliersRepository();
    const results = await repo.findByName(query);
    res.json(results);
  } catch (error) {
    next(error);
  }
});
```

2. **Add the repository method** if needed in `src/repositories/<entity>Repo.ts`:

```typescript
async findByName(name: string): Promise<Supplier[]> {
  try {
    const rows = await this.db.all<any>(
      'SELECT * FROM suppliers WHERE name LIKE ? ORDER BY name',
      [`%${name}%`]
    );
    return rows.map(row => objectToCamelCase(row) as Supplier);
  } catch (error) {
    handleDatabaseError(error);
  }
}
```

3. **Add Swagger documentation** to the route file:

```typescript
/**
 * @swagger
 * /api/suppliers/search:
 *   get:
 *     summary: Search suppliers by name
 *     tags: [Suppliers]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: List of matching suppliers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Supplier'
 */
```

4. **Test the endpoint**:

```bash
npm run test --workspace=api
```

### Adding a New Entity

To add a completely new entity to the API:

1. **Create migration** in `sql/migrations/00X_entity_name.sql`:

```sql
-- Migration 002: Add inventory table
CREATE TABLE inventory (
    inventory_id INTEGER PRIMARY KEY,
    product_id INTEGER NOT NULL,
    branch_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    last_updated TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
);

CREATE INDEX idx_inventory_product_id ON inventory(product_id);
CREATE INDEX idx_inventory_branch_id ON inventory(branch_id);
```

2. **Create model** in `src/models/inventory.ts`:

```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     Inventory:
 *       type: object
 *       properties:
 *         inventoryId:
 *           type: integer
 *         productId:
 *           type: integer
 *         branchId:
 *           type: integer
 *         quantity:
 *           type: integer
 *         lastUpdated:
 *           type: string
 *           format: date-time
 */
export interface Inventory {
  inventoryId: number;
  productId: number;
  branchId: number;
  quantity: number;
  lastUpdated: string;
}
```

3. **Create repository** in `src/repositories/inventoryRepo.ts`:

```typescript
import { getDatabase, DatabaseConnection } from '../db/sqlite';
import { Inventory } from '../models/inventory';
import { handleDatabaseError, NotFoundError } from '../utils/errors';
import { buildInsertSQL, buildUpdateSQL, objectToCamelCase } from '../utils/sql';

export class InventoryRepository {
  private db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  async findAll(): Promise<Inventory[]> {
    try {
      const rows = await this.db.all<any>(
        'SELECT * FROM inventory ORDER BY inventory_id'
      );
      return rows.map(row => objectToCamelCase(row) as Inventory);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async findById(id: number): Promise<Inventory | null> {
    try {
      const row = await this.db.get<any>(
        'SELECT * FROM inventory WHERE inventory_id = ?',
        [id]
      );
      return row ? objectToCamelCase(row) as Inventory : null;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async create(inventory: Omit<Inventory, 'inventoryId'>): Promise<Inventory> {
    try {
      const { sql, values } = buildInsertSQL('inventory', inventory);
      const result = await this.db.run(sql, values);
      const created = await this.findById(result.lastID!);
      if (!created) {
        throw new Error('Failed to retrieve created inventory');
      }
      return created;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async update(id: number, inventory: Partial<Omit<Inventory, 'inventoryId'>>): Promise<Inventory> {
    try {
      const { sql, values } = buildUpdateSQL('inventory', inventory, 'inventory_id = ?');
      const result = await this.db.run(sql, [...values, id]);
      if (result.changes === 0) {
        throw new NotFoundError('Inventory', id);
      }
      const updated = await this.findById(id);
      if (!updated) {
        throw new Error('Failed to retrieve updated inventory');
      }
      return updated;
    } catch (error) {
      handleDatabaseError(error, 'Inventory', id);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const result = await this.db.run(
        'DELETE FROM inventory WHERE inventory_id = ?',
        [id]
      );
      if (result.changes === 0) {
        throw new NotFoundError('Inventory', id);
      }
    } catch (error) {
      handleDatabaseError(error, 'Inventory', id);
    }
  }
}

let inventoryRepo: InventoryRepository | null = null;

export async function getInventoryRepository(isTest: boolean = false): Promise<InventoryRepository> {
  const isTestEnv = isTest || process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
  if (isTestEnv) {
    const db = await getDatabase(true);
    return new InventoryRepository(db);
  }
  if (!inventoryRepo) {
    const db = await getDatabase(false);
    inventoryRepo = new InventoryRepository(db);
  }
  return inventoryRepo;
}
```

4. **Create routes** in `src/routes/inventory.ts`:

```typescript
/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: API endpoints for managing inventory
 */

import express from 'express';
import { Inventory } from '../models/inventory';
import { getInventoryRepository } from '../repositories/inventoryRepo';
import { NotFoundError } from '../utils/errors';

const router = express.Router();

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Returns all inventory items
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: List of all inventory items
 */
router.get('/', async (req, res, next) => {
  try {
    const repo = await getInventoryRepository();
    const items = await repo.findAll();
    res.json(items);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/inventory/{id}:
 *   get:
 *     summary: Get an inventory item by ID
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/:id', async (req, res, next) => {
  try {
    const repo = await getInventoryRepository();
    const item = await repo.findById(parseInt(req.params.id));
    if (item) {
      res.json(item);
    } else {
      res.status(404).send('Inventory item not found');
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/inventory:
 *   post:
 *     summary: Create a new inventory item
 *     tags: [Inventory]
 */
router.post('/', async (req, res, next) => {
  try {
    const repo = await getInventoryRepository();
    const newItem = await repo.create(req.body as Omit<Inventory, 'inventoryId'>);
    res.status(201).json(newItem);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/inventory/{id}:
 *   put:
 *     summary: Update an inventory item
 *     tags: [Inventory]
 */
router.put('/:id', async (req, res, next) => {
  try {
    const repo = await getInventoryRepository();
    const updated = await repo.update(parseInt(req.params.id), req.body);
    res.json(updated);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).send('Inventory item not found');
    } else {
      next(error);
    }
  }
});

/**
 * @swagger
 * /api/inventory/{id}:
 *   delete:
 *     summary: Delete an inventory item
 *     tags: [Inventory]
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const repo = await getInventoryRepository();
    await repo.delete(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).send('Inventory item not found');
    } else {
      next(error);
    }
  }
});

export default router;
```

5. **Register routes** in `src/index.ts`:

```typescript
import inventoryRoutes from './routes/inventory';
// ...
app.use('/api/inventory', inventoryRoutes);
```

6. **Run migrations**:

```bash
npm run db:migrate --workspace=api
```

7. **Create tests** in `src/repositories/inventoryRepo.test.ts` (follow pattern from `suppliersRepo.test.ts`)

## Testing

### Test Infrastructure

The API uses **Vitest** for testing with full TypeScript support.

### Running Tests

```bash
# Run all tests
npm run test --workspace=api

# Run tests in watch mode
npm run test --workspace=api -- --watch

# Run tests with coverage
npm run test:coverage --workspace=api
```

### Unit Testing Repositories

Repository tests use mocked database connections:

```typescript
// repositories/suppliersRepo.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SuppliersRepository } from './suppliersRepo';
import { Supplier } from '../models/supplier';
import { NotFoundError } from '../utils/errors';

describe('SuppliersRepository', () => {
  let repository: SuppliersRepository;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      run: vi.fn(),
      get: vi.fn(),
      all: vi.fn(),
      close: vi.fn()
    };
    repository = new SuppliersRepository(mockDb);
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all suppliers', async () => {
      const mockResults = [
        {
          supplier_id: 1,
          name: 'Test Supplier',
          contact_person: 'John',
          email: 'john@test.com'
        }
      ];
      mockDb.all.mockResolvedValue(mockResults);

      const result = await repository.findAll();

      expect(mockDb.all).toHaveBeenCalledWith(
        'SELECT * FROM suppliers ORDER BY supplier_id'
      );
      expect(result).toHaveLength(1);
      expect(result[0].supplierId).toBe(1);
    });
  });

  describe('create', () => {
    it('should create a new supplier', async () => {
      const newSupplier = {
        name: 'New Supplier',
        contactPerson: 'Jane',
        email: 'jane@test.com'
      };
      
      mockDb.run.mockResolvedValue({ lastID: 5 });
      mockDb.get.mockResolvedValue({
        supplier_id: 5,
        name: 'New Supplier',
        contact_person: 'Jane',
        email: 'jane@test.com'
      });

      const result = await repository.create(newSupplier);

      expect(result.supplierId).toBe(5);
      expect(result.name).toBe('New Supplier');
    });
  });
});
```

### Integration Testing Routes

Use `supertest` for integration testing:

```typescript
import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../index';

describe('Supplier Routes', () => {
  it('GET /api/suppliers should return all suppliers', async () => {
    const response = await request(app)
      .get('/api/suppliers')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('POST /api/suppliers should create new supplier', async () => {
    const newSupplier = {
      name: 'Test Supplier',
      email: 'test@supplier.com'
    };

    const response = await request(app)
      .post('/api/suppliers')
      .send(newSupplier)
      .expect(201);

    expect(response.body.supplierId).toBeDefined();
    expect(response.body.name).toBe('Test Supplier');
  });
});
```

### Test Database

Tests automatically use an in-memory SQLite database (`:memory:`) for isolation and speed. The database is created fresh for each test run.

## Database

### Schema Management

#### Migrations

Database schema changes are managed through migration files in `sql/migrations/`:

- Migration files are numbered sequentially: `001_init.sql`, `002_add_feature.sql`
- Migrations are tracked in a `migrations` table
- Each migration runs only once
- Migrations are executed in order during database initialization

**Running migrations:**

```bash
# Run all pending migrations
npm run db:migrate --workspace=api
```

**Creating a new migration:**

1. Create file: `sql/migrations/00X_description.sql`
2. Add your SQL statements
3. Run migrations

Example migration:

```sql
-- Migration 002: Add inventory tracking
CREATE TABLE inventory (
    inventory_id INTEGER PRIMARY KEY,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE INDEX idx_inventory_product ON inventory(product_id);
```

#### Seed Data

Sample data is provided through seed files in `sql/seed/`:

- Executed in alphabetical/numerical order
- Used for development and demo purposes
- Deterministic IDs for referential integrity

**Running seeds:**

```bash
# Seed the database
npm run db:seed --workspace=api

# Initialize database with migrations + seeds
npm run db:init --workspace=api
```

### Database Configuration

Configure the database using environment variables:

```bash
# Database file path (default: ./data/app.db)
DB_FILE=/path/to/database.db

# Enable Write-Ahead Logging for better concurrency (default: true)
DB_ENABLE_WAL=true

# Enable foreign key constraints (default: true)
DB_FOREIGN_KEYS=true

# Connection timeout in milliseconds (default: 30000)
DB_TIMEOUT=30000
```

### Entity Relationships

```
Headquarters (1) ──── (Many) Branches
                                │
                                │ (1)
                                │
                            (Many) Orders
                                │
                                │ (1)
                                │
                            (Many) OrderDetails ──── (Many) Products ──── (1) Suppliers
                                │                                               │
                                │ (Many)                                  (1)   │
                                │                                               │
                            (Many) OrderDetailDeliveries ──── (Many) Deliveries ─┘
```

### Foreign Key Constraints

All relationships are enforced with foreign keys:

- `ON DELETE CASCADE` - Deleting a parent deletes children
- Ensures referential integrity
- Prevents orphaned records

### Indexes

Performance indexes are created on:
- All foreign key columns
- Frequently queried columns (e.g., `status`, `sku`)
- Composite indexes for common query patterns

See `sql/migrations/001_init.sql` for complete index definitions.

## Swagger/OpenAPI Documentation

### Accessing Documentation

Interactive API documentation is available at:

**Swagger UI**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

**OpenAPI JSON**: [http://localhost:3000/api-docs.json](http://localhost:3000/api-docs.json)

### Features

- **Interactive testing** - Try API endpoints directly from the browser
- **Schema validation** - See request/response formats
- **Authentication** - Test with different credentials
- **Examples** - View sample requests and responses

### Updating Documentation

Swagger documentation is generated from JSDoc comments in:
- `src/models/*.ts` - Schema definitions
- `src/routes/*.ts` - Endpoint documentation

The documentation is automatically regenerated when the server starts.

## Configuration

### Environment Variables

```bash
# Server Configuration
PORT=3000                    # API server port

# Database Configuration
DB_FILE=./data/app.db       # SQLite database file path
DB_ENABLE_WAL=true          # Enable Write-Ahead Logging
DB_FOREIGN_KEYS=true        # Enable foreign key constraints
DB_TIMEOUT=30000            # Connection timeout (ms)

# CORS Configuration
API_CORS_ORIGINS=http://localhost:5137,http://localhost:3001
```

### Project Structure

```
api/
├── src/
│   ├── db/              # Database connection and utilities
│   ├── models/          # TypeScript interfaces and Swagger schemas
│   ├── repositories/    # Data access layer
│   ├── routes/          # Express route handlers
│   ├── utils/           # Utility functions (errors, SQL builders)
│   ├── index.ts         # Application entry point
│   └── init-db.ts       # Database initialization script
├── sql/
│   ├── migrations/      # Schema migration files
│   └── seed/           # Seed data files
├── data/               # SQLite database file (generated)
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

## Best Practices

### API Design

1. **Use appropriate HTTP methods**
   - GET for retrieval
   - POST for creation
   - PUT for full updates
   - DELETE for removal

2. **Return proper status codes**
   - 200 OK - Successful GET/PUT
   - 201 Created - Successful POST
   - 204 No Content - Successful DELETE
   - 400 Bad Request - Invalid input
   - 404 Not Found - Resource doesn't exist
   - 409 Conflict - Constraint violation
   - 500 Internal Server Error - Unexpected errors

3. **Use consistent error format**
   ```json
   {
     "error": {
       "code": "ERROR_CODE",
       "message": "Human-readable message"
     }
   }
   ```

### Repository Pattern

1. **Keep repositories focused** - One repository per entity
2. **Use typed methods** - Full TypeScript types on all methods
3. **Handle errors consistently** - Use `handleDatabaseError()`
4. **Map data formats** - Convert between snake_case and camelCase
5. **Return domain objects** - Never expose raw database rows

### Error Handling

1. **Always use try-catch** in async route handlers
2. **Pass errors to next()** for middleware handling
3. **Use specific error types** for different scenarios
4. **Log errors** for debugging (but don't expose internals)

### Testing

1. **Test repositories with mocks** - Fast, isolated unit tests
2. **Test routes with integration tests** - Verify full request/response cycle
3. **Use in-memory database** for test isolation
4. **Test error cases** - Not just happy paths
5. **Maintain high coverage** - Aim for >80%

## Additional Resources

- [Main Project README](../README.md)
- [Architecture Documentation](../docs/architecture.md)
- [SQLite Integration Guide](../docs/sqlite-integration.md)
- [Swagger/OpenAPI Specification](https://swagger.io/specification/)
- [Express.js Documentation](https://expressjs.com/)
- [Vitest Documentation](https://vitest.dev/)

## Support

For issues, questions, or contributions, please refer to the main project repository.

---

*This API was built with ❤️ using TypeScript, Express, and SQLite. The entire project, including this documentation, was created with the assistance of GitHub Copilot.*
