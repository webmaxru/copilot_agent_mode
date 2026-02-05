# Repository Pattern Documentation

This document explains the repository pattern implementation in the OctoCAT Supply Chain Management API.

## Overview

The repository pattern provides a clean separation between the business logic and data access layers. It abstracts database operations behind well-defined interfaces, making the codebase more maintainable, testable, and flexible.

### Key Benefits

- **Separation of Concerns**: Business logic is isolated from database operations
- **Testability**: Repositories can be easily mocked for unit testing
- **Consistency**: Standardized data access patterns across all entities
- **Type Safety**: Full TypeScript support with compile-time validation
- **Maintainability**: Changes to data access logic are centralized
- **Flexibility**: Easy to swap data sources without affecting business logic

## Architecture

```
┌─────────────┐
│   Routes    │  Express route handlers
│  (API Layer)│  - Validate requests
└──────┬──────┘  - Call repositories
       │         - Return responses
       ▼
┌─────────────┐
│Repositories │  Data access layer
│(Data Layer) │  - CRUD operations
└──────┬──────┘  - Custom queries
       │         - Error handling
       ▼
┌─────────────┐
│  Database   │  SQLite database
│   (SQLite)  │  - Persistent storage
└─────────────┘
```

## Repository Structure

All repositories follow a consistent structure:

```typescript
export class EntityRepository {
  private db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  async findAll(): Promise<Entity[]> { /* ... */ }
  async findById(id: number): Promise<Entity | null> { /* ... */ }
  async create(entity: Omit<Entity, 'id'>): Promise<Entity> { /* ... */ }
  async update(id: number, entity: Partial<Entity>): Promise<Entity> { /* ... */ }
  async delete(id: number): Promise<void> { /* ... */ }
  
  // Custom query methods
  async customQuery(): Promise<Entity[]> { /* ... */ }
}
```

### Factory Functions

Each repository provides factory functions for creating instances:

```typescript
// Create a new repository instance
export async function createEntityRepository(
  isTest: boolean = false
): Promise<EntityRepository> {
  const db = await getDatabase(isTest);
  return new EntityRepository(db);
}

// Get singleton repository instance (default usage)
export async function getEntityRepository(
  isTest: boolean = false
): Promise<EntityRepository> {
  if (!entityRepo) {
    entityRepo = await createEntityRepository(isTest);
  }
  return entityRepo;
}
```

## Standard CRUD Operations

### findAll()

Retrieves all entities from the database.

**Example: Products Repository**
```typescript
async findAll(): Promise<Product[]> {
  try {
    const rows = await this.db.all<any>(
      'SELECT * FROM products ORDER BY product_id'
    );
    return rows.map((row) => objectToCamelCase(row) as Product);
  } catch (error) {
    handleDatabaseError(error);
  }
}
```

**Usage**:
```typescript
const repo = await getProductsRepository();
const products = await repo.findAll();
// Returns: Product[]
```

### findById(id)

Retrieves a single entity by its primary key.

**Example: Products Repository**
```typescript
async findById(id: number): Promise<Product | null> {
  try {
    const row = await this.db.get<any>(
      'SELECT * FROM products WHERE product_id = ?',
      [id]
    );
    return row ? (objectToCamelCase(row) as Product) : null;
  } catch (error) {
    handleDatabaseError(error);
  }
}
```

**Usage**:
```typescript
const repo = await getProductsRepository();
const product = await repo.findById(1);
if (product) {
  console.log(`Found: ${product.name}`);
} else {
  console.log('Product not found');
}
```

### create(entity)

Creates a new entity in the database.

**Example: Products Repository**
```typescript
async create(product: Omit<Product, 'productId'>): Promise<Product> {
  try {
    const { sql, values } = buildInsertSQL('products', product);
    const result = await this.db.run(sql, values);

    const createdProduct = await this.findById(result.lastID!);
    if (!createdProduct) {
      throw new Error('Failed to retrieve created product');
    }

    return createdProduct;
  } catch (error) {
    handleDatabaseError(error);
  }
}
```

**Usage**:
```typescript
const repo = await getProductsRepository();
const newProduct = await repo.create({
  supplierId: 1,
  name: 'OctoCat Plushie',
  description: 'Adorable plushie',
  price: 24.99,
  sku: 'OCTOCAT-001',
  unit: 'piece',
  imgName: 'octocat.png'
});
// Returns: Product (with generated productId)
```

### update(id, entity)

Updates an existing entity.

**Example: Products Repository**
```typescript
async update(
  id: number,
  product: Partial<Omit<Product, 'productId'>>
): Promise<Product> {
  try {
    const { sql, values } = buildUpdateSQL(
      'products',
      product,
      'product_id = ?'
    );
    const result = await this.db.run(sql, [...values, id]);

    if (result.changes === 0) {
      throw new NotFoundError('Product', id);
    }

    const updatedProduct = await this.findById(id);
    if (!updatedProduct) {
      throw new Error('Failed to retrieve updated product');
    }

    return updatedProduct;
  } catch (error) {
    handleDatabaseError(error, 'Product', id);
  }
}
```

**Usage**:
```typescript
const repo = await getProductsRepository();
const updated = await repo.update(1, {
  price: 19.99,
  discount: 0.15
});
// Returns: Product (with updated fields)
```

### delete(id)

Deletes an entity from the database.

**Example: Products Repository**
```typescript
async delete(id: number): Promise<void> {
  try {
    const result = await this.db.run(
      'DELETE FROM products WHERE product_id = ?',
      [id]
    );

    if (result.changes === 0) {
      throw new NotFoundError('Product', id);
    }
  } catch (error) {
    handleDatabaseError(error, 'Product', id);
  }
}
```

**Usage**:
```typescript
const repo = await getProductsRepository();
await repo.delete(1);
// Returns: void (throws NotFoundError if not found)
```

## Custom Query Methods

Repositories can include custom query methods for specific use cases.

### Example: Find Products by Supplier

```typescript
async findBySupplierId(supplierId: number): Promise<Product[]> {
  try {
    const rows = await this.db.all<any>(
      'SELECT * FROM products WHERE supplier_id = ? ORDER BY name',
      [supplierId]
    );
    return rows.map((row) => objectToCamelCase(row) as Product);
  } catch (error) {
    handleDatabaseError(error);
  }
}
```

**Usage**:
```typescript
const repo = await getProductsRepository();
const products = await repo.findBySupplierId(1);
// Returns: Product[] for supplier 1
```

### Example: Search Products by Name

```typescript
async findByName(name: string): Promise<Product[]> {
  try {
    const rows = await this.db.all<any>(
      `SELECT * FROM products WHERE name LIKE '%${name}%' ORDER BY name`
    );
    return rows.map((row) => objectToCamelCase(row) as Product);
  } catch (error) {
    handleDatabaseError(error);
  }
}
```

**Usage**:
```typescript
const repo = await getProductsRepository();
const products = await repo.findByName('OctoCat');
// Returns: Product[] matching 'OctoCat'
```

### Example: Check if Entity Exists

```typescript
async exists(id: number): Promise<boolean> {
  try {
    const result = await this.db.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM products WHERE product_id = ?',
      [id]
    );
    return (result?.count || 0) > 0;
  } catch (error) {
    handleDatabaseError(error);
  }
}
```

**Usage**:
```typescript
const repo = await getProductsRepository();
const exists = await repo.exists(1);
if (exists) {
  console.log('Product exists');
}
```

## Data Mapping

### camelCase ↔ snake_case Conversion

The repository layer automatically converts between JavaScript/TypeScript naming conventions (camelCase) and SQL naming conventions (snake_case).

**TypeScript Model (camelCase)**:
```typescript
{
  productId: 1,
  supplierId: 5,
  unitPrice: 29.99
}
```

**Database Columns (snake_case)**:
```sql
product_id | supplier_id | unit_price
     1     |      5      |   29.99
```

The `objectToCamelCase` utility (from `api/src/utils/sql.ts`) handles this conversion automatically when reading from the database.

### SQL Helper Functions

#### buildInsertSQL

Generates parameterized INSERT statements.

```typescript
const { sql, values } = buildInsertSQL('products', {
  supplierId: 1,
  name: 'Product',
  price: 29.99
});
// sql: "INSERT INTO products (supplier_id, name, price) VALUES (?, ?, ?)"
// values: [1, 'Product', 29.99]
```

#### buildUpdateSQL

Generates parameterized UPDATE statements.

```typescript
const { sql, values } = buildUpdateSQL(
  'products',
  { price: 24.99, discount: 0.10 },
  'product_id = ?'
);
// sql: "UPDATE products SET price = ?, discount = ? WHERE product_id = ?"
// values: [24.99, 0.10]
```

## Error Handling

Repositories use custom error classes from `api/src/utils/errors.ts`:

### NotFoundError

Thrown when an entity is not found.

```typescript
if (result.changes === 0) {
  throw new NotFoundError('Product', id);
}
```

**HTTP Status**: 404

### ValidationError

Thrown for invalid data.

```typescript
if (quantity <= 0) {
  throw new ValidationError('Quantity must be positive');
}
```

**HTTP Status**: 400

### ConflictError

Thrown for constraint violations (e.g., foreign key errors).

```typescript
try {
  await this.db.run(sql, values);
} catch (error) {
  if (error.code === 'SQLITE_CONSTRAINT') {
    throw new ConflictError('Foreign key constraint violated');
  }
}
```

**HTTP Status**: 409

### DatabaseError

Generic database error.

```typescript
catch (error) {
  throw new DatabaseError('Unexpected database error');
}
```

**HTTP Status**: 500

### handleDatabaseError Utility

The `handleDatabaseError` function automatically maps database errors to appropriate error types:

```typescript
try {
  // Database operation
} catch (error) {
  handleDatabaseError(error, 'Product', id);
}
```

## Testing Repositories

### Unit Tests with Mock Database

Repositories can be tested using a mocked database connection:

```typescript
import { vi } from 'vitest';
import { ProductsRepository } from '../repositories/productsRepo';

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
      { product_id: 1, name: 'Product 1', price: 10.0 },
      { product_id: 2, name: 'Product 2', price: 20.0 }
    ]);

    const products = await repo.findAll();

    expect(products).toHaveLength(2);
    expect(products[0].productId).toBe(1);
    expect(mockDb.all).toHaveBeenCalledWith(
      'SELECT * FROM products ORDER BY product_id'
    );
  });
});
```

### Integration Tests with In-Memory Database

For integration tests, use an in-memory database:

```typescript
import { getDatabase } from '../db/sqlite';
import { createProductsRepository } from '../repositories/productsRepo';

describe('ProductsRepository Integration', () => {
  let db: DatabaseConnection;
  let repo: ProductsRepository;

  beforeAll(async () => {
    db = await getDatabase(true); // true = test mode (in-memory)
    repo = new ProductsRepository(db);
  });

  it('should create and retrieve a product', async () => {
    const newProduct = await repo.create({
      supplierId: 1,
      name: 'Test Product',
      price: 29.99,
      sku: 'TEST-001',
      unit: 'piece',
      description: '',
      imgName: ''
    });

    expect(newProduct.productId).toBeDefined();

    const retrieved = await repo.findById(newProduct.productId);
    expect(retrieved?.name).toBe('Test Product');
  });
});
```

## Usage in Routes

Routes use repositories to handle data access:

```typescript
import express from 'express';
import { getProductsRepository } from '../repositories/productsRepo';

const router = express.Router();

// GET /api/products
router.get('/', async (req, res, next) => {
  try {
    const repo = await getProductsRepository();
    const products = await repo.findAll();
    res.json(products);
  } catch (error) {
    next(error); // Error middleware handles custom errors
  }
});

// POST /api/products
router.post('/', async (req, res, next) => {
  try {
    const repo = await getProductsRepository();
    const newProduct = await repo.create(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
});

// PUT /api/products/:id
router.put('/:id', async (req, res, next) => {
  try {
    const repo = await getProductsRepository();
    const updated = await repo.update(parseInt(req.params.id), req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

export default router;
```

## Best Practices

### 1. Use Parameterized Queries

Always use parameterized queries to prevent SQL injection:

✅ **Good**:
```typescript
await this.db.get('SELECT * FROM products WHERE product_id = ?', [id]);
```

❌ **Bad**:
```typescript
await this.db.get(`SELECT * FROM products WHERE product_id = ${id}`);
```

### 2. Handle Errors Consistently

Use `handleDatabaseError` for consistent error handling:

```typescript
try {
  // Database operation
} catch (error) {
  handleDatabaseError(error, 'Product', id);
}
```

### 3. Return Consistent Types

Ensure methods return consistent types:

```typescript
// findById returns Entity | null (not undefined)
async findById(id: number): Promise<Product | null> {
  const row = await this.db.get(...);
  return row ? objectToCamelCase(row) as Product : null;
}
```

### 4. Use Omit and Partial

Use TypeScript utility types for type safety:

```typescript
// Create: omit auto-generated ID
async create(entity: Omit<Entity, 'id'>): Promise<Entity>

// Update: allow partial updates
async update(id: number, entity: Partial<Entity>): Promise<Entity>
```

### 5. Validate Foreign Keys

Check that referenced entities exist before creating relationships:

```typescript
// In routes or service layer
const supplier = await suppliersRepo.findById(product.supplierId);
if (!supplier) {
  throw new NotFoundError('Supplier', product.supplierId);
}
```

### 6. Use Transactions for Multi-Step Operations

For operations affecting multiple tables, use transactions (to be implemented):

```typescript
// Future enhancement
await db.transaction(async (tx) => {
  await ordersRepo.create(order, tx);
  await orderDetailsRepo.create(detail, tx);
});
```

### 7. Document Custom Methods

Add JSDoc comments for custom query methods:

```typescript
/**
 * Find products by supplier ID
 * @param supplierId - The supplier's unique identifier
 * @returns Array of products from the specified supplier
 */
async findBySupplierId(supplierId: number): Promise<Product[]> {
  // Implementation
}
```

## Available Repositories

| Entity | Repository File | Factory Function |
|--------|----------------|------------------|
| Supplier | `suppliersRepo.ts` | `getSuppliersRepository()` |
| Headquarters | `headquartersRepo.ts` | `getHeadquartersRepository()` |
| Branch | `branchesRepo.ts` | `getBranchesRepository()` |
| Product | `productsRepo.ts` | `getProductsRepository()` |
| Order | `ordersRepo.ts` | `getOrdersRepository()` |
| OrderDetail | `orderDetailsRepo.ts` | `getOrderDetailsRepository()` |
| Delivery | `deliveriesRepo.ts` | `getDeliveriesRepository()` |
| OrderDetailDelivery | `orderDetailDeliveriesRepo.ts` | `getOrderDetailDeliveriesRepository()` |

## Additional Resources

- [Models Documentation](./models.md) - Entity model definitions
- [Database Schema](./database.md) - Database structure and relationships
- [Endpoints Documentation](./endpoints.md) - API endpoint reference
- [Development Guide](./development.md) - Testing and development practices
- [SQLite Integration](../../docs/sqlite-integration.md) - Database integration details
