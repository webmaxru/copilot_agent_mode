# SQLite Database Integration

This document explains how to use the SQLite database integration in the OctoCAT Supply Chain Management API.

## Overview

The API has been migrated from in-memory data storage to a persistent SQLite database. This provides:

- **Data persistence** - Data survives server restarts
- **ACID transactions** - Reliable data consistency
- **Proper relationships** - Foreign key constraints between entities
- **Performance** - Indexed queries for better performance
- **Testing** - In-memory database for unit tests

## Database Structure

The database consists of the following tables:

- `suppliers` - Supplier information
- `headquarters` - Company headquarters data
- `branches` - Branch locations (linked to headquarters)
- `products` - Product catalog (linked to suppliers)
- `orders` - Customer orders (linked to branches)
- `order_details` - Order line items (linked to orders and products)
- `deliveries` - Delivery tracking (linked to suppliers)
- `order_detail_deliveries` - Junction table for order-delivery relationships
- `migrations` - Database schema version tracking

For detailed schema documentation including column definitions, relationships, and constraints, see the [Complete Schema Reference](#complete-schema-reference) section below.

## Getting Started

### 1. Database Initialization

When you start the server for the first time, the database will be automatically initialized:

```bash
npm run dev
```

This will:
- Create the SQLite database file at `api/data/app.db`
- Run all pending migrations
- Seed the database with sample data (if empty)

### 2. Manual Database Management

You can also manage the database manually:

```bash
# Initialize database with migrations and seed data
npm run db:init

# Run migrations only (no seeding)
npm run db:migrate

# Seed database only
npm run db:seed
```

### 3. Database Location

The database file is stored at:
- **Development**: `api/data/app.db`
- **Testing**: In-memory (`:memory:`)

You can override the database location using the `DB_FILE` environment variable:

```bash
export DB_FILE=/path/to/your/database.db
```

## Repository Pattern

The API uses the Repository pattern to interact with the database:

### Using Repositories

```typescript
import { getSuppliersRepository } from './repositories/suppliersRepo';

const repo = await getSuppliersRepository();

// Get all suppliers
const suppliers = await repo.findAll();

// Get supplier by ID
const supplier = await repo.findById(1);

// Create new supplier
const newSupplier = await repo.create({
    name: 'New Supplier',
    description: 'Description',
    contactPerson: 'John Doe',
    email: 'john@example.com',
    phone: '555-1234'
});

// Update supplier
const updated = await repo.update(1, { name: 'Updated Name' });

// Delete supplier
await repo.delete(1);

// Search by name
const results = await repo.findByName('Tech');
```

### Repository Features

- **Type Safety** - Full TypeScript support
- **Error Handling** - Proper error types (NotFoundError, ValidationError, etc.)
- **SQL Injection Protection** - Parameterized queries
- **Automatic Mapping** - Converts between snake_case (database) and camelCase (JavaScript)

## Database Schema Management

### Migrations

Database schema changes are managed through migration files:

1. Create a new migration file: `api/sql/migrations/002_description.sql`
2. Add your SQL statements
3. Run migrations: `npm run db:migrate`

Migration files are executed in order and tracked in the `migrations` table.

### Seed Data

Sample data is provided through seed files in `api/sql/seed/`:

- `001_suppliers.sql` - Supplier data
- `002_headquarters.sql` - Headquarters data
- `003_branches.sql` - Branch data
- `004_products.sql` - Product catalog

## Testing Strategy

### Unit Tests

Repositories are tested using mocked database connections:

```typescript
import { vi } from 'vitest';
import { SuppliersRepository } from '../repositories/suppliersRepo';

// Mock database
const mockDb = {
    run: vi.fn(),
    get: vi.fn(),
    all: vi.fn(),
    close: vi.fn()
};

// Test repository methods
const repo = new SuppliersRepository(mockDb);
```

### Integration Tests

For integration tests, use an in-memory database:

```typescript
import { getDatabase } from '../db/sqlite';

const db = await getDatabase(true); // true = test mode (in-memory)
```

## Configuration

Database configuration is managed in `api/src/db/config.ts`:

```typescript
export const DB_CONFIG = {
    DB_FILE: process.env.DB_FILE || './data/app.db',
    DB_ENGINE: process.env.DB_ENGINE || 'sqlite',
    ENABLE_WAL: process.env.DB_ENABLE_WAL !== 'false',
    TIMEOUT: parseInt(process.env.DB_TIMEOUT || '30000'),
    FOREIGN_KEYS: process.env.DB_FOREIGN_KEYS !== 'false'
};
```

### Environment Variables

- `DB_FILE` - Database file path (default: `./data/app.db`)
- `DB_ENGINE` - Database engine (default: `sqlite`)
- `DB_ENABLE_WAL` - Enable WAL mode (default: `true`)
- `DB_TIMEOUT` - Connection timeout in ms (default: `30000`)
- `DB_FOREIGN_KEYS` - Enable foreign key constraints (default: `true`)

## Error Handling

The system provides specialized error types:

- `DatabaseError` - General database errors
- `NotFoundError` - Entity not found (404)
- `ValidationError` - Invalid data (400)
- `ConflictError` - Constraint violations (409)

These errors are automatically handled by the Express error middleware and return appropriate HTTP status codes.

## Performance Considerations

The database includes several optimizations:

- **Indexes** - On foreign keys and frequently queried columns
- **WAL Mode** - Better concurrency for read/write operations
- **Connection Pooling** - Reuses database connections
- **Query Optimization** - Parameterized queries prevent SQL injection

## Backup and Recovery

Since SQLite stores data in a single file, backup is straightforward:

```bash
# Backup database
cp api/data/app.db api/data/app-backup-$(date +%Y%m%d).db

# Restore from backup
cp api/data/app-backup-20231225.db api/data/app.db
```

For production deployments, consider regular automated backups.

## Troubleshooting

### Common Issues

1. **Database locked**: Usually caused by long-running transactions or unclosed connections
   - Solution: Ensure all database operations are properly awaited and connections are closed

2. **Foreign key constraint errors**: Trying to reference non-existent records
   - Solution: Ensure referenced records exist before creating relationships

3. **Migration errors**: SQL syntax errors or conflicting schema changes
   - Solution: Check migration file syntax and ensure compatibility with existing schema

### Debug Mode

Enable verbose SQLite logging:

```bash
NODE_ENV=development npm run dev
```

This will show all SQL queries being executed.

## Complete Schema Reference

### Entity Relationship Diagram

The database follows this ERD structure:

```
Headquarters (1) ──→ (M) Branches (M) ──→ (1) Orders (1) ──→ (M) OrderDetails
                                                                      ↓ (M)
Suppliers (1) ──→ (M) Products (1) ──────────────────────────────→ (1)
    ↓ (1)                                                              ↓ (M)
    ↓                                                                  ↓
Deliveries (1) ──→ (M) OrderDetailDeliveries (M) ──────────────────→ (1)
```

### Table Schemas

#### suppliers

Stores supplier information and contact details.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| supplier_id | INTEGER | PRIMARY KEY | Auto-incrementing unique identifier |
| name | TEXT | NOT NULL | Supplier company name |
| description | TEXT | | Additional supplier information |
| contact_person | TEXT | | Primary contact name |
| email | TEXT | | Contact email address |
| phone | TEXT | | Contact phone number |

**Relationships:**
- One supplier can have many products (1:M)
- One supplier can have many deliveries (1:M)

**Indexes:**
- Primary key on `supplier_id`

#### headquarters

Stores company headquarters information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| headquarters_id | INTEGER | PRIMARY KEY | Auto-incrementing unique identifier |
| name | TEXT | NOT NULL | Headquarters name |
| description | TEXT | | Additional information |
| address | TEXT | | Physical address |
| contact_person | TEXT | | Primary contact name |
| email | TEXT | | Contact email address |
| phone | TEXT | | Contact phone number |

**Relationships:**
- One headquarters can have many branches (1:M)

**Indexes:**
- Primary key on `headquarters_id`

#### branches

Stores branch locations linked to headquarters.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| branch_id | INTEGER | PRIMARY KEY | Auto-incrementing unique identifier |
| headquarters_id | INTEGER | NOT NULL, FK → headquarters | Parent headquarters |
| name | TEXT | NOT NULL | Branch name |
| description | TEXT | | Additional information |
| address | TEXT | | Physical address |
| contact_person | TEXT | | Primary contact name |
| email | TEXT | | Contact email address |
| phone | TEXT | | Contact phone number |

**Relationships:**
- Many branches belong to one headquarters (M:1)
- One branch can have many orders (1:M)

**Foreign Keys:**
- `headquarters_id` REFERENCES `headquarters(headquarters_id)` ON DELETE CASCADE

**Indexes:**
- Primary key on `branch_id`
- Index on `headquarters_id` for efficient JOIN queries

#### products

Stores product catalog linked to suppliers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| product_id | INTEGER | PRIMARY KEY | Auto-incrementing unique identifier |
| supplier_id | INTEGER | NOT NULL, FK → suppliers | Supplier providing this product |
| name | TEXT | NOT NULL | Product name |
| description | TEXT | | Detailed product description |
| price | REAL | NOT NULL | Current price |
| sku | TEXT | NOT NULL | Stock Keeping Unit (product code) |
| unit | TEXT | NOT NULL | Unit of measure (e.g., "box", "kg") |
| img_name | TEXT | | Image filename for product |
| discount | REAL | DEFAULT 0.0 | Discount percentage (0.0 to 1.0) |

**Relationships:**
- Many products belong to one supplier (M:1)
- One product can appear in many order details (1:M)

**Foreign Keys:**
- `supplier_id` REFERENCES `suppliers(supplier_id)` ON DELETE CASCADE

**Indexes:**
- Primary key on `product_id`
- Index on `supplier_id` for efficient JOIN queries
- Index on `sku` for quick product lookups

#### orders

Stores customer orders placed by branches.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| order_id | INTEGER | PRIMARY KEY | Auto-incrementing unique identifier |
| branch_id | INTEGER | NOT NULL, FK → branches | Branch that placed the order |
| order_date | TEXT | NOT NULL | Order placement date (ISO 8601 format) |
| name | TEXT | NOT NULL | Order name/reference |
| description | TEXT | | Additional order information |
| status | TEXT | NOT NULL, DEFAULT 'pending' | Order status (pending, processing, shipped, delivered, cancelled) |

**Relationships:**
- Many orders belong to one branch (M:1)
- One order can have many order details (1:M)

**Foreign Keys:**
- `branch_id` REFERENCES `branches(branch_id)` ON DELETE CASCADE

**Indexes:**
- Primary key on `order_id`
- Index on `branch_id` for efficient JOIN queries
- Index on `status` for filtering by order status

**Status Values:**
- `pending` - Order received but not yet processed
- `processing` - Order is being prepared
- `shipped` - Order has been shipped
- `delivered` - Order has been delivered
- `cancelled` - Order was cancelled

#### order_details

Stores individual line items for each order.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| order_detail_id | INTEGER | PRIMARY KEY | Auto-incrementing unique identifier |
| order_id | INTEGER | NOT NULL, FK → orders | Parent order |
| product_id | INTEGER | NOT NULL, FK → products | Product being ordered |
| quantity | INTEGER | NOT NULL | Quantity ordered |
| unit_price | REAL | NOT NULL | Price per unit at time of order |
| notes | TEXT | | Additional notes for this line item |

**Relationships:**
- Many order details belong to one order (M:1)
- Many order details reference one product (M:1)
- One order detail can have many order detail deliveries (1:M)

**Foreign Keys:**
- `order_id` REFERENCES `orders(order_id)` ON DELETE CASCADE
- `product_id` REFERENCES `products(product_id)` ON DELETE CASCADE

**Indexes:**
- Primary key on `order_detail_id`
- Index on `order_id` for efficient JOIN queries
- Index on `product_id` for product-based queries

**Business Logic:**
- `unit_price` is captured at order time (may differ from current product price)
- Total for line item = `quantity * unit_price`

#### deliveries

Stores delivery tracking information from suppliers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| delivery_id | INTEGER | PRIMARY KEY | Auto-incrementing unique identifier |
| supplier_id | INTEGER | NOT NULL, FK → suppliers | Supplier providing the delivery |
| delivery_date | TEXT | NOT NULL | Delivery date (ISO 8601 format) |
| name | TEXT | NOT NULL | Delivery name/reference |
| description | TEXT | | Additional delivery information |
| status | TEXT | NOT NULL, DEFAULT 'pending' | Delivery status |

**Relationships:**
- Many deliveries belong to one supplier (M:1)
- One delivery can fulfill many order detail deliveries (1:M)

**Foreign Keys:**
- `supplier_id` REFERENCES `suppliers(supplier_id)` ON DELETE CASCADE

**Indexes:**
- Primary key on `delivery_id`
- Index on `supplier_id` for efficient JOIN queries
- Index on `status` for filtering by delivery status

**Status Values:**
- `pending` - Delivery scheduled but not yet dispatched
- `in-transit` - Delivery is on the way
- `delivered` - Delivery has been completed
- `failed` - Delivery attempt failed

#### order_detail_deliveries

Junction table linking order details to deliveries (many-to-many relationship).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| order_detail_delivery_id | INTEGER | PRIMARY KEY | Auto-incrementing unique identifier |
| order_detail_id | INTEGER | NOT NULL, FK → order_details | Order detail being fulfilled |
| delivery_id | INTEGER | NOT NULL, FK → deliveries | Delivery fulfilling the order |
| quantity | INTEGER | NOT NULL | Quantity being delivered |
| notes | TEXT | | Additional notes for this delivery |

**Relationships:**
- Many order detail deliveries belong to one order detail (M:1)
- Many order detail deliveries belong to one delivery (M:1)

**Foreign Keys:**
- `order_detail_id` REFERENCES `order_details(order_detail_id)` ON DELETE CASCADE
- `delivery_id` REFERENCES `deliveries(delivery_id)` ON DELETE CASCADE

**Indexes:**
- Primary key on `order_detail_delivery_id`
- Index on `order_detail_id` for efficient JOIN queries
- Index on `delivery_id` for efficient JOIN queries

**Business Logic:**
- One order detail can be fulfilled by multiple deliveries (partial shipments)
- Sum of quantities across all deliveries should not exceed order detail quantity

### Relationship Examples

#### Example 1: Finding all products from a specific supplier

```sql
SELECT p.*
FROM products p
JOIN suppliers s ON p.supplier_id = s.supplier_id
WHERE s.name = 'Acme Corporation';
```

#### Example 2: Finding all orders for a headquarters

```sql
SELECT o.*
FROM orders o
JOIN branches b ON o.branch_id = b.branch_id
JOIN headquarters h ON b.headquarters_id = h.headquarters_id
WHERE h.name = 'Global HQ';
```

#### Example 3: Order fulfillment status

```sql
SELECT 
    od.order_detail_id,
    od.quantity AS ordered_quantity,
    COALESCE(SUM(odd.quantity), 0) AS delivered_quantity,
    od.quantity - COALESCE(SUM(odd.quantity), 0) AS remaining_quantity
FROM order_details od
LEFT JOIN order_detail_deliveries odd ON od.order_detail_id = odd.order_detail_id
LEFT JOIN deliveries d ON odd.delivery_id = d.delivery_id AND d.status = 'delivered'
GROUP BY od.order_detail_id;
```

#### Example 4: Products by category with supplier info

```sql
SELECT 
    p.name AS product_name,
    p.price,
    s.name AS supplier_name,
    s.contact_person
FROM products p
JOIN suppliers s ON p.supplier_id = s.supplier_id
ORDER BY p.name;
```

### Migration Strategy and Best Practices

#### Migration Principles

1. **Immutability** - Never modify existing migration files
2. **Sequential Ordering** - Migrations run in numerical order (001, 002, 003, etc.)
3. **Idempotency** - Use `IF NOT EXISTS` where possible to allow re-running
4. **Atomic Changes** - Each migration should represent one logical change
5. **Testing** - Test migrations on a copy of production data before deployment

#### Adding a New Migration

1. **Create new file** with next sequential number: `002_add_categories.sql`
2. **Add descriptive comment** at the top explaining the change
3. **Write forward migration** (schema changes)
4. **Test migration** on development database
5. **Update seed data** if necessary to maintain referential integrity

Example migration file:

```sql
-- Migration 002: Add product categories
-- Description: Adds categories table and links products to categories

CREATE TABLE IF NOT EXISTS categories (
    category_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

ALTER TABLE products ADD COLUMN category_id INTEGER REFERENCES categories(category_id);
CREATE INDEX idx_products_category_id ON products(category_id);
```

#### Rollback Strategy

SQLite does not support all ALTER TABLE operations, so some migrations cannot be easily rolled back. Document rollback steps in comments:

```sql
-- Rollback: To undo this migration:
-- 1. DROP TABLE categories;
-- 2. Remove category_id column from products (requires table recreation)
```

For production, consider:
- Taking database backups before running migrations
- Testing migrations on staging environment first
- Documenting manual rollback procedures

### Seed Data Management

#### Current Seed Files

1. `001_suppliers.sql` - Sample supplier data
2. `002_headquarters.sql` - Sample headquarters data
3. `003_branches.sql` - Sample branch data (references headquarters)
4. `004_products.sql` - Sample product catalog (references suppliers)

#### Seed Data Best Practices

1. **Explicit IDs** - Use explicit IDs for seed data to ensure consistency
2. **Referential Order** - Insert parent records before children
3. **Realistic Data** - Use realistic sample data for demos
4. **Minimal Set** - Keep seed data minimal but representative
5. **Idempotency** - Use `INSERT OR IGNORE` to allow re-seeding

Example seed file:

```sql
-- Seed data for suppliers

INSERT OR IGNORE INTO suppliers (supplier_id, name, description, contact_person, email, phone) VALUES
(1, 'Tech Supplies Inc.', 'Technology and electronics supplier', 'John Smith', 'john@techsupplies.com', '555-0101'),
(2, 'Office Essentials', 'Office supplies and furniture', 'Jane Doe', 'jane@officeessentials.com', '555-0102');
```

### Data Integrity and Constraints

#### Foreign Key Enforcement

Foreign keys are enabled by default in the configuration:

```typescript
// api/src/db/config.ts
FOREIGN_KEYS: process.env.DB_FOREIGN_KEYS !== 'false'
```

This ensures:
- Cannot insert a branch with non-existent headquarters_id
- Cannot delete a supplier that has products
- CASCADE deletes propagate to related records

#### ON DELETE Behaviors

Current schema uses CASCADE for all foreign keys:

```sql
FOREIGN KEY (headquarters_id) REFERENCES headquarters(headquarters_id) ON DELETE CASCADE
```

**CASCADE** - When parent is deleted, all children are automatically deleted
- Example: Deleting a supplier deletes all its products

Alternative behaviors (not currently used):
- **RESTRICT** - Prevent parent deletion if children exist
- **SET NULL** - Set foreign key to NULL when parent is deleted
- **SET DEFAULT** - Set foreign key to default value when parent is deleted

#### Check Constraints

Consider adding CHECK constraints for data validation:

```sql
-- Ensure quantity is positive
ALTER TABLE order_details ADD CONSTRAINT check_quantity_positive CHECK (quantity > 0);

-- Ensure discount is between 0 and 1
ALTER TABLE products ADD CONSTRAINT check_discount_range CHECK (discount >= 0 AND discount <= 1);

-- Ensure valid status values
ALTER TABLE orders ADD CONSTRAINT check_status_valid 
    CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled'));
```

### Performance Optimization

#### Current Indexes

All foreign keys have indexes for efficient JOIN operations:

```sql
CREATE INDEX idx_branches_headquarters_id ON branches(headquarters_id);
CREATE INDEX idx_products_supplier_id ON products(supplier_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_orders_branch_id ON orders(branch_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_details_order_id ON order_details(order_id);
CREATE INDEX idx_order_details_product_id ON order_details(product_id);
CREATE INDEX idx_deliveries_supplier_id ON deliveries(supplier_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_order_detail_deliveries_order_detail_id ON order_detail_deliveries(order_detail_id);
CREATE INDEX idx_order_detail_deliveries_delivery_id ON order_detail_deliveries(delivery_id);
```

#### Query Optimization Tips

1. **Use indexes** - Add indexes for frequently filtered columns
2. **Limit results** - Use LIMIT for pagination
3. **Avoid SELECT *** - Select only needed columns for large tables
4. **Use EXPLAIN** - Analyze query plans with `EXPLAIN QUERY PLAN`
5. **Batch inserts** - Use transactions for multiple inserts

Example query plan analysis:

```sql
EXPLAIN QUERY PLAN 
SELECT * FROM products WHERE supplier_id = 5;
-- Should show: SEARCH products USING INDEX idx_products_supplier_id (supplier_id=?)
```

### Common Queries

#### Get order with full details

```sql
SELECT 
    o.order_id,
    o.name AS order_name,
    o.status,
    b.name AS branch_name,
    h.name AS headquarters_name,
    od.quantity,
    od.unit_price,
    p.name AS product_name
FROM orders o
JOIN branches b ON o.branch_id = b.branch_id
JOIN headquarters h ON b.headquarters_id = h.headquarters_id
JOIN order_details od ON o.order_id = od.order_id
JOIN products p ON od.product_id = p.product_id
WHERE o.order_id = ?;
```

#### Get supplier with product count

```sql
SELECT 
    s.supplier_id,
    s.name,
    COUNT(p.product_id) AS product_count
FROM suppliers s
LEFT JOIN products p ON s.supplier_id = p.supplier_id
GROUP BY s.supplier_id;
```

#### Get delivery status summary

```sql
SELECT 
    status,
    COUNT(*) AS count,
    GROUP_CONCAT(delivery_id) AS delivery_ids
FROM deliveries
GROUP BY status;
```

## Next Steps

The current implementation includes:
- ✅ Complete SQLite infrastructure
- ✅ Comprehensive schema with proper relationships
- ✅ Migration and seeding system
- ✅ All repositories implemented
- ✅ Complete REST API routes
- ✅ Unit and integration tests
- ✅ Swagger/OpenAPI documentation

For extending the database:
- [ ] Add CHECK constraints for data validation
- [ ] Consider composite indexes for complex queries
- [ ] Add full-text search indexes if needed
- [ ] Implement database backup strategy for production