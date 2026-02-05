# OctoCAT Supply Chain Management API

A TypeScript-based REST API built with Express.js and SQLite, following the repository pattern for clean data access and maintainability.

## 🏗️ Architecture Overview

This API is part of the OctoCAT Supply Chain Management system, providing RESTful endpoints for managing:
- **Suppliers** - Vendor information and contact details
- **Headquarters** - Company headquarters data
- **Branches** - Branch locations linked to headquarters
- **Products** - Product catalog with pricing and supplier relationships
- **Orders** - Customer orders placed at branches
- **Order Details** - Individual line items in orders
- **Deliveries** - Delivery tracking from suppliers
- **Order Detail Deliveries** - Junction table linking order details to deliveries

### Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 4.x
- **Database**: SQLite 3.x with WAL mode
- **API Documentation**: Swagger/OpenAPI 3.0
- **Testing**: Vitest with in-memory database
- **Architecture Pattern**: Repository pattern with dependency injection

### Directory Structure

```
api/
├── src/
│   ├── db/              # Database configuration and utilities
│   │   ├── config.ts    # Database configuration
│   │   ├── sqlite.ts    # SQLite connection management
│   │   ├── migrate.ts   # Migration runner
│   │   └── seed.ts      # Database seeding
│   ├── models/          # TypeScript interfaces for entities
│   │   ├── branch.ts
│   │   ├── delivery.ts
│   │   ├── headquarters.ts
│   │   ├── order.ts
│   │   ├── orderDetail.ts
│   │   ├── orderDetailDelivery.ts
│   │   ├── product.ts
│   │   └── supplier.ts
│   ├── repositories/    # Data access layer
│   │   ├── branchesRepo.ts
│   │   ├── deliveriesRepo.ts
│   │   ├── headquartersRepo.ts
│   │   ├── orderDetailsRepo.ts
│   │   ├── orderDetailDeliveriesRepo.ts
│   │   ├── ordersRepo.ts
│   │   ├── productsRepo.ts
│   │   └── suppliersRepo.ts
│   ├── routes/          # Express route handlers
│   │   ├── branch.ts
│   │   ├── delivery.ts
│   │   ├── headquarters.ts
│   │   ├── order.ts
│   │   ├── orderDetail.ts
│   │   ├── orderDetailDelivery.ts
│   │   ├── product.ts
│   │   └── supplier.ts
│   ├── utils/           # Utility functions
│   │   ├── errors.ts    # Custom error classes
│   │   └── sql.ts       # SQL query helpers
│   ├── index.ts         # Application entry point
│   └── init-db.ts       # Database initialization script
├── sql/
│   ├── migrations/      # SQL migration files
│   │   └── 001_init.sql
│   └── seed/            # SQL seed data files
│       ├── 001_suppliers.sql
│       ├── 002_headquarters.sql
│       ├── 003_branches.sql
│       ├── 004_products.sql
│       ├── 005_orders.sql
│       ├── 006_order_details.sql
│       ├── 007_deliveries.sql
│       └── 008_order_detail_deliveries.sql
├── docs/                # Additional documentation
├── api-swagger.json     # OpenAPI specification
├── ERD.png              # Entity Relationship Diagram
└── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Basic understanding of TypeScript and Express.js

### Installation

From the repository root:

```bash
# Install all dependencies
npm install

# Install API dependencies only
npm install --workspace=api
```

### Database Initialization

The database will be automatically initialized when you start the server. To manually initialize:

```bash
# Initialize database with migrations and seed data
npm run db:init --workspace=api

# Run migrations only
npm run db:migrate --workspace=api

# Seed data only
npm run db:seed --workspace=api
```

### Running the API

```bash
# Development mode with hot reload
npm run dev --workspace=api

# Build TypeScript
npm run build --workspace=api

# Production mode
npm run start --workspace=api
```

The API will start on `http://localhost:3000`.

### API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:3000/api-docs
- **OpenAPI JSON**: http://localhost:3000/api-docs.json

## ⚙️ Configuration

### Environment Variables

Configure the API using environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | API server port |
| `NODE_ENV` | `development` | Environment (development/production) |
| `DB_FILE` | `./data/app.db` | SQLite database file path (absolute or relative to api/) |
| `DB_ENGINE` | `sqlite` | Database engine (currently only sqlite supported) |
| `DB_ENABLE_WAL` | `true` | Enable Write-Ahead Logging for better concurrency |
| `DB_TIMEOUT` | `30000` | Database connection timeout (milliseconds) |
| `DB_FOREIGN_KEYS` | `true` | Enable foreign key constraints |

### Example Configuration

```bash
# .env file or export commands
export PORT=3001
export DB_FILE=/absolute/path/to/database.db
export DB_ENABLE_WAL=true
export DB_FOREIGN_KEYS=true
```

## 📚 Additional Documentation

Detailed documentation is available in the `docs/` directory:

- **[Database Documentation](./docs/database.md)** - Schema, migrations, and seed data
- **[Models Documentation](./docs/models.md)** - All entity models and their relationships
- **[Endpoints Documentation](./docs/endpoints.md)** - Complete API endpoint reference
- **[Repository Pattern](./docs/repository-pattern.md)** - Data access layer architecture
- **[Development Guide](./docs/development.md)** - Setup, testing, and deployment

Also see the repository-level documentation:
- [Architecture Overview](../docs/architecture.md)
- [SQLite Integration Guide](../docs/sqlite-integration.md)

## 🧪 Testing

```bash
# Run all tests
npm run test --workspace=api

# Run tests with coverage
npm run test:coverage --workspace=api

# Run tests in watch mode
npm run test --workspace=api -- --watch
```

Tests use an in-memory SQLite database for fast, isolated execution.

## 🔍 API Design Principles

### Repository Pattern

The API follows the repository pattern to separate business logic from data access:
- **Models** define TypeScript interfaces for entities
- **Repositories** handle all database operations (CRUD + custom queries)
- **Routes** orchestrate requests, call repositories, and return responses

### Error Handling

The API uses custom error classes that automatically map to HTTP status codes:
- `NotFoundError` → 404
- `ValidationError` → 400
- `ConflictError` → 409
- `DatabaseError` → 500

All errors are handled by Express middleware and return consistent JSON responses.

### Data Mapping

- Database columns use `snake_case` (e.g., `product_id`)
- TypeScript models use `camelCase` (e.g., `productId`)
- Automatic mapping is handled by the `objectToCamelCase` utility

### SQL Injection Protection

All database queries use parameterized statements to prevent SQL injection attacks.

## 🏗️ Project Scripts

From the repository root:

```bash
# Build API
npm run build --workspace=api

# Start API (production)
npm run start --workspace=api

# Development mode
npm run dev --workspace=api

# Run tests
npm run test --workspace=api

# Database management
npm run db:init --workspace=api    # Initialize with migrations + seed
npm run db:migrate --workspace=api # Run migrations only
npm run db:seed --workspace=api    # Seed data only
```

## 📈 Performance Considerations

- **Indexes** on foreign keys and frequently queried columns
- **WAL mode** enabled by default for better concurrency
- **Connection pooling** via singleton repository pattern
- **Parameterized queries** for query plan caching

## 🔒 Security

- Parameterized SQL queries prevent SQL injection
- CORS enabled (configure for production)
- Foreign key constraints enforce referential integrity
- Error messages don't expose sensitive information in production

## 📝 Contributing

When making changes to the API:

1. Follow existing code patterns and naming conventions
2. Update Swagger documentation in model/route files
3. Add tests for new repository methods
4. Run migrations for schema changes (never modify existing migrations)
5. Update this README if adding new features or changing configuration

## 🐛 Troubleshooting

### Database Locked Error
**Cause**: Long-running transactions or unclosed connections  
**Solution**: Ensure all database operations are properly awaited

### Foreign Key Constraint Error
**Cause**: Trying to reference non-existent records  
**Solution**: Verify referenced entities exist before creating relationships

### Migration Errors
**Cause**: SQL syntax errors or conflicting schema changes  
**Solution**: Check migration file syntax and test against current schema

For more troubleshooting tips, see the [Development Guide](./docs/development.md).

## 📄 License

MIT License - See the repository root for details.
