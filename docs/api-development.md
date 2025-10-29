# API Development Guide

## Overview

This guide provides step-by-step instructions for adding new features to the OctoCAT Supply Chain Management API. Follow these patterns for consistency and maintainability.

## Prerequisites

Before you begin development:

1. **Understand the architecture** - Read [API Architecture](./api-architecture.md)
2. **Learn repository patterns** - Read [Repository Patterns](./repository-patterns.md)
3. **Set up your environment** - Ensure Node.js, npm, and development tools are installed
4. **Build and test** - Verify the API builds and all tests pass

```bash
# Install dependencies
npm install

# Build the API
npm run build --workspace=api

# Run tests
npm test --workspace=api

# Start development server
npm run dev --workspace=api
```

## Adding a New Entity

Follow these steps to add a complete new entity to the API.

### Step 1: Create Database Migration

Create a new migration file in `api/sql/migrations/` with the next sequential number:

**File:** `api/sql/migrations/002_add_categories.sql`

```sql
-- Migration 002: Add categories table
-- Description: Add product categories support

CREATE TABLE categories (
    category_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_category_id INTEGER,
    FOREIGN KEY (parent_category_id) REFERENCES categories(category_id) ON DELETE SET NULL
);

-- Add index for parent category lookups
CREATE INDEX idx_categories_parent_id ON categories(parent_category_id);

-- Add category_id to products table
ALTER TABLE products ADD COLUMN category_id INTEGER REFERENCES categories(category_id) ON DELETE SET NULL;

-- Add index for product category lookups
CREATE INDEX idx_products_category_id ON products(category_id);
```

**Key Points:**
- Use sequential numbering: `002_`, `003_`, etc.
- Include descriptive comment at top
- Define foreign keys with appropriate ON DELETE behavior
- Add indexes for foreign keys and frequently queried columns
- Migrations are immutable - never edit existing ones

### Step 2: Create Seed Data (Optional)

If you need sample data, create a seed file in `api/sql/seed/`:

**File:** `api/sql/seed/005_categories.sql`

```sql
-- Seed data for categories table

INSERT INTO categories (category_id, name, description, parent_category_id) VALUES
(1, 'Electronics', 'Electronic products and components', NULL),
(2, 'Office Supplies', 'Office and stationery items', NULL),
(3, 'Furniture', 'Office and warehouse furniture', NULL),
(4, 'Computers', 'Desktop and laptop computers', 1),
(5, 'Networking', 'Network equipment and cables', 1);

-- Update some existing products with categories
UPDATE products SET category_id = 4 WHERE name LIKE '%Computer%';
UPDATE products SET category_id = 5 WHERE name LIKE '%Cable%';
```

**Key Points:**
- Use explicit IDs for seed data for consistency
- Maintain referential integrity (insert parents before children)
- Keep seed data minimal but representative

### Step 3: Create TypeScript Model

Create a model interface in `api/src/models/`:

**File:** `api/src/models/category.ts`

```typescript
/**
 * Category model representing product categories
 */
export interface Category {
  categoryId: number;
  name: string;
  description?: string;
  parentCategoryId?: number;
}

/**
 * Category with subcategories (for hierarchical queries)
 */
export interface CategoryWithChildren extends Category {
  subcategories: Category[];
}
```

**Key Points:**
- Use camelCase for property names (matches JavaScript conventions)
- Mark optional fields with `?`
- Export any related types or interfaces
- Add JSDoc comments for clarity
- Consider creating extended interfaces for specialized queries

### Step 4: Create Repository

Create a repository class in `api/src/repositories/`:

**File:** `api/src/repositories/categoriesRepo.ts`

```typescript
/**
 * Repository for categories data access
 */

import { getDatabase, DatabaseConnection } from '../db/sqlite';
import { Category, CategoryWithChildren } from '../models/category';
import { handleDatabaseError, NotFoundError } from '../utils/errors';
import { buildInsertSQL, buildUpdateSQL, objectToCamelCase } from '../utils/sql';

export class CategoriesRepository {
  private db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  /**
   * Get all categories
   */
  async findAll(): Promise<Category[]> {
    try {
      const rows = await this.db.all<any>('SELECT * FROM categories ORDER BY name');
      return rows.map((row) => objectToCamelCase(row) as Category);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Get category by ID
   */
  async findById(id: number): Promise<Category | null> {
    try {
      const row = await this.db.get<any>('SELECT * FROM categories WHERE category_id = ?', [id]);
      return row ? (objectToCamelCase(row) as Category) : null;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Create a new category
   */
  async create(category: Omit<Category, 'categoryId'>): Promise<Category> {
    try {
      const { sql, values } = buildInsertSQL('categories', category);
      const result = await this.db.run(sql, values);

      const created = await this.findById(result.lastID!);
      if (!created) {
        throw new Error('Failed to retrieve created category');
      }

      return created;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Update category by ID
   */
  async update(id: number, category: Partial<Omit<Category, 'categoryId'>>): Promise<Category> {
    try {
      const { sql, values } = buildUpdateSQL('categories', category, 'category_id = ?');
      const result = await this.db.run(sql, [...values, id]);

      if (result.changes === 0) {
        throw new NotFoundError('Category', id);
      }

      const updated = await this.findById(id);
      if (!updated) {
        throw new Error('Failed to retrieve updated category');
      }

      return updated;
    } catch (error) {
      handleDatabaseError(error, 'Category', id);
    }
  }

  /**
   * Delete category by ID
   */
  async delete(id: number): Promise<void> {
    try {
      const result = await this.db.run('DELETE FROM categories WHERE category_id = ?', [id]);

      if (result.changes === 0) {
        throw new NotFoundError('Category', id);
      }
    } catch (error) {
      handleDatabaseError(error, 'Category', id);
    }
  }

  /**
   * Get top-level categories (no parent)
   */
  async findRootCategories(): Promise<Category[]> {
    try {
      const rows = await this.db.all<any>(
        'SELECT * FROM categories WHERE parent_category_id IS NULL ORDER BY name'
      );
      return rows.map((row) => objectToCamelCase(row) as Category);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Get subcategories of a parent category
   */
  async findSubcategories(parentId: number): Promise<Category[]> {
    try {
      const rows = await this.db.all<any>(
        'SELECT * FROM categories WHERE parent_category_id = ? ORDER BY name',
        [parentId]
      );
      return rows.map((row) => objectToCamelCase(row) as Category);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Get category hierarchy (category with all subcategories)
   */
  async findCategoryHierarchy(id: number): Promise<CategoryWithChildren | null> {
    try {
      const category = await this.findById(id);
      if (!category) {
        return null;
      }

      const subcategories = await this.findSubcategories(id);

      return {
        ...category,
        subcategories,
      };
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}

// Factory function to create repository instance
export async function createCategoriesRepository(
  isTest: boolean = false
): Promise<CategoriesRepository> {
  const db = await getDatabase(isTest);
  return new CategoriesRepository(db);
}

// Singleton instance for default usage
let categoriesRepo: CategoriesRepository | null = null;

export async function getCategoriesRepository(
  isTest: boolean = false
): Promise<CategoriesRepository> {
  const isTestEnv = isTest || process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
  if (isTestEnv) {
    return createCategoriesRepository(true);
  }
  if (!categoriesRepo) {
    categoriesRepo = await createCategoriesRepository(false);
  }
  return categoriesRepo;
}
```

**Key Points:**
- Follow the standard repository structure
- Include standard CRUD methods: `findAll`, `findById`, `create`, `update`, `delete`
- Add domain-specific query methods as needed
- Use utility functions for SQL building
- Implement singleton pattern with factory functions
- Add JSDoc comments for all methods

### Step 5: Create Routes

Create route handlers in `api/src/routes/`:

**File:** `api/src/routes/category.ts`

```typescript
/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: API endpoints for managing product categories
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Returns all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of all categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               parentCategoryId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Validation error
 */

import express from 'express';
import { Category } from '../models/category';
import { getCategoriesRepository } from '../repositories/categoriesRepo';
import { NotFoundError } from '../utils/errors';

const router = express.Router();

// Get all categories
router.get('/', async (req, res, next) => {
  try {
    const repo = await getCategoriesRepository();
    const categories = await repo.findAll();
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

// Get category by ID
router.get('/:id', async (req, res, next) => {
  try {
    const repo = await getCategoriesRepository();
    const category = await repo.findById(parseInt(req.params.id));
    
    if (!category) {
      throw new NotFoundError('Category', req.params.id);
    }
    
    res.json(category);
  } catch (error) {
    next(error);
  }
});

// Get category hierarchy (with subcategories)
router.get('/:id/hierarchy', async (req, res, next) => {
  try {
    const repo = await getCategoriesRepository();
    const hierarchy = await repo.findCategoryHierarchy(parseInt(req.params.id));
    
    if (!hierarchy) {
      throw new NotFoundError('Category', req.params.id);
    }
    
    res.json(hierarchy);
  } catch (error) {
    next(error);
  }
});

// Create a new category
router.post('/', async (req, res, next) => {
  try {
    const repo = await getCategoriesRepository();
    const newCategory = await repo.create(req.body as Omit<Category, 'categoryId'>);
    res.status(201).json(newCategory);
  } catch (error) {
    next(error);
  }
});

// Update a category
router.put('/:id', async (req, res, next) => {
  try {
    const repo = await getCategoriesRepository();
    const updated = await repo.update(parseInt(req.params.id), req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Delete a category
router.delete('/:id', async (req, res, next) => {
  try {
    const repo = await getCategoriesRepository();
    await repo.delete(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
```

**Key Points:**
- Add Swagger/JSDoc comments for each endpoint
- Use async/await for all database operations
- Always pass errors to `next(error)` for middleware handling
- Use appropriate HTTP status codes (200, 201, 204, 404, etc.)
- Parse route parameters with `parseInt()` for numeric IDs
- Export router as default

### Step 6: Register Routes in Main Application

Add the route to `api/src/index.ts`:

```typescript
import categoryRouter from './routes/category';

// ... existing code ...

// Register routes
app.use('/api/suppliers', suppliersRouter);
app.use('/api/categories', categoryRouter);  // Add this line
// ... other routes ...
```

**Key Points:**
- Import the router
- Register with appropriate path prefix
- Place before error handler middleware
- Use RESTful URL patterns

### Step 7: Update Swagger Schema

Add the schema definition to `api/api-swagger.json` under `components.schemas`:

```json
{
  "components": {
    "schemas": {
      "Category": {
        "type": "object",
        "required": ["categoryId", "name"],
        "properties": {
          "categoryId": {
            "type": "integer",
            "description": "The unique identifier for the category"
          },
          "name": {
            "type": "string",
            "description": "The name of the category"
          },
          "description": {
            "type": "string",
            "description": "Category description"
          },
          "parentCategoryId": {
            "type": "integer",
            "description": "The ID of the parent category (for hierarchical categories)"
          }
        }
      }
    }
  }
}
```

**Key Points:**
- Use the same property names as TypeScript model (camelCase)
- Mark required fields in the `required` array
- Add descriptions for each property
- Use appropriate JSON Schema types

### Step 8: Write Tests

Create repository tests:

**File:** `api/src/repositories/categoriesRepo.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createCategoriesRepository } from './categoriesRepo';
import { NotFoundError } from '../utils/errors';

describe('CategoriesRepository', () => {
  let repo: ReturnType<typeof createCategoriesRepository> extends Promise<infer T> ? T : never;

  beforeEach(async () => {
    repo = await createCategoriesRepository(true); // In-memory test database
  });

  describe('create', () => {
    it('should create a new category', async () => {
      const category = await repo.create({
        name: 'Electronics',
        description: 'Electronic products',
      });

      expect(category.categoryId).toBeDefined();
      expect(category.name).toBe('Electronics');
      expect(category.description).toBe('Electronic products');
    });

    it('should create a subcategory', async () => {
      const parent = await repo.create({ name: 'Electronics' });
      const child = await repo.create({
        name: 'Computers',
        parentCategoryId: parent.categoryId,
      });

      expect(child.parentCategoryId).toBe(parent.categoryId);
    });
  });

  describe('findById', () => {
    it('should find category by ID', async () => {
      const created = await repo.create({ name: 'Test Category' });
      const found = await repo.findById(created.categoryId);

      expect(found).toEqual(created);
    });

    it('should return null for non-existent ID', async () => {
      const found = await repo.findById(99999);
      expect(found).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const created = await repo.create({ name: 'Original' });
      const updated = await repo.update(created.categoryId, {
        name: 'Updated',
        description: 'New description',
      });

      expect(updated.name).toBe('Updated');
      expect(updated.description).toBe('New description');
    });

    it('should throw NotFoundError for non-existent category', async () => {
      await expect(repo.update(99999, { name: 'Test' })).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should delete a category', async () => {
      const created = await repo.create({ name: 'To Delete' });
      await repo.delete(created.categoryId);

      const found = await repo.findById(created.categoryId);
      expect(found).toBeNull();
    });

    it('should throw NotFoundError for non-existent category', async () => {
      await expect(repo.delete(99999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('findSubcategories', () => {
    it('should find subcategories of a parent', async () => {
      const parent = await repo.create({ name: 'Electronics' });
      const child1 = await repo.create({ name: 'Computers', parentCategoryId: parent.categoryId });
      const child2 = await repo.create({ name: 'Phones', parentCategoryId: parent.categoryId });

      const subcategories = await repo.findSubcategories(parent.categoryId);

      expect(subcategories).toHaveLength(2);
      expect(subcategories.map((c) => c.name)).toContain('Computers');
      expect(subcategories.map((c) => c.name)).toContain('Phones');
    });
  });
});
```

Create route integration tests:

**File:** `api/src/routes/category.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import categoryRouter from './category';
import { errorHandler } from '../utils/errors';

const app = express();
app.use(express.json());
app.use('/api/categories', categoryRouter);
app.use(errorHandler);

describe('Category API', () => {
  let createdCategoryId: number;

  it('should create a new category', async () => {
    const response = await request(app)
      .post('/api/categories')
      .send({
        name: 'Test Category',
        description: 'A test category',
      })
      .expect(201);

    expect(response.body).toHaveProperty('categoryId');
    expect(response.body.name).toBe('Test Category');
    createdCategoryId = response.body.categoryId;
  });

  it('should get all categories', async () => {
    const response = await request(app).get('/api/categories').expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should get a category by ID', async () => {
    const response = await request(app)
      .get(`/api/categories/${createdCategoryId}`)
      .expect(200);

    expect(response.body.categoryId).toBe(createdCategoryId);
    expect(response.body.name).toBe('Test Category');
  });

  it('should return 404 for non-existent category', async () => {
    await request(app).get('/api/categories/99999').expect(404);
  });

  it('should update a category', async () => {
    const response = await request(app)
      .put(`/api/categories/${createdCategoryId}`)
      .send({ name: 'Updated Category' })
      .expect(200);

    expect(response.body.name).toBe('Updated Category');
  });

  it('should delete a category', async () => {
    await request(app).delete(`/api/categories/${createdCategoryId}`).expect(204);

    // Verify it's deleted
    await request(app).get(`/api/categories/${createdCategoryId}`).expect(404);
  });
});
```

**Key Points:**
- Test all CRUD operations
- Test error cases (NotFoundError, etc.)
- Use `beforeEach` to set up test database
- Use in-memory database for fast tests
- Test both happy paths and error cases

### Step 9: Run Tests and Build

```bash
# Run tests
npm test --workspace=api

# Build to check for TypeScript errors
npm run build --workspace=api

# Start development server to manually test
npm run dev --workspace=api
```

Visit `http://localhost:3000/api-docs` to see Swagger UI and test your endpoints.

## Common Development Tasks

### Adding Query Parameters

```typescript
// In route handler
router.get('/', async (req, res, next) => {
  try {
    const { search, parentId } = req.query;
    const repo = await getCategoriesRepository();
    
    let categories;
    if (search) {
      categories = await repo.findByName(search as string);
    } else if (parentId) {
      categories = await repo.findSubcategories(parseInt(parentId as string));
    } else {
      categories = await repo.findAll();
    }
    
    res.json(categories);
  } catch (error) {
    next(error);
  }
});
```

### Adding Pagination

```typescript
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    
    const repo = await getCategoriesRepository();
    const result = await repo.findAll(page, pageSize);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});
```

### Adding Validation

```typescript
import { ValidationError } from '../utils/errors';

router.post('/', async (req, res, next) => {
  try {
    const { name } = req.body;
    
    // Basic validation
    if (!name || name.trim().length === 0) {
      throw new ValidationError('Name is required', 'name');
    }
    
    if (name.length > 100) {
      throw new ValidationError('Name must be 100 characters or less', 'name');
    }
    
    const repo = await getCategoriesRepository();
    const category = await repo.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
});
```

## Debugging Tips

### Enable SQL Query Logging

Add this to your repository method during development:

```typescript
console.log('SQL:', sql);
console.log('Values:', values);
```

### Use SQLite EXPLAIN QUERY PLAN

```typescript
const plan = await this.db.all('EXPLAIN QUERY PLAN SELECT * FROM products WHERE supplier_id = ?', [5]);
console.log('Query plan:', plan);
```

### Check Database State

```bash
# Open SQLite CLI
sqlite3 api/data/app.db

# Run queries
SELECT * FROM categories;
.schema categories
```

### Use Vitest Debug Mode

```bash
# Run a specific test file
npx vitest run categoriesRepo.test.ts

# Watch mode for development
npx vitest watch categoriesRepo.test.ts
```

## Best Practices Checklist

When adding new features, ensure:

- [ ] Migration file is sequential and immutable
- [ ] Foreign keys have appropriate ON DELETE behavior
- [ ] Indexes are added for foreign keys and queried columns
- [ ] TypeScript model uses camelCase properties
- [ ] Repository follows standard CRUD pattern
- [ ] All queries use parameterized statements
- [ ] Error handling uses custom error types
- [ ] Routes delegate to repositories (thin controller)
- [ ] Swagger documentation is complete
- [ ] Unit tests cover all repository methods
- [ ] Integration tests cover all routes
- [ ] Code builds without TypeScript errors
- [ ] All tests pass

## Related Documentation

- [API Architecture](./api-architecture.md) - Overall API design
- [Repository Patterns](./repository-patterns.md) - Data access patterns
- [SQLite Integration](./sqlite-integration.md) - Database configuration
