# API Endpoints Documentation

Complete reference for all REST API endpoints in the OctoCAT Supply Chain Management API.

## Base URL

- **Development**: `http://localhost:3000`
- **API Prefix**: `/api`

All endpoints are prefixed with `/api`. Example: `http://localhost:3000/api/products`

## Interactive Documentation

For interactive testing and exploration:
- **Swagger UI**: http://localhost:3000/api-docs
- **OpenAPI JSON**: http://localhost:3000/api-docs.json

## Common Response Patterns

### Success Responses

- **200 OK**: Resource retrieved successfully
- **201 Created**: Resource created successfully
- **204 No Content**: Resource deleted successfully

### Error Responses

- **400 Bad Request**: Invalid request data
- **404 Not Found**: Resource not found
- **409 Conflict**: Constraint violation (e.g., foreign key error)
- **500 Internal Server Error**: Server error

Error responses return JSON:
```json
{
  "error": "Error message describing the problem"
}
```

## Authentication

Currently, the API does not require authentication. This is suitable for demo and development purposes.

---

## Suppliers

Manage supplier information and contact details.

### GET /api/suppliers

Get all suppliers.

**Response**: `200 OK`
```json
[
  {
    "supplierId": 1,
    "name": "TechSupply Co",
    "description": "Leading technology supplier",
    "contactPerson": "John Doe",
    "email": "john@techsupply.com",
    "phone": "555-0100"
  }
]
```

### GET /api/suppliers/:id

Get a supplier by ID.

**Parameters**:
- `id` (path, integer) - Supplier ID

**Response**: `200 OK`
```json
{
  "supplierId": 1,
  "name": "TechSupply Co",
  "description": "Leading technology supplier",
  "contactPerson": "John Doe",
  "email": "john@techsupply.com",
  "phone": "555-0100"
}
```

**Errors**:
- `404 Not Found` - Supplier not found

### POST /api/suppliers

Create a new supplier.

**Request Body**:
```json
{
  "name": "New Supplier Inc",
  "description": "New supplier description",
  "contactPerson": "Jane Smith",
  "email": "jane@newsupplier.com",
  "phone": "555-0200"
}
```

**Response**: `201 Created`
```json
{
  "supplierId": 2,
  "name": "New Supplier Inc",
  "description": "New supplier description",
  "contactPerson": "Jane Smith",
  "email": "jane@newsupplier.com",
  "phone": "555-0200"
}
```

### PUT /api/suppliers/:id

Update a supplier.

**Parameters**:
- `id` (path, integer) - Supplier ID

**Request Body** (all fields optional):
```json
{
  "name": "Updated Supplier Name",
  "phone": "555-9999"
}
```

**Response**: `200 OK`
```json
{
  "supplierId": 1,
  "name": "Updated Supplier Name",
  "description": "Leading technology supplier",
  "contactPerson": "John Doe",
  "email": "john@techsupply.com",
  "phone": "555-9999"
}
```

**Errors**:
- `404 Not Found` - Supplier not found

### DELETE /api/suppliers/:id

Delete a supplier.

**Parameters**:
- `id` (path, integer) - Supplier ID

**Response**: `204 No Content`

**Errors**:
- `404 Not Found` - Supplier not found
- `409 Conflict` - Supplier has associated products or deliveries

---

## Headquarters

Manage company headquarters information.

### GET /api/headquarters

Get all headquarters.

**Response**: `200 OK`
```json
[
  {
    "headquartersId": 1,
    "name": "Global HQ",
    "description": "Main headquarters",
    "address": "123 Main St, New York, NY",
    "contactPerson": "Alice Johnson",
    "email": "alice@company.com",
    "phone": "555-0300"
  }
]
```

### GET /api/headquarters/:id

Get headquarters by ID.

**Parameters**:
- `id` (path, integer) - Headquarters ID

**Response**: `200 OK`

**Errors**:
- `404 Not Found` - Headquarters not found

### POST /api/headquarters

Create new headquarters.

**Request Body**:
```json
{
  "name": "Regional HQ East",
  "description": "East coast regional headquarters",
  "address": "456 Oak Ave, Boston, MA",
  "contactPerson": "Bob Wilson",
  "email": "bob@company.com",
  "phone": "555-0400"
}
```

**Response**: `201 Created`

### PUT /api/headquarters/:id

Update headquarters.

**Parameters**:
- `id` (path, integer) - Headquarters ID

**Request Body** (all fields optional):
```json
{
  "address": "789 New Address St, Boston, MA"
}
```

**Response**: `200 OK`

**Errors**:
- `404 Not Found` - Headquarters not found

### DELETE /api/headquarters/:id

Delete headquarters.

**Parameters**:
- `id` (path, integer) - Headquarters ID

**Response**: `204 No Content`

**Errors**:
- `404 Not Found` - Headquarters not found
- `409 Conflict` - Headquarters has associated branches

---

## Branches

Manage branch locations linked to headquarters.

### GET /api/branches

Get all branches.

**Response**: `200 OK`
```json
[
  {
    "branchId": 1,
    "headquartersId": 1,
    "name": "Downtown Branch",
    "description": "City center location",
    "address": "100 Center St, New York, NY",
    "contactPerson": "Carol Davis",
    "email": "carol@branch.com",
    "phone": "555-0500"
  }
]
```

### GET /api/branches/:id

Get branch by ID.

**Parameters**:
- `id` (path, integer) - Branch ID

**Response**: `200 OK`

**Errors**:
- `404 Not Found` - Branch not found

### POST /api/branches

Create new branch.

**Request Body**:
```json
{
  "headquartersId": 1,
  "name": "Suburban Branch",
  "description": "Suburban location",
  "address": "200 Park Ave, Brooklyn, NY",
  "contactPerson": "David Lee",
  "email": "david@branch.com",
  "phone": "555-0600"
}
```

**Response**: `201 Created`

**Errors**:
- `400 Bad Request` - Invalid headquarters ID
- `404 Not Found` - Referenced headquarters not found

### PUT /api/branches/:id

Update branch.

**Parameters**:
- `id` (path, integer) - Branch ID

**Request Body** (all fields optional):
```json
{
  "contactPerson": "New Manager",
  "phone": "555-9999"
}
```

**Response**: `200 OK`

**Errors**:
- `404 Not Found` - Branch not found

### DELETE /api/branches/:id

Delete branch.

**Parameters**:
- `id` (path, integer) - Branch ID

**Response**: `204 No Content`

**Errors**:
- `404 Not Found` - Branch not found
- `409 Conflict` - Branch has associated orders

---

## Products

Manage product catalog.

### GET /api/products

Get all products.

**Response**: `200 OK`
```json
[
  {
    "productId": 1,
    "supplierId": 1,
    "name": "OctoCat Plushie",
    "description": "Adorable GitHub mascot plushie",
    "price": 24.99,
    "sku": "OCTOCAT-001",
    "unit": "piece",
    "imgName": "octocat-plushie.png",
    "discount": 0.10
  }
]
```

### GET /api/products/:id

Get product by ID.

**Parameters**:
- `id` (path, integer) - Product ID

**Response**: `200 OK`

**Errors**:
- `404 Not Found` - Product not found

### GET /api/products/name/:name

Search products by name (partial match).

**Parameters**:
- `name` (path, string) - Product name to search

**Response**: `200 OK`
```json
[
  {
    "productId": 1,
    "name": "OctoCat Plushie",
    ...
  }
]
```

### POST /api/products

Create new product.

**Request Body**:
```json
{
  "supplierId": 1,
  "name": "New Product",
  "description": "Product description",
  "price": 49.99,
  "sku": "PROD-001",
  "unit": "box",
  "imgName": "product.png",
  "discount": 0.0
}
```

**Response**: `201 Created`

**Errors**:
- `400 Bad Request` - Invalid supplier ID or missing required fields
- `404 Not Found` - Referenced supplier not found

### PUT /api/products/:id

Update product.

**Parameters**:
- `id` (path, integer) - Product ID

**Request Body** (all fields optional):
```json
{
  "price": 39.99,
  "discount": 0.15
}
```

**Response**: `200 OK`

**Errors**:
- `404 Not Found` - Product not found

### DELETE /api/products/:id

Delete product.

**Parameters**:
- `id` (path, integer) - Product ID

**Response**: `204 No Content`

**Errors**:
- `404 Not Found` - Product not found
- `409 Conflict` - Product is referenced in order details

---

## Orders

Manage customer orders.

### GET /api/orders

Get all orders.

**Response**: `200 OK`
```json
[
  {
    "orderId": 1,
    "branchId": 1,
    "orderDate": "2024-02-05T10:30:00.000Z",
    "name": "Q1 Office Supplies",
    "description": "Quarterly office supply order",
    "status": "pending"
  }
]
```

### GET /api/orders/:id

Get order by ID.

**Parameters**:
- `id` (path, integer) - Order ID

**Response**: `200 OK`

**Errors**:
- `404 Not Found` - Order not found

### POST /api/orders

Create new order.

**Request Body**:
```json
{
  "branchId": 1,
  "orderDate": "2024-02-05T10:30:00.000Z",
  "name": "New Order",
  "description": "Order description",
  "status": "pending"
}
```

**Valid status values**: `pending`, `processing`, `completed`, `cancelled`

**Response**: `201 Created`

**Errors**:
- `400 Bad Request` - Invalid branch ID or status
- `404 Not Found` - Referenced branch not found

### PUT /api/orders/:id

Update order.

**Parameters**:
- `id` (path, integer) - Order ID

**Request Body** (all fields optional):
```json
{
  "status": "processing",
  "description": "Updated description"
}
```

**Response**: `200 OK`

**Errors**:
- `404 Not Found` - Order not found

### DELETE /api/orders/:id

Delete order.

**Parameters**:
- `id` (path, integer) - Order ID

**Response**: `204 No Content`

**Errors**:
- `404 Not Found` - Order not found
- `409 Conflict` - Order has associated order details

---

## Order Details

Manage order line items.

### GET /api/order-details

Get all order details.

**Response**: `200 OK`
```json
[
  {
    "orderDetailId": 1,
    "orderId": 1,
    "productId": 1,
    "quantity": 50,
    "unitPrice": 24.99,
    "notes": "Please expedite"
  }
]
```

### GET /api/order-details/:id

Get order detail by ID.

**Parameters**:
- `id` (path, integer) - Order detail ID

**Response**: `200 OK`

**Errors**:
- `404 Not Found` - Order detail not found

### POST /api/order-details

Create new order detail.

**Request Body**:
```json
{
  "orderId": 1,
  "productId": 5,
  "quantity": 100,
  "unitPrice": 15.99,
  "notes": "Standard delivery"
}
```

**Response**: `201 Created`

**Errors**:
- `400 Bad Request` - Invalid order/product ID or quantity
- `404 Not Found` - Referenced order or product not found

### PUT /api/order-details/:id

Update order detail.

**Parameters**:
- `id` (path, integer) - Order detail ID

**Request Body** (all fields optional):
```json
{
  "quantity": 75,
  "notes": "Updated notes"
}
```

**Response**: `200 OK`

**Errors**:
- `404 Not Found` - Order detail not found

### DELETE /api/order-details/:id

Delete order detail.

**Parameters**:
- `id` (path, integer) - Order detail ID

**Response**: `204 No Content`

**Errors**:
- `404 Not Found` - Order detail not found
- `409 Conflict` - Order detail has associated deliveries

---

## Deliveries

Manage deliveries from suppliers.

### GET /api/deliveries

Get all deliveries.

**Response**: `200 OK`
```json
[
  {
    "deliveryId": 1,
    "supplierId": 1,
    "deliveryDate": "2024-02-10T14:00:00.000Z",
    "name": "Weekly Shipment #42",
    "description": "Regular weekly supply",
    "status": "in_transit"
  }
]
```

### GET /api/deliveries/:id

Get delivery by ID.

**Parameters**:
- `id` (path, integer) - Delivery ID

**Response**: `200 OK`

**Errors**:
- `404 Not Found` - Delivery not found

### POST /api/deliveries

Create new delivery.

**Request Body**:
```json
{
  "supplierId": 1,
  "deliveryDate": "2024-02-15T09:00:00.000Z",
  "name": "Express Delivery",
  "description": "Urgent delivery",
  "status": "pending"
}
```

**Valid status values**: `pending`, `in_transit`, `delivered`, `cancelled`

**Response**: `201 Created`

**Errors**:
- `400 Bad Request` - Invalid supplier ID or status
- `404 Not Found` - Referenced supplier not found

### PUT /api/deliveries/:id

Update delivery.

**Parameters**:
- `id` (path, integer) - Delivery ID

**Request Body** (all fields optional):
```json
{
  "status": "delivered"
}
```

**Response**: `200 OK`

**Errors**:
- `404 Not Found` - Delivery not found

### DELETE /api/deliveries/:id

Delete delivery.

**Parameters**:
- `id` (path, integer) - Delivery ID

**Response**: `204 No Content`

**Errors**:
- `404 Not Found` - Delivery not found
- `409 Conflict` - Delivery has associated order detail deliveries

---

## Order Detail Deliveries

Manage the fulfillment of order items by deliveries (junction table).

### GET /api/order-detail-deliveries

Get all order detail deliveries.

**Response**: `200 OK`
```json
[
  {
    "orderDetailDeliveryId": 1,
    "orderDetailId": 1,
    "deliveryId": 1,
    "quantity": 50,
    "notes": "Full shipment received"
  }
]
```

### GET /api/order-detail-deliveries/:id

Get order detail delivery by ID.

**Parameters**:
- `id` (path, integer) - Order detail delivery ID

**Response**: `200 OK`

**Errors**:
- `404 Not Found` - Order detail delivery not found

### POST /api/order-detail-deliveries

Create new order detail delivery (link order detail to delivery).

**Request Body**:
```json
{
  "orderDetailId": 1,
  "deliveryId": 5,
  "quantity": 25,
  "notes": "Partial shipment"
}
```

**Response**: `201 Created`

**Errors**:
- `400 Bad Request` - Invalid order detail/delivery ID or quantity
- `404 Not Found` - Referenced order detail or delivery not found

### PUT /api/order-detail-deliveries/:id

Update order detail delivery.

**Parameters**:
- `id` (path, integer) - Order detail delivery ID

**Request Body** (all fields optional):
```json
{
  "quantity": 50,
  "notes": "Updated quantity"
}
```

**Response**: `200 OK`

**Errors**:
- `404 Not Found` - Order detail delivery not found

### DELETE /api/order-detail-deliveries/:id

Delete order detail delivery.

**Parameters**:
- `id` (path, integer) - Order detail delivery ID

**Response**: `204 No Content`

**Errors**:
- `404 Not Found` - Order detail delivery not found

---

## Error Handling

The API uses custom error classes that map to HTTP status codes:

### NotFoundError (404)

Returned when a requested resource doesn't exist.

**Example Response**:
```json
{
  "error": "Product with ID 999 not found"
}
```

### ValidationError (400)

Returned when request data is invalid or missing required fields.

**Example Response**:
```json
{
  "error": "Validation failed: quantity must be a positive integer"
}
```

### ConflictError (409)

Returned when an operation would violate database constraints (e.g., foreign key, unique constraint).

**Example Response**:
```json
{
  "error": "Cannot delete supplier: associated products exist"
}
```

### DatabaseError (500)

Returned for unexpected database errors.

**Example Response**:
```json
{
  "error": "Internal server error"
}
```

Note: In production, error messages are sanitized to avoid exposing sensitive information.

---

## CORS Configuration

CORS is enabled for all origins in development. For production deployments, configure allowed origins in the Express CORS middleware.

---

## Rate Limiting

Currently, no rate limiting is implemented. For production deployments, consider adding rate limiting middleware.

---

## Pagination

Currently, endpoints return all results. For large datasets in production, implement pagination with query parameters:

**Suggested pagination pattern** (not yet implemented):
```
GET /api/products?page=1&limit=20
```

---

## Testing Endpoints

### Using cURL

```bash
# Get all products
curl http://localhost:3000/api/products

# Get product by ID
curl http://localhost:3000/api/products/1

# Create new product
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "supplierId": 1,
    "name": "New Product",
    "price": 29.99,
    "sku": "PROD-001",
    "unit": "box"
  }'

# Update product
curl -X PUT http://localhost:3000/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{"price": 24.99}'

# Delete product
curl -X DELETE http://localhost:3000/api/products/1
```

### Using Swagger UI

1. Start the API server: `npm run dev --workspace=api`
2. Open http://localhost:3000/api-docs
3. Expand an endpoint and click "Try it out"
4. Fill in parameters and click "Execute"
5. View the response

---

## Best Practices

1. **Use appropriate HTTP methods**: GET for reads, POST for creates, PUT for updates, DELETE for deletes
2. **Check for existence**: Verify referenced entities exist before creating relationships
3. **Handle errors**: Always check response status codes and handle errors appropriately
4. **Validate input**: Ensure required fields are provided and values are valid
5. **Use transactions**: For operations affecting multiple tables, consider implementing transactions
6. **Test with Swagger UI**: Use the interactive documentation to test endpoints before integrating

---

## Additional Resources

- [Models Documentation](./models.md) - Entity models and relationships
- [Repository Pattern](./repository-pattern.md) - Data access layer
- [Database Schema](./database.md) - Database structure
- [Development Guide](./development.md) - Setup and testing
- [Swagger UI](http://localhost:3000/api-docs) - Interactive API documentation
