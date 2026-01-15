# API Quick Reference Guide

A concise reference for the OctoCAT Supply Chain Management API.

## Quick Start

```bash
# Install dependencies
npm install

# Initialize database
npm run db:init --workspace=api

# Start dev server
npm run dev --workspace=api

# Run tests
npm run test --workspace=api
```

## All Endpoints

### Suppliers
- `GET /api/suppliers` - List all suppliers
- `GET /api/suppliers/:id` - Get supplier by ID
- `POST /api/suppliers` - Create supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier

### Headquarters
- `GET /api/headquarters` - List all headquarters
- `GET /api/headquarters/:id` - Get headquarters by ID
- `POST /api/headquarters` - Create headquarters
- `PUT /api/headquarters/:id` - Update headquarters
- `DELETE /api/headquarters/:id` - Delete headquarters

### Branches
- `GET /api/branches` - List all branches
- `GET /api/branches/:id` - Get branch by ID
- `POST /api/branches` - Create branch
- `PUT /api/branches/:id` - Update branch
- `DELETE /api/branches/:id` - Delete branch

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/name/:name` - Get product by name
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `GET /api/orders` - List all orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

### Order Details
- `GET /api/order-details` - List all order details
- `GET /api/order-details/:id` - Get order detail by ID
- `POST /api/order-details` - Create order detail
- `PUT /api/order-details/:id` - Update order detail
- `DELETE /api/order-details/:id` - Delete order detail

### Deliveries
- `GET /api/deliveries` - List all deliveries
- `GET /api/deliveries/:id` - Get delivery by ID
- `POST /api/deliveries` - Create delivery
- `PUT /api/deliveries/:id` - Update delivery
- `DELETE /api/deliveries/:id` - Delete delivery

### Order Detail Deliveries
- `GET /api/order-detail-deliveries` - List all
- `GET /api/order-detail-deliveries/:id` - Get by ID
- `POST /api/order-detail-deliveries` - Create
- `PUT /api/order-detail-deliveries/:id` - Update
- `DELETE /api/order-detail-deliveries/:id` - Delete

## HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET/PUT request |
| 201 | Created | Successful POST request |
| 204 | No Content | Successful DELETE request |
| 400 | Bad Request | Invalid input data (ValidationError) |
| 404 | Not Found | Resource doesn't exist (NotFoundError) |
| 409 | Conflict | Constraint violation (ConflictError) |
| 500 | Internal Server Error | Unexpected database error |
| 503 | Service Unavailable | Database temporarily locked |

## Common Request Examples

### Create a Supplier
```bash
curl -X POST http://localhost:3000/api/suppliers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TechCorp",
    "contactPerson": "John Doe",
    "email": "john@techcorp.com",
    "phone": "555-1234"
  }'
```

### Update a Product
```bash
curl -X PUT http://localhost:3000/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "price": 149.99,
    "discount": 0.15
  }'
```

### Create an Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "branchId": 1,
    "orderDate": "2024-01-15",
    "name": "Office Supplies Q1",
    "status": "pending"
  }'
```

### Delete a Branch
```bash
curl -X DELETE http://localhost:3000/api/branches/5
```

## Error Response Format

All errors follow this structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Example Errors

**Not Found (404)**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Supplier with ID 999 not found"
  }
}
```

**Validation Error (400)**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation error: Invalid reference to related entity"
  }
}
```

**Conflict (409)**
```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Conflict: Resource already exists"
  }
}
```

## Database Commands

```bash
# Initialize database (migrations + seed)
npm run db:init --workspace=api

# Run only migrations
npm run db:migrate --workspace=api

# Run only seed data
npm run db:seed --workspace=api
```

## Environment Variables

```bash
# Server
PORT=3000

# Database
DB_FILE=./data/app.db
DB_ENABLE_WAL=true
DB_FOREIGN_KEYS=true
DB_TIMEOUT=30000

# CORS
API_CORS_ORIGINS=http://localhost:5137,http://localhost:3001
```

## Testing Commands

```bash
# Run all tests
npm run test --workspace=api

# Run tests in watch mode
npm run test --workspace=api -- --watch

# Run tests with coverage
npm run test:coverage --workspace=api
```

## Repository Pattern Quick Reference

### Common Repository Methods

All repositories implement these standard methods:

```typescript
// Get all entities
findAll(): Promise<Entity[]>

// Get entity by ID
findById(id: number): Promise<Entity | null>

// Create new entity
create(data: Omit<Entity, 'entityId'>): Promise<Entity>

// Update entity
update(id: number, data: Partial<Entity>): Promise<Entity>

// Delete entity
delete(id: number): Promise<void>

// Check if exists
exists(id: number): Promise<boolean>
```

### Using Repositories

```typescript
import { getSuppliersRepository } from './repositories/suppliersRepo';

// Get repository instance
const repo = await getSuppliersRepository();

// Use repository methods
const suppliers = await repo.findAll();
const supplier = await repo.findById(1);
const newSupplier = await repo.create({ name: 'New Co' });
const updated = await repo.update(1, { name: 'Updated' });
await repo.delete(1);
```

## Architecture Layers

```
Routes (HTTP) ──> Repositories (Data Access) ──> SQLite Database
    │                    │                            │
    ├─ Validation        ├─ SQL Queries               ├─ Tables
    ├─ Error Handling    ├─ Type Mapping              ├─ Indexes
    └─ Response Format   └─ Business Logic            └─ Constraints
```

## Database Schema

```
suppliers ──┐
            ├──> products
            └──> deliveries ──┐
                              │
headquarters ──> branches ──> orders ──> order_details ──┐
                                            │             │
                                            └─────────────┴──> order_detail_deliveries
```

## Swagger/OpenAPI Docs

- **Swagger UI**: http://localhost:3000/api-docs
- **OpenAPI JSON**: http://localhost:3000/api-docs.json

## File Structure

```
api/
├── src/
│   ├── db/              Database connection
│   ├── models/          TypeScript interfaces
│   ├── repositories/    Data access layer
│   ├── routes/          HTTP endpoints
│   ├── utils/           Helpers (errors, SQL)
│   ├── index.ts         App entry point
│   └── init-db.ts       DB initialization
├── sql/
│   ├── migrations/      Schema versions
│   └── seed/           Sample data
├── data/               SQLite database (generated)
├── package.json        Dependencies
└── README.md           Full documentation
```

## Best Practices

1. **Always wrap async routes in try-catch**
   ```typescript
   router.get('/', async (req, res, next) => {
     try {
       // ... your code
     } catch (error) {
       next(error);  // Let middleware handle it
     }
   });
   ```

2. **Use typed parameters**
   ```typescript
   const id = parseInt(req.params.id);
   ```

3. **Return proper status codes**
   - 201 for POST (created)
   - 204 for DELETE (no content)
   - 404 when resource not found

4. **Use repository methods, not raw SQL**
   ```typescript
   // Good
   const repo = await getSuppliersRepository();
   const suppliers = await repo.findAll();
   
   // Bad
   const suppliers = await db.all('SELECT * FROM suppliers');
   ```

5. **Let errors propagate to middleware**
   ```typescript
   // Good
   next(error);
   
   // Bad
   res.status(500).json({ error: error.message });
   ```

## Need More Details?

See the full [API Documentation](./README.md) for:
- Detailed architecture explanations
- Step-by-step guides for adding endpoints
- Complete testing patterns
- Advanced repository techniques
- Database migration strategies
- And much more!

## Links

- [Full API Documentation](./README.md)
- [Main Project README](../README.md)
- [Architecture Guide](../docs/architecture.md)
- [SQLite Integration](../docs/sqlite-integration.md)
