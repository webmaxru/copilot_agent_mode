# Repository Patterns and Data Access Guide

## Overview

This document explains the repository pattern implementation in the OctoCAT Supply Chain Management API, including naming conventions, query patterns, and best practices for data access.

## What is the Repository Pattern?

The repository pattern is a **data access abstraction layer** that:
- Encapsulates database query logic
- Provides a collection-like interface for domain objects
- Separates business logic from data access concerns
- Makes code more testable by allowing database mocking

### Benefits

✅ **Testability** - Mock repositories for unit tests  
✅ **Maintainability** - SQL queries in one place  
✅ **Type Safety** - Strongly typed interfaces  
✅ **Reusability** - Share methods across routes  
✅ **Security** - Enforces parameterized queries  
✅ **Consistency** - Standard patterns for CRUD operations  

## Repository Structure

### Standard Repository Class

Every repository follows this structure:

```typescript
export class EntityRepository {
  private db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  // Standard CRUD methods
  async findAll(): Promise<Entity[]> { }
  async findById(id: number): Promise<Entity | null> { }
  async create(entity: Omit<Entity, 'entityId'>): Promise<Entity> { }
  async update(id: number, entity: Partial<Entity>): Promise<Entity> { }
  async delete(id: number): Promise<void> { }
  
  // Helper methods
  async exists(id: number): Promise<boolean> { }
  
  // Domain-specific queries
  async findByName(name: string): Promise<Entity[]> { }
  // ... other specialized queries
}
```

### Factory Functions

Each repository exports factory functions for instantiation:

```typescript
// Create new instance (used in tests)
export async function createEntityRepository(isTest: boolean = false): Promise<EntityRepository> {
  const db = await getDatabase(isTest);
  return new EntityRepository(db);
}

// Get singleton instance (used in routes)
let entityRepo: EntityRepository | null = null;

export async function getEntityRepository(isTest: boolean = false): Promise<EntityRepository> {
  const isTestEnv = isTest || process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
  if (isTestEnv) {
    return createEntityRepository(true);
  }
  if (!entityRepo) {
    entityRepo = await createEntityRepository(false);
  }
  return entityRepo;
}
```

## Naming Conventions

### Method Naming Patterns

| Pattern | Purpose | Example |
|---------|---------|---------|
| `findAll()` | Get all entities | `suppliersRepo.findAll()` |
| `findById(id)` | Get single entity by ID | `suppliersRepo.findById(5)` |
| `findBy{Property}(value)` | Filter by property | `suppliersRepo.findByName('Acme')` |
| `create(entity)` | Create new entity | `suppliersRepo.create({ name: 'New' })` |
| `update(id, data)` | Update existing entity | `suppliersRepo.update(5, { name: 'Updated' })` |
| `delete(id)` | Delete entity | `suppliersRepo.delete(5)` |
| `exists(id)` | Check if exists | `suppliersRepo.exists(5)` |
| `count()` | Count entities | `suppliersRepo.count()` |

### Property Transformation

Database columns use `snake_case`, TypeScript uses `camelCase`:

```typescript
// Database: supplier_id, contact_person
// TypeScript: supplierId, contactPerson

const row = { supplier_id: 1, contact_person: 'John' };
const supplier = objectToCamelCase(row);
// Result: { supplierId: 1, contactPerson: 'John' }
```

## Standard CRUD Operations

### Find All Entities

```typescript
async findAll(): Promise<Supplier[]> {
  try {
    const rows = await this.db.all<any>('SELECT * FROM suppliers ORDER BY supplier_id');
    return rows.map((row) => objectToCamelCase(row) as Supplier);
  } catch (error) {
    handleDatabaseError(error);
  }
}
```

**Pattern:**
- Use `db.all()` for multiple rows
- Order by primary key for consistent results
- Transform each row with `objectToCamelCase()`
- Wrap in try/catch and use `handleDatabaseError()`

### Find By ID

```typescript
async findById(id: number): Promise<Supplier | null> {
  try {
    const row = await this.db.get<any>('SELECT * FROM suppliers WHERE supplier_id = ?', [id]);
    return row ? (objectToCamelCase(row) as Supplier) : null;
  } catch (error) {
    handleDatabaseError(error);
  }
}
```

**Pattern:**
- Use `db.get()` for single row
- Return `null` if not found (don't throw NotFoundError here)
- Use parameterized query with `?` placeholder
- Transform result with `objectToCamelCase()`

### Create Entity

```typescript
async create(supplier: Omit<Supplier, 'supplierId'>): Promise<Supplier> {
  try {
    const { sql, values } = buildInsertSQL('suppliers', supplier);
    const result = await this.db.run(sql, values);

    const createdSupplier = await this.findById(result.lastID!);
    if (!createdSupplier) {
      throw new Error('Failed to retrieve created supplier');
    }

    return createdSupplier;
  } catch (error) {
    handleDatabaseError(error);
  }
}
```

**Pattern:**
- Use `Omit<Entity, 'entityId'>` type to exclude auto-generated ID
- Use `buildInsertSQL()` utility for safe SQL generation
- Use `db.run()` for INSERT/UPDATE/DELETE
- Fetch and return the created entity using `findById(result.lastID)`

### Update Entity

```typescript
async update(id: number, supplier: Partial<Omit<Supplier, 'supplierId'>>): Promise<Supplier> {
  try {
    const { sql, values } = buildUpdateSQL('suppliers', supplier, 'supplier_id = ?');
    const result = await this.db.run(sql, [...values, id]);

    if (result.changes === 0) {
      throw new NotFoundError('Supplier', id);
    }

    const updatedSupplier = await this.findById(id);
    if (!updatedSupplier) {
      throw new Error('Failed to retrieve updated supplier');
    }

    return updatedSupplier;
  } catch (error) {
    handleDatabaseError(error, 'Supplier', id);
  }
}
```

**Pattern:**
- Use `Partial<Omit<Entity, 'entityId'>>` for partial updates
- Use `buildUpdateSQL()` utility for safe SQL generation
- Check `result.changes` and throw `NotFoundError` if zero
- Fetch and return the updated entity
- Pass entity name and id to `handleDatabaseError()` for better messages

### Delete Entity

```typescript
async delete(id: number): Promise<void> {
  try {
    const result = await this.db.run('DELETE FROM suppliers WHERE supplier_id = ?', [id]);

    if (result.changes === 0) {
      throw new NotFoundError('Supplier', id);
    }
  } catch (error) {
    handleDatabaseError(error, 'Supplier', id);
  }
}
```

**Pattern:**
- Use parameterized DELETE query
- Check `result.changes` and throw `NotFoundError` if zero
- Return `void` (no need to return anything)
- Pass entity name and id to `handleDatabaseError()`

## Advanced Query Patterns

### Search with LIKE

```typescript
async findByName(name: string): Promise<Supplier[]> {
  try {
    const rows = await this.db.all<any>(
      'SELECT * FROM suppliers WHERE name LIKE ? ORDER BY name',
      [`%${name}%`]
    );
    return rows.map((row) => objectToCamelCase(row) as Supplier);
  } catch (error) {
    handleDatabaseError(error);
  }
}
```

**Pattern:**
- Use `LIKE` with `%` wildcards for partial matching
- Wrap search term: `%${name}%` for contains, `${name}%` for starts-with
- Always parameterize - never concatenate user input into SQL

### Pagination

```typescript
async findAll(page: number = 1, pageSize: number = 20): Promise<{
  data: Supplier[];
  total: number;
  page: number;
  pageSize: number;
}> {
  try {
    const offset = (page - 1) * pageSize;
    
    // Get total count
    const countResult = await this.db.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM suppliers'
    );
    const total = countResult?.count || 0;
    
    // Get page of results
    const rows = await this.db.all<any>(
      'SELECT * FROM suppliers ORDER BY supplier_id LIMIT ? OFFSET ?',
      [pageSize, offset]
    );
    
    return {
      data: rows.map((row) => objectToCamelCase(row) as Supplier),
      total,
      page,
      pageSize,
    };
  } catch (error) {
    handleDatabaseError(error);
  }
}
```

**Pattern:**
- Return object with `data`, `total`, `page`, `pageSize`
- Use `LIMIT` and `OFFSET` for pagination
- Calculate offset: `(page - 1) * pageSize`
- Get total count in separate query for pagination metadata

### Filtering with Multiple Conditions

```typescript
async findWithFilters(filters: {
  name?: string;
  minPrice?: number;
  maxPrice?: number;
  supplierId?: number;
}): Promise<Product[]> {
  try {
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];
    
    if (filters.name) {
      sql += ' AND name LIKE ?';
      params.push(`%${filters.name}%`);
    }
    
    if (filters.minPrice !== undefined) {
      sql += ' AND price >= ?';
      params.push(filters.minPrice);
    }
    
    if (filters.maxPrice !== undefined) {
      sql += ' AND price <= ?';
      params.push(filters.maxPrice);
    }
    
    if (filters.supplierId) {
      sql += ' AND supplier_id = ?';
      params.push(filters.supplierId);
    }
    
    sql += ' ORDER BY name';
    
    const rows = await this.db.all<any>(sql, params);
    return rows.map((row) => objectToCamelCase(row) as Product);
  } catch (error) {
    handleDatabaseError(error);
  }
}
```

**Pattern:**
- Start with `WHERE 1=1` to simplify conditional appending
- Build SQL and params array dynamically
- Only add conditions if filter values are provided
- Always use parameterized queries

### Joins for Related Data

```typescript
async findBranchesWithHeadquarters(): Promise<BranchWithHQ[]> {
  try {
    const rows = await this.db.all<any>(`
      SELECT 
        b.branch_id,
        b.name as branch_name,
        b.address as branch_address,
        h.headquarters_id,
        h.name as headquarters_name,
        h.address as headquarters_address
      FROM branches b
      JOIN headquarters h ON b.headquarters_id = h.headquarters_id
      ORDER BY b.branch_id
    `);
    
    return rows.map((row) => ({
      branchId: row.branch_id,
      branchName: row.branch_name,
      branchAddress: row.branch_address,
      headquarters: {
        headquartersId: row.headquarters_id,
        name: row.headquarters_name,
        address: row.headquarters_address,
      },
    }));
  } catch (error) {
    handleDatabaseError(error);
  }
}
```

**Pattern:**
- Use JOIN to fetch related data in one query (avoid N+1 problem)
- Alias columns to avoid naming conflicts
- Manually construct nested objects if needed
- Consider creating a dedicated TypeScript type for joined results

### Aggregation Queries

```typescript
async getOrderStatsByBranch(branchId: number): Promise<OrderStats> {
  try {
    const result = await this.db.get<any>(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders,
        AVG(total_amount) as avg_order_value
      FROM orders
      WHERE branch_id = ?
    `, [branchId]);
    
    return {
      totalOrders: result?.total_orders || 0,
      pendingOrders: result?.pending_orders || 0,
      deliveredOrders: result?.delivered_orders || 0,
      avgOrderValue: result?.avg_order_value || 0,
    };
  } catch (error) {
    handleDatabaseError(error);
  }
}
```

**Pattern:**
- Use aggregate functions: `COUNT()`, `SUM()`, `AVG()`, `MIN()`, `MAX()`
- Use `CASE WHEN` for conditional aggregation
- Handle null results with `|| 0` or similar defaults
- Create dedicated return types for statistics

## Transaction Handling

### Basic Transaction

```typescript
async transferStock(fromProductId: number, toProductId: number, quantity: number): Promise<void> {
  try {
    await this.db.run('BEGIN TRANSACTION');
    
    try {
      // Deduct from source product
      await this.db.run(
        'UPDATE products SET stock_level = stock_level - ? WHERE product_id = ? AND stock_level >= ?',
        [quantity, fromProductId, quantity]
      );
      
      // Add to destination product
      await this.db.run(
        'UPDATE products SET stock_level = stock_level + ? WHERE product_id = ?',
        [quantity, toProductId]
      );
      
      await this.db.run('COMMIT');
    } catch (error) {
      await this.db.run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    handleDatabaseError(error);
  }
}
```

**Pattern:**
- Use `BEGIN TRANSACTION` before operations
- Wrap in try/catch to handle errors
- `COMMIT` on success, `ROLLBACK` on error
- Always rollback in the catch block

### Advanced Transaction with Savepoints

```typescript
async complexOperation(): Promise<void> {
  try {
    await this.db.run('BEGIN TRANSACTION');
    
    try {
      // Step 1
      await this.db.run('...');
      
      await this.db.run('SAVEPOINT step1');
      
      // Step 2 (might fail)
      try {
        await this.db.run('...');
      } catch (error) {
        // Rollback to savepoint, keep step 1
        await this.db.run('ROLLBACK TO SAVEPOINT step1');
      }
      
      // Step 3
      await this.db.run('...');
      
      await this.db.run('COMMIT');
    } catch (error) {
      await this.db.run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    handleDatabaseError(error);
  }
}
```

**Pattern:**
- Use `SAVEPOINT` for partial rollbacks
- Rollback to savepoint to keep previous work
- Useful for multi-step operations where some failures are recoverable

## Error Handling Best Practices

### Using Custom Error Types

```typescript
async update(id: number, data: Partial<Supplier>): Promise<Supplier> {
  try {
    // Validation
    if (data.email && !isValidEmail(data.email)) {
      throw new ValidationError('Invalid email format', 'email');
    }
    
    const { sql, values } = buildUpdateSQL('suppliers', data, 'supplier_id = ?');
    const result = await this.db.run(sql, [...values, id]);

    if (result.changes === 0) {
      throw new NotFoundError('Supplier', id);
    }

    return await this.findById(id);
  } catch (error) {
    handleDatabaseError(error, 'Supplier', id);
  }
}
```

**Error Types:**
- `NotFoundError(entity, id)` → 404 status
- `ValidationError(message, field?)` → 400 status
- `ConflictError(message)` → 409 status
- `DatabaseError(message, code?, statusCode?)` → Custom status

### Handling Constraint Violations

```typescript
// The handleDatabaseError utility automatically converts SQLite errors
try {
  await repo.create({ name: 'Duplicate' });
} catch (error) {
  // SQLite UNIQUE constraint violation automatically becomes ConflictError
  // SQLite FOREIGN KEY violation becomes ValidationError
}
```

## Utility Functions

### buildInsertSQL

Safely builds INSERT statements:

```typescript
const { sql, values } = buildInsertSQL('suppliers', {
  name: 'Acme Corp',
  email: 'contact@acme.com'
});
// sql: "INSERT INTO suppliers (name, email) VALUES (?, ?)"
// values: ["Acme Corp", "contact@acme.com"]
```

### buildUpdateSQL

Safely builds UPDATE statements:

```typescript
const { sql, values } = buildUpdateSQL('suppliers', {
  name: 'Updated Name'
}, 'supplier_id = ?');
// sql: "UPDATE suppliers SET name = ? WHERE supplier_id = ?"
// values: ["Updated Name"]
```

### objectToCamelCase

Transforms database rows to camelCase:

```typescript
const row = { supplier_id: 1, contact_person: 'John' };
const obj = objectToCamelCase(row);
// Result: { supplierId: 1, contactPerson: 'John' }
```

## Testing Repository Methods

### Unit Test Example

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createSuppliersRepository } from './suppliersRepo';

describe('SuppliersRepository', () => {
  let repo: SuppliersRepository;

  beforeEach(async () => {
    repo = await createSuppliersRepository(true); // In-memory database
  });

  it('should create and find a supplier', async () => {
    const created = await repo.create({ name: 'Test Corp' });
    expect(created.supplierId).toBeDefined();
    
    const found = await repo.findById(created.supplierId);
    expect(found).toEqual(created);
  });

  it('should update a supplier', async () => {
    const created = await repo.create({ name: 'Original' });
    const updated = await repo.update(created.supplierId, { name: 'Updated' });
    
    expect(updated.name).toBe('Updated');
  });

  it('should throw NotFoundError when deleting non-existent supplier', async () => {
    await expect(repo.delete(99999)).rejects.toThrow(NotFoundError);
  });
});
```

### Mocking Repositories in Route Tests

```typescript
import { vi } from 'vitest';

// Mock the repository module
vi.mock('../repositories/suppliersRepo', () => ({
  getSuppliersRepository: vi.fn(() => ({
    findAll: vi.fn(() => Promise.resolve([
      { supplierId: 1, name: 'Mocked Supplier' }
    ])),
    findById: vi.fn((id) => Promise.resolve({ supplierId: id, name: 'Mock' })),
  }))
}));
```

## Performance Optimization

### Index Usage

Ensure queries leverage indexes:

```typescript
// ✅ Uses index on supplier_id (primary key)
SELECT * FROM suppliers WHERE supplier_id = ?

// ✅ Uses index idx_products_supplier_id
SELECT * FROM products WHERE supplier_id = ?

// ❌ Full table scan - consider adding index
SELECT * FROM suppliers WHERE email = ?
```

Use `EXPLAIN QUERY PLAN` to verify index usage:

```sql
EXPLAIN QUERY PLAN SELECT * FROM products WHERE supplier_id = 5;
```

### Batch Operations

For inserting multiple records, use a transaction:

```typescript
async createMany(suppliers: Omit<Supplier, 'supplierId'>[]): Promise<Supplier[]> {
  try {
    await this.db.run('BEGIN TRANSACTION');
    
    const created: Supplier[] = [];
    
    try {
      for (const supplier of suppliers) {
        const result = await this.create(supplier);
        created.push(result);
      }
      
      await this.db.run('COMMIT');
      return created;
    } catch (error) {
      await this.db.run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    handleDatabaseError(error);
  }
}
```

### Avoiding N+1 Queries

Use JOINs or batch queries instead of loops:

```typescript
// ❌ N+1 problem
const branches = await branchRepo.findAll();
for (const branch of branches) {
  branch.headquarters = await hqRepo.findById(branch.headquartersId);
}

// ✅ Single JOIN query
const branchesWithHQ = await branchRepo.findBranchesWithHeadquarters();
```

## Common Patterns and Anti-Patterns

### ✅ DO: Use Parameterized Queries

```typescript
await db.get('SELECT * FROM suppliers WHERE supplier_id = ?', [id]);
```

### ❌ DON'T: Concatenate User Input

```typescript
await db.get(`SELECT * FROM suppliers WHERE supplier_id = ${id}`); // SQL injection risk!
```

### ✅ DO: Return Domain Objects

```typescript
return objectToCamelCase(row) as Supplier;
```

### ❌ DON'T: Return Raw Database Rows

```typescript
return row; // Exposes snake_case database structure
```

### ✅ DO: Use Partial for Updates

```typescript
async update(id: number, data: Partial<Supplier>): Promise<Supplier>
```

### ❌ DON'T: Require All Fields for Updates

```typescript
async update(id: number, data: Supplier): Promise<Supplier> // Forces all fields
```

### ✅ DO: Check Changes for Updates/Deletes

```typescript
if (result.changes === 0) {
  throw new NotFoundError('Supplier', id);
}
```

### ❌ DON'T: Assume Operation Succeeded

```typescript
await db.run('DELETE FROM suppliers WHERE supplier_id = ?', [id]);
// No check if anything was deleted
```

## Related Documentation

- [API Architecture](./api-architecture.md) - Overall API design and layers
- [SQLite Integration](./sqlite-integration.md) - Database setup and configuration
- [API Development Guide](./api-development.md) - Step-by-step guide for new features
