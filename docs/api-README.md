# API Documentation Hub

Welcome to the OctoCAT Supply Chain Management API documentation. This guide will help you navigate the comprehensive documentation resources available for understanding, developing, and extending the API.

## 📚 Documentation Structure

### Core Documentation

1. **[API Architecture](./api-architecture.md)** 🏗️
   - Overview of the layered architecture (Routes → Repositories → Database)
   - Repository pattern implementation and benefits
   - Error handling strategy and custom error types
   - Middleware usage and request/response flow
   - Security best practices and SQL injection prevention
   - Performance considerations
   
   👉 **Start here** if you're new to the codebase or want to understand the overall design.

2. **[Repository Patterns](./repository-patterns.md)** 💾
   - Comprehensive guide to the repository pattern
   - Standard CRUD operations and naming conventions
   - Advanced query patterns (pagination, filtering, joins, aggregations)
   - Transaction handling and best practices
   - Performance optimization tips
   - Testing repository methods
   
   👉 **Essential reading** for anyone working with data access or database queries.

3. **[API Development Guide](./api-development.md)** 🛠️
   - Step-by-step guide for adding new entities
   - Creating migrations and seed data
   - Building TypeScript models and repositories
   - Writing route handlers and tests
   - Common development tasks and debugging tips
   
   👉 **Your practical handbook** for adding new features to the API.

4. **[SQLite Integration](./sqlite-integration.md)** 🗄️
   - Complete database schema reference
   - Table definitions and relationships
   - Migration strategy and best practices
   - Seed data management
   - Performance optimization
   - Query examples and common patterns
   
   👉 **Go-to reference** for database schema and SQL queries.

### Quick Reference

- **Interactive API Docs**: `http://localhost:3000/api-docs` (Swagger UI when server is running)
- **OpenAPI Specification**: [`api/api-swagger.json`](../api/api-swagger.json)
- **Overall System Architecture**: [architecture.md](./architecture.md)

## 🚀 Quick Start

### For API Consumers

1. **Start the API server**:
   ```bash
   npm run dev --workspace=api
   ```

2. **Access Swagger UI**: Navigate to `http://localhost:3000/api-docs`

3. **Try the endpoints**: Use the "Try it out" feature in Swagger UI to test API calls

4. **Review examples**: Check the Swagger documentation for request/response examples

### For API Developers

1. **Read the architecture**: Start with [API Architecture](./api-architecture.md)

2. **Understand the patterns**: Review [Repository Patterns](./repository-patterns.md)

3. **Follow the guide**: Use [API Development Guide](./api-development.md) when adding features

4. **Run tests**: Ensure everything works
   ```bash
   npm test --workspace=api
   ```

## 📖 Documentation by Role

### I'm new to the project...

**Recommended reading order**:
1. [System Architecture](./architecture.md) - Understand the big picture
2. [API Architecture](./api-architecture.md) - Dive into API layer
3. [SQLite Integration](./sqlite-integration.md) - Learn the data model
4. Explore Swagger UI - See the API in action

### I want to add a new feature...

**Recommended reading order**:
1. [API Development Guide](./api-development.md) - Step-by-step instructions
2. [Repository Patterns](./repository-patterns.md) - Data access patterns
3. [SQLite Integration](./sqlite-integration.md) - Schema and migrations
4. Existing code examples - Follow established patterns

### I'm integrating with the API...

**Recommended resources**:
1. Swagger UI at `http://localhost:3000/api-docs` - Interactive docs
2. [api-swagger.json](../api/api-swagger.json) - OpenAPI specification
3. [API Architecture](./api-architecture.md) - Error handling and responses
4. Example curl commands in documentation

### I'm troubleshooting an issue...

**Helpful sections**:
1. [API Development Guide](./api-development.md) - Debugging tips
2. [Repository Patterns](./repository-patterns.md) - Common patterns and anti-patterns
3. [SQLite Integration](./sqlite-integration.md) - Query optimization and troubleshooting
4. [API Architecture](./api-architecture.md) - Error handling strategy

## 🎯 Common Tasks

### Adding a New Entity

Follow the comprehensive guide in [API Development Guide](./api-development.md), which covers:

1. Creating database migration
2. Adding seed data (optional)
3. Creating TypeScript model
4. Implementing repository
5. Creating route handlers
6. Updating Swagger documentation
7. Writing tests

**Estimated time**: 1-2 hours for a complete entity with tests

### Modifying Existing Endpoints

1. **Locate the route**: Check `api/src/routes/`
2. **Review repository methods**: Check `api/src/repositories/`
3. **Update schema if needed**: Add migration in `api/sql/migrations/`
4. **Update tests**: Modify tests in `*.test.ts` files
5. **Update Swagger**: Edit `api/api-swagger.json`

### Querying Data

See [Repository Patterns](./repository-patterns.md) for:
- Standard CRUD operations
- Filtering and searching
- Pagination
- Joins and aggregations
- Transactions

### Optimizing Performance

See [SQLite Integration](./sqlite-integration.md) and [Repository Patterns](./repository-patterns.md) for:
- Index strategies
- Query optimization
- Avoiding N+1 problems
- Using EXPLAIN QUERY PLAN

## 🔍 API Endpoints Overview

### Core Entities

| Entity | Endpoints | Purpose |
|--------|-----------|---------|
| **Suppliers** | `/api/suppliers` | Manage supplier information |
| **Products** | `/api/products` | Product catalog management |
| **Headquarters** | `/api/headquarters` | Main company locations |
| **Branches** | `/api/branches` | Regional offices |
| **Orders** | `/api/orders` | Purchase orders |
| **Order Details** | `/api/order-details` | Order line items |
| **Deliveries** | `/api/deliveries` | Delivery tracking |
| **Order Detail Deliveries** | `/api/order-detail-deliveries` | Order-delivery links |

Each entity supports:
- `GET /api/{entity}` - List all
- `GET /api/{entity}/{id}` - Get by ID
- `POST /api/{entity}` - Create new
- `PUT /api/{entity}/{id}` - Update
- `DELETE /api/{entity}/{id}` - Delete

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test --workspace=api

# Run with coverage
npm run test:coverage --workspace=api

# Run specific test file
npx vitest run repositories/suppliersRepo.test.ts
```

### Test Structure

- **Unit tests**: Test repository methods in isolation
- **Integration tests**: Test routes with full HTTP stack
- **Test database**: Uses in-memory SQLite for speed

See [API Development Guide](./api-development.md) for testing strategies and examples.

## 🔐 Security

### Current Security Measures

✅ **Parameterized Queries** - All SQL queries use parameters to prevent SQL injection  
✅ **CORS Configuration** - Cross-origin requests are controlled  
✅ **Error Hiding** - Internal error details hidden in production  
✅ **Foreign Key Constraints** - Data integrity enforced at database level  
✅ **TypeScript Types** - Strong typing provides input validation  

### Security Considerations

See [API Architecture](./api-architecture.md) for:
- SQL injection prevention
- Error handling best practices
- Future security enhancements (authentication, authorization, rate limiting)

## 📊 Data Model

### Entity Relationships

```
Headquarters (1:M) Branches (M:1) Orders (1:M) OrderDetails (M:1) Products (M:1) Suppliers
                                                     ↓ (M:M)
                                              OrderDetailDeliveries (M:1) Deliveries (M:1) Suppliers
```

### Database Schema

See [SQLite Integration](./sqlite-integration.md) for:
- Complete table definitions
- Foreign key relationships
- Indexes and constraints
- Example queries

## 🛠️ Development Tools

### VS Code Extensions (Recommended)

- **SQLite Viewer** - Browse database contents
- **REST Client** - Test API endpoints
- **Swagger Viewer** - Preview OpenAPI specs

### Useful Commands

```bash
# Development server with auto-reload
npm run dev --workspace=api

# Build TypeScript
npm run build --workspace=api

# Initialize database
npm run db:init --workspace=api

# Run migrations only
npm run db:migrate --workspace=api

# Seed database
npm run db:seed --workspace=api
```

### Database Tools

```bash
# Open SQLite CLI
sqlite3 api/data/app.db

# View schema
.schema suppliers

# Run query
SELECT * FROM suppliers;
```

## 🤝 Contributing

When contributing to the API:

1. **Follow existing patterns** - Consistency is key
2. **Write tests** - Both unit and integration tests
3. **Update documentation** - Keep docs in sync with code
4. **Use TypeScript** - Leverage type safety
5. **Follow naming conventions** - See [Repository Patterns](./repository-patterns.md)

### Code Style

- **TypeScript**: Use strict mode, avoid `any`
- **SQL**: Use parameterized queries, never string concatenation
- **Routes**: Thin controllers, delegate to repositories
- **Repositories**: Single responsibility, clear method names
- **Tests**: Descriptive names, test both success and error cases

## 📝 Documentation Guidelines

When updating documentation:

1. **Keep it current** - Update docs when code changes
2. **Be practical** - Include examples and code snippets
3. **Cross-reference** - Link related documentation
4. **Be concise** - Clear and to the point
5. **Use diagrams** - Visual aids help understanding

See `.github/copilot-instructions.md` and `.github/instructions/api.instructions.md` for repository-specific guidelines.

## 🔄 Migration Path

### From Other Frameworks

If you're familiar with other frameworks:

| From | See |
|------|-----|
| **Express/NestJS** | [API Architecture](./api-architecture.md) - Similar patterns |
| **Prisma/TypeORM** | [Repository Patterns](./repository-patterns.md) - Manual queries |
| **MongoDB** | [SQLite Integration](./sqlite-integration.md) - SQL vs NoSQL |

### Upgrading

When upgrading the API:

1. **Create migration** - Never modify existing migrations
2. **Update models** - Add/modify TypeScript interfaces
3. **Update repositories** - Add/modify methods
4. **Update routes** - Add/modify endpoints
5. **Update Swagger** - Keep API docs current
6. **Write tests** - Ensure backward compatibility
7. **Update guides** - Document new patterns

## 📞 Getting Help

### Resources

- **Documentation**: Start with this hub and linked guides
- **Code Examples**: Review existing repositories and routes
- **Swagger UI**: Interactive API documentation
- **Tests**: See how features are tested

### Common Questions

**Q: How do I add a new field to an entity?**  
A: Create a migration to add the column, update the TypeScript model, and update affected repository methods. See [API Development Guide](./api-development.md).

**Q: How do I implement complex queries with joins?**  
A: See the "Advanced Query Patterns" section in [Repository Patterns](./repository-patterns.md).

**Q: How do I handle errors properly?**  
A: Use custom error types (NotFoundError, ValidationError, etc.) and let middleware handle HTTP responses. See [API Architecture](./api-architecture.md).

**Q: How do I test my changes?**  
A: Write unit tests for repositories and integration tests for routes. See examples in `*.test.ts` files and [API Development Guide](./api-development.md).

## 🎓 Learning Path

### Beginner

1. Read [System Architecture](./architecture.md)
2. Explore Swagger UI
3. Review simple endpoints (e.g., GET `/api/suppliers`)
4. Read [API Architecture](./api-architecture.md)

### Intermediate

1. Study [Repository Patterns](./repository-patterns.md)
2. Review repository implementations
3. Understand [SQLite Integration](./sqlite-integration.md)
4. Try modifying an existing endpoint

### Advanced

1. Master [API Development Guide](./api-development.md)
2. Add a new entity end-to-end
3. Optimize query performance
4. Contribute improvements to documentation

## 📚 External Resources

### SQLite

- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [SQLite Query Planner](https://www.sqlite.org/queryplanner.html)
- [SQLite Best Practices](https://www.sqlite.org/howtocorrupt.html)

### Express.js

- [Express Documentation](https://expressjs.com/)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

### TypeScript

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

### OpenAPI/Swagger

- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger Documentation](https://swagger.io/docs/)

---

**Last Updated**: 2025-10-29  
**API Version**: 1.0.0  
**Documentation Maintained By**: Development Team
