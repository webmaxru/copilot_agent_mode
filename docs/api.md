# OctoCAT Supply Chain Management API Documentation

This document provides comprehensive documentation for the OctoCAT Supply Chain Management REST API.

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [API Reference](#api-reference)
  - [Suppliers](#suppliers)
  - [Headquarters](#headquarters)
  - [Branches](#branches)
  - [Products](#products)
  - [Orders](#orders)
  - [Order Details](#order-details)
  - [Deliveries](#deliveries)
  - [Order Detail Deliveries](#order-detail-deliveries)
- [Error Handling](#error-handling)
- [Developer Guide](#developer-guide)
- [Architecture](#architecture)

---

## Overview

The OctoCAT Supply Chain Management API is a RESTful API built with Express.js and TypeScript. It provides endpoints for managing a complete supply chain system including suppliers, headquarters, branches, products, orders, and deliveries.

### Key Features

- **RESTful Design**: Standard HTTP methods (GET, POST, PUT, DELETE)
- **JSON Format**: All requests and responses use JSON
- **SQLite Database**: Persistent data storage with proper relationships
- **OpenAPI/Swagger**: Interactive API documentation at `/api-docs`
- **Error Handling**: Consistent error responses with appropriate HTTP status codes

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm (latest version recommended)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/copilot_agent_mode.git
   cd copilot_agent_mode
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Initialize the database:
   ```bash
   npm run db:init --workspace=api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`.

### Interactive Documentation

Once the server is running, you can access the Swagger UI documentation at:
- **Swagger UI**: `http://localhost:3000/api-docs`
- **OpenAPI JSON**: `http://localhost:3000/api-docs.json`

---

## Authentication

> **Note**: The current version of the API does not require authentication. All endpoints are publicly accessible. For production deployments, consider implementing JWT or OAuth2 authentication.

---

## Base URL

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:3000` |
| Development (HTTPS) | `https://localhost:3000` |

All API endpoints are prefixed with `/api`.

---

## API Reference

### Common Response Formats

#### Success Response
```json
{
  "supplierId": 1,
  "name": "Tech Supplies Inc.",
  "description": "Leading technology supplier",
  "contactPerson": "John Smith",
  "email": "john@techsupplies.com",
  "phone": "555-0100"
}
```

#### Error Response
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Supplier with ID 999 not found"
  }
}
```

---

### Suppliers

Manage supplier information for the supply chain.

#### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `supplierId` | integer | Yes (auto) | Unique identifier for the supplier |
| `name` | string | Yes | Name of the supplier |
| `description` | string | No | Additional details about the supplier |
| `contactPerson` | string | No | Name of the primary contact person |
| `email` | string | No | Contact email (email format) |
| `phone` | string | No | Contact phone number |

#### Endpoints

##### List All Suppliers

```http
GET /api/suppliers
```

**Response**: `200 OK`

```json
[
  {
    "supplierId": 1,
    "name": "Tech Supplies Inc.",
    "description": "Leading technology supplier",
    "contactPerson": "John Smith",
    "email": "john@techsupplies.com",
    "phone": "555-0100"
  },
  {
    "supplierId": 2,
    "name": "Office Essentials Co.",
    "description": "Office supplies and furniture",
    "contactPerson": "Jane Doe",
    "email": "jane@officeessentials.com",
    "phone": "555-0200"
  }
]
```

##### Get Supplier by ID

```http
GET /api/suppliers/{id}
```

**Parameters**:
| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | integer | Yes | Supplier ID |

**Response**: `200 OK`

```json
{
  "supplierId": 1,
  "name": "Tech Supplies Inc.",
  "description": "Leading technology supplier",
  "contactPerson": "John Smith",
  "email": "john@techsupplies.com",
  "phone": "555-0100"
}
```

**Error Response**: `404 Not Found`

```
Supplier not found
```

##### Create Supplier

```http
POST /api/suppliers
```

**Request Body**:

```json
{
  "name": "New Supplier Inc.",
  "description": "A new supplier",
  "contactPerson": "Bob Wilson",
  "email": "bob@newsupplier.com",
  "phone": "555-0300"
}
```

**Response**: `201 Created`

```json
{
  "supplierId": 3,
  "name": "New Supplier Inc.",
  "description": "A new supplier",
  "contactPerson": "Bob Wilson",
  "email": "bob@newsupplier.com",
  "phone": "555-0300"
}
```

##### Update Supplier

```http
PUT /api/suppliers/{id}
```

**Parameters**:
| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | integer | Yes | Supplier ID |

**Request Body**:

```json
{
  "name": "Updated Supplier Name",
  "description": "Updated description"
}
```

**Response**: `200 OK`

```json
{
  "supplierId": 1,
  "name": "Updated Supplier Name",
  "description": "Updated description",
  "contactPerson": "John Smith",
  "email": "john@techsupplies.com",
  "phone": "555-0100"
}
```

**Error Response**: `404 Not Found`

```
Supplier not found
```

##### Delete Supplier

```http
DELETE /api/suppliers/{id}
```

**Parameters**:
| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | integer | Yes | Supplier ID |

**Response**: `204 No Content`

**Error Response**: `404 Not Found`

```
Supplier not found
```

---

### Headquarters

Manage company headquarters locations.

#### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `headquartersId` | integer | Yes (auto) | Unique identifier for the headquarters |
| `name` | string | Yes | Name of the headquarters |
| `address` | string | No | Main office address |
| `phone` | string | No | Contact phone number |
| `email` | string | No | Contact email (email format) |
| `description` | string | No | Additional details |

#### Endpoints

##### List All Headquarters

```http
GET /api/headquarters
```

**Response**: `200 OK`

```json
[
  {
    "headquartersId": 1,
    "name": "North America HQ",
    "address": "123 Main Street, New York, NY 10001",
    "phone": "555-1000",
    "email": "nahq@octocat.com",
    "description": "North American operations center"
  }
]
```

##### Get Headquarters by ID

```http
GET /api/headquarters/{id}
```

**Parameters**:
| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | integer | Yes | Headquarters ID |

**Response**: `200 OK`

```json
{
  "headquartersId": 1,
  "name": "North America HQ",
  "address": "123 Main Street, New York, NY 10001",
  "phone": "555-1000",
  "email": "nahq@octocat.com",
  "description": "North American operations center"
}
```

**Error Response**: `404 Not Found`

##### Create Headquarters

```http
POST /api/headquarters
```

**Request Body**:

```json
{
  "name": "Europe HQ",
  "address": "456 High Street, London, UK",
  "phone": "44-20-1234-5678",
  "email": "euhq@octocat.com",
  "description": "European operations center"
}
```

**Response**: `201 Created`

##### Update Headquarters

```http
PUT /api/headquarters/{id}
```

**Parameters**:
| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | integer | Yes | Headquarters ID |

**Response**: `200 OK`

**Error Response**: `404 Not Found`

##### Delete Headquarters

```http
DELETE /api/headquarters/{id}
```

**Parameters**:
| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | integer | Yes | Headquarters ID |

**Response**: `204 No Content`

**Error Response**: `404 Not Found`

---

### Branches

Manage branch locations linked to headquarters.

#### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `branchId` | integer | Yes (auto) | Unique identifier for the branch |
| `headquartersId` | integer | Yes | ID of the parent headquarters |
| `name` | string | Yes | Name of the branch |
| `address` | string | No | Physical address |
| `phone` | string | No | Contact phone number |
| `email` | string | No | Contact email (email format) |

#### Endpoints

##### List All Branches

```http
GET /api/branches
```

**Response**: `200 OK`

```json
[
  {
    "branchId": 1,
    "headquartersId": 1,
    "name": "Downtown Branch",
    "address": "789 Commerce Ave, New York, NY 10002",
    "phone": "555-1001",
    "email": "downtown@octocat.com"
  }
]
```

##### Get Branch by ID

```http
GET /api/branches/{id}
```

**Parameters**:
| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | integer | Yes | Branch ID |

**Response**: `200 OK`

**Error Response**: `404 Not Found`

##### Create Branch

```http
POST /api/branches
```

**Request Body**:

```json
{
  "headquartersId": 1,
  "name": "Uptown Branch",
  "address": "456 Park Ave, New York, NY 10003",
  "phone": "555-1002",
  "email": "uptown@octocat.com"
}
```

**Response**: `201 Created`

##### Update Branch

```http
PUT /api/branches/{id}
```

**Parameters**:
| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | integer | Yes | Branch ID |

**Response**: `200 OK`

**Error Response**: `404 Not Found`

##### Delete Branch

```http
DELETE /api/branches/{id}
```

**Parameters**:
| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | integer | Yes | Branch ID |

**Response**: `204 No Content`

**Error Response**: `404 Not Found`

---

### Products

Manage the product catalog.

#### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `productId` | integer | Yes (auto) | Unique identifier for the product |
| `name` | string | Yes | Product name |
| `description` | string | No | Detailed product description |
| `price` | number | Yes | Current price (float) |
| `supplierId` | integer | No | ID of the supplier providing this product |
| `stockLevel` | integer | No | Current stock level |

#### Endpoints

##### List All Products

```http
GET /api/products
```

**Response**: `200 OK`

```json
[
  {
    "productId": 1,
    "name": "Laptop Pro 15",
    "description": "High-performance laptop for professionals",
    "price": 1299.99,
    "supplierId": 1,
    "stockLevel": 50
  },
  {
    "productId": 2,
    "name": "Wireless Mouse",
    "description": "Ergonomic wireless mouse",
    "price": 49.99,
    "supplierId": 1,
    "stockLevel": 200
  }
]
```

##### Get Product by ID

```http
GET /api/products/{id}
```

**Parameters**:
| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | integer | Yes | Product ID |

**Response**: `200 OK`

```json
{
  "productId": 1,
  "name": "Laptop Pro 15",
  "description": "High-performance laptop for professionals",
  "price": 1299.99,
  "supplierId": 1,
  "stockLevel": 50
}
```

**Error Response**: `404 Not Found`

##### Create Product

```http
POST /api/products
```

**Request Body**:

```json
{
  "name": "USB-C Hub",
  "description": "7-in-1 USB-C hub with HDMI",
  "price": 79.99,
  "supplierId": 1,
  "stockLevel": 100
}
```

**Response**: `201 Created`

##### Update Product

```http
PUT /api/products/{id}
```

**Parameters**:
| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | integer | Yes | Product ID |

**Request Body**:

```json
{
  "price": 69.99,
  "stockLevel": 150
}
```

**Response**: `200 OK`

**Error Response**: `404 Not Found`

##### Delete Product

```http
DELETE /api/products/{id}
```

**Parameters**:
| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | integer | Yes | Product ID |

**Response**: `204 No Content`

**Error Response**: `404 Not Found`

---

### Orders

Manage customer orders placed at branches.

#### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `orderId` | integer | Yes (auto) | Unique identifier for the order |
| `branchId` | integer | Yes | ID of the branch that placed the order |
| `orderDate` | string | Yes | Order date and time (ISO 8601 format) |
| `status` | string | No | Order status: `pending`, `processing`, `shipped`, `delivered`, `cancelled` |
| `totalAmount` | number | No | Total order amount (float) |

#### Endpoints

##### List All Orders

```http
GET /api/orders
```

**Response**: `200 OK`

```json
[
  {
    "orderId": 1,
    "branchId": 1,
    "orderDate": "2024-01-15T10:30:00Z",
    "status": "processing",
    "totalAmount": 1549.97
  }
]
```

##### Get Order by ID

```http
GET /api/orders/{id}
```

**Parameters**:
| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | integer | Yes | Order ID |

**Response**: `200 OK`

**Error Response**: `404 Not Found`

##### Create Order

```http
POST /api/orders
```

**Request Body**:

```json
{
  "branchId": 1,
  "orderDate": "2024-01-20T14:00:00Z",
  "status": "pending",
  "totalAmount": 299.99
}
```

**Response**: `201 Created`

##### Update Order

```http
PUT /api/orders/{id}
```

**Parameters**:
| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | integer | Yes | Order ID |

**Request Body**:

```json
{
  "status": "shipped"
}
```

**Response**: `200 OK`

**Error Response**: `404 Not Found`

##### Delete Order

```http
DELETE /api/orders/{id}
```

**Parameters**:
| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | integer | Yes | Order ID |

**Response**: `204 No Content`

**Error Response**: `404 Not Found`

---

### Order Details

Manage order line items linking orders to products.

#### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `orderDetailId` | integer | Yes (auto) | Unique identifier for the order detail |
| `orderId` | integer | Yes | ID of the parent order |
| `productId` | integer | Yes | ID of the product ordered |
| `quantity` | integer | Yes | Quantity of products ordered |
| `unitPrice` | number | Yes | Price per unit (float) |
| `notes` | string | No | Additional notes for the order detail |

#### Endpoints

##### List All Order Details

```http
GET /api/order-details
```

**Response**: `200 OK`

```json
[
  {
    "orderDetailId": 1,
    "orderId": 1,
    "productId": 1,
    "quantity": 1,
    "unitPrice": 1299.99,
    "notes": "Priority shipping requested"
  },
  {
    "orderDetailId": 2,
    "orderId": 1,
    "productId": 2,
    "quantity": 5,
    "unitPrice": 49.99,
    "notes": null
  }
]
```

##### Get Order Detail by ID

```http
GET /api/order-details/{id}
```

**Parameters**:
| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | integer | Yes | Order detail ID |

**Response**: `200 OK`

**Error Response**: `404 Not Found`

##### Create Order Detail

```http
POST /api/order-details
```

**Request Body**:

```json
{
  "orderId": 1,
  "productId": 3,
  "quantity": 2,
  "unitPrice": 79.99,
  "notes": "Gift wrap requested"
}
```

**Response**: `201 Created`

##### Update Order Detail

```http
PUT /api/order-details/{id}
```

**Parameters**:
| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | integer | Yes | Order detail ID |

**Response**: `200 OK`

**Error Response**: `404 Not Found`

##### Delete Order Detail

```http
DELETE /api/order-details/{id}
```

**Parameters**:
| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | integer | Yes | Order detail ID |

**Response**: `204 No Content`

**Error Response**: `404 Not Found`

---

### Deliveries

Track deliveries from suppliers.

#### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `deliveryId` | integer | Yes (auto) | Unique identifier for the delivery |
| `orderId` | integer | Yes | ID of the order being delivered |
| `status` | string | Yes | Delivery status: `pending`, `in-transit`, `delivered`, `failed` |
| `scheduledDate` | string | No | Scheduled delivery date (ISO 8601 format) |
| `actualDeliveryDate` | string | No | Actual delivery date (ISO 8601 format) |
| `notes` | string | No | Additional delivery notes |

#### Endpoints

##### List All Deliveries

```http
GET /api/deliveries
```

**Response**: `200 OK`

```json
[
  {
    "deliveryId": 1,
    "orderId": 1,
    "status": "in-transit",
    "scheduledDate": "2024-01-18T09:00:00Z",
    "actualDeliveryDate": null,
    "notes": "Leave at reception"
  }
]
```

##### Get Delivery by ID

```http
GET /api/deliveries/{id}
```

**Parameters**:
| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | integer | Yes | Delivery ID |

**Response**: `200 OK`

**Error Response**: `404 Not Found`

##### Create Delivery

```http
POST /api/deliveries
```

**Request Body**:

```json
{
  "orderId": 1,
  "status": "pending",
  "scheduledDate": "2024-01-25T10:00:00Z",
  "notes": "Fragile items - handle with care"
}
```

**Response**: `201 Created`

##### Update Delivery

```http
PUT /api/deliveries/{id}
```

**Parameters**:
| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | integer | Yes | Delivery ID |

**Request Body**:

```json
{
  "status": "delivered",
  "actualDeliveryDate": "2024-01-18T11:30:00Z"
}
```

**Response**: `200 OK`

**Error Response**: `404 Not Found`

##### Delete Delivery

```http
DELETE /api/deliveries/{id}
```

**Parameters**:
| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | integer | Yes | Delivery ID |

**Response**: `204 No Content`

**Error Response**: `404 Not Found`

---

### Order Detail Deliveries

Junction table linking order details to deliveries (for partial/split deliveries).

#### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `orderDetailDeliveryId` | integer | Yes (auto) | Unique identifier |
| `orderDetailId` | integer | Yes | ID of the related order detail |
| `deliveryId` | integer | Yes | ID of the related delivery |
| `quantity` | integer | No | Quantity of items in this delivery |
| `notes` | string | No | Additional notes about this delivery |

#### Endpoints

##### List All Order Detail Deliveries

```http
GET /api/order-detail-deliveries
```

**Response**: `200 OK`

```json
[
  {
    "orderDetailDeliveryId": 1,
    "orderDetailId": 1,
    "deliveryId": 1,
    "quantity": 1,
    "notes": "First shipment"
  }
]
```

##### Get Order Detail Delivery by ID

```http
GET /api/order-detail-deliveries/{id}
```

**Parameters**:
| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | integer | Yes | Order detail delivery ID |

**Response**: `200 OK`

**Error Response**: `404 Not Found`

##### Create Order Detail Delivery

```http
POST /api/order-detail-deliveries
```

**Request Body**:

```json
{
  "orderDetailId": 2,
  "deliveryId": 1,
  "quantity": 3,
  "notes": "Partial shipment"
}
```

**Response**: `201 Created`

##### Update Order Detail Delivery

```http
PUT /api/order-detail-deliveries/{id}
```

**Parameters**:
| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | integer | Yes | Order detail delivery ID |

**Response**: `200 OK`

**Error Response**: `404 Not Found`

##### Delete Order Detail Delivery

```http
DELETE /api/order-detail-deliveries/{id}
```

**Parameters**:
| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | integer | Yes | Order detail delivery ID |

**Response**: `204 No Content`

**Error Response**: `404 Not Found`

---

## Error Handling

The API uses standard HTTP status codes and returns consistent error responses.

### HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| `200 OK` | Request succeeded |
| `201 Created` | Resource created successfully |
| `204 No Content` | Resource deleted successfully |
| `400 Bad Request` | Invalid request data |
| `404 Not Found` | Resource not found |
| `409 Conflict` | Resource conflict (e.g., duplicate entry) |
| `500 Internal Server Error` | Server error |
| `503 Service Unavailable` | Database temporarily unavailable |

### Error Response Format

All errors return a JSON object with the following structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Error Codes

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `NOT_FOUND` | 404 | The requested resource was not found |
| `VALIDATION_ERROR` | 400 | Invalid data provided |
| `CONFLICT` | 409 | Resource already exists or constraint violation |
| `DATABASE_ERROR` | 500 | General database error |
| `DATABASE_BUSY` | 503 | Database is temporarily unavailable |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### Error Examples

**Not Found Error**:
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Supplier with ID 999 not found"
  }
}
```

**Validation Error**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation error: Invalid reference to related entity"
  }
}
```

**Conflict Error**:
```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Conflict: Resource already exists"
  }
}
```

---

## Developer Guide

### Local Development Setup

1. **Clone and Install**:
   ```bash
   git clone https://github.com/your-org/copilot_agent_mode.git
   cd copilot_agent_mode
   npm install
   ```

2. **Database Setup**:
   ```bash
   # Initialize database with migrations and seed data
   npm run db:init --workspace=api
   
   # Or run migrations only
   npm run db:migrate --workspace=api
   
   # Or seed data only
   npm run db:seed --workspace=api
   ```

3. **Start Development Server**:
   ```bash
   # Start both API and frontend
   npm run dev
   
   # Or start API only
   npm run dev:api
   ```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | API server port |
| `DB_FILE` | `./data/app.db` | SQLite database file path |
| `DB_ENABLE_WAL` | `true` | Enable Write-Ahead Logging |
| `DB_FOREIGN_KEYS` | `true` | Enforce foreign key constraints |
| `DB_TIMEOUT` | `30000` | Database timeout in milliseconds |
| `API_CORS_ORIGINS` | `http://localhost:5137,...` | Comma-separated CORS origins |

### Running Tests

```bash
# Run all tests
npm run test

# Run API tests only
npm run test:api

# Run tests with coverage
npm run test:coverage --workspace=api
```

### Building for Production

```bash
# Build all workspaces
npm run build

# Build API only
npm run build --workspace=api
```

### Docker Deployment

```bash
# Build and start using Docker Compose
docker-compose up --build
```

---

## Architecture

### Repository Pattern

The API uses the Repository pattern to abstract database operations:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Routes      │────▶│   Repository    │────▶│     SQLite      │
│  (Controllers)  │     │    (Data Layer) │     │    Database     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Benefits**:
- Separation of concerns between HTTP handling and data access
- Easy to mock for unit testing
- Consistent error handling across all entities
- Automatic mapping between camelCase (JavaScript) and snake_case (SQL)

### Request/Response Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Client  │───▶│  Express │───▶│  Route   │───▶│  Repo    │───▶│  SQLite  │
│          │◀───│  (CORS)  │◀───│ Handler  │◀───│ Method   │◀───│    DB    │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
                                      │
                                      ▼
                               ┌──────────┐
                               │  Error   │
                               │ Handler  │
                               └──────────┘
```

### Database Schema

The database follows the Entity-Relationship Diagram (ERD):

```
Headquarters ─┬─< Branch ─┬─< Order ─┬─< OrderDetail ─┬─< OrderDetailDelivery
              │           │          │                │
              │           │          │                ▲
              │           │          │                │
              │           │          └────────────────┼─ Delivery
              │           │                           │
              │           │                           ▲
              │           │                           │
Supplier ─────┴───────────┴───────────────────────────┴─< Product
```

**Key Relationships**:
- Headquarters → Branches (one-to-many)
- Branch → Orders (one-to-many)
- Order → OrderDetails (one-to-many)
- OrderDetail → Product (many-to-one)
- Supplier → Products (one-to-many)
- Supplier → Deliveries (one-to-many)
- OrderDetail ↔ Delivery via OrderDetailDelivery (many-to-many)

### Error Handling Conventions

The API uses custom error classes for consistent error handling:

| Error Class | HTTP Status | Use Case |
|-------------|-------------|----------|
| `DatabaseError` | 500 | General database errors |
| `NotFoundError` | 404 | Entity not found |
| `ValidationError` | 400 | Invalid input data |
| `ConflictError` | 409 | Constraint violations |

Errors are caught by Express middleware and converted to appropriate HTTP responses.

---

## Additional Resources

- **Interactive API Docs**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs) (when server is running)
- **Architecture Guide**: [docs/architecture.md](./architecture.md)
- **SQLite Integration**: [docs/sqlite-integration.md](./sqlite-integration.md)
- **Build Guide**: [docs/build.md](./build.md)

---

## Changelog

### Version 1.0.0
- Initial API release with full CRUD operations for all entities
- SQLite database integration with migrations and seeding
- OpenAPI/Swagger documentation
- Repository pattern implementation
- Comprehensive error handling
