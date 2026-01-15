# API Examples

This directory contains example scripts and requests for working with the OctoCAT Supply Chain Management API.

## Using the Examples

All examples assume the API is running on `http://localhost:3000`.

### Prerequisites

```bash
# Start the API server
cd api
npm run dev

# In another terminal, run the examples
cd api/examples
```

## Example Scripts

### suppliers-example.sh

Create, read, update, and delete a supplier:

```bash
#!/bin/bash
API_BASE="http://localhost:3000/api"

echo "=== Supplier CRUD Examples ==="

# Create a new supplier
echo -e "\n1. Creating a new supplier..."
RESPONSE=$(curl -s -X POST "${API_BASE}/suppliers" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "FutureTech Supplies",
    "description": "Next-generation technology supplier",
    "contactPerson": "Jane Smith",
    "email": "jane@futuretech.com",
    "phone": "555-9999"
  }')

echo "$RESPONSE"
SUPPLIER_ID=$(echo "$RESPONSE" | jq -r '.supplierId')
echo "Created supplier with ID: $SUPPLIER_ID"

# Read the supplier
echo -e "\n2. Reading the supplier..."
curl -s "${API_BASE}/suppliers/${SUPPLIER_ID}" | jq '.'

# Update the supplier
echo -e "\n3. Updating the supplier..."
curl -s -X PUT "${API_BASE}/suppliers/${SUPPLIER_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "555-8888",
    "description": "Leading next-generation technology supplier"
  }' | jq '.'

# List all suppliers
echo -e "\n4. Listing all suppliers..."
curl -s "${API_BASE}/suppliers" | jq '. | length' | xargs echo "Total suppliers:"

# Delete the supplier
echo -e "\n5. Deleting the supplier..."
curl -s -X DELETE "${API_BASE}/suppliers/${SUPPLIER_ID}" -w "\nStatus: %{http_code}\n"

echo -e "\nDone!"
```

### products-example.sh

Work with products:

```bash
#!/bin/bash
API_BASE="http://localhost:3000/api"

echo "=== Product Examples ==="

# Create a product
echo -e "\n1. Creating a product..."
curl -s -X POST "${API_BASE}/products" \
  -H "Content-Type: application/json" \
  -d '{
    "supplierId": 1,
    "name": "SuperGadget 3000",
    "description": "The ultimate productivity gadget",
    "price": 299.99,
    "sku": "GAD-3000",
    "unit": "piece",
    "discount": 0.1
  }' | jq '.'

# Get products by supplier
echo -e "\n2. Listing all products..."
curl -s "${API_BASE}/products" | jq '[.[] | {id: .productId, name: .name, price: .price}]'

# Get product by name
echo -e "\n3. Getting product by name..."
curl -s "${API_BASE}/products/name/SuperGadget%203000" | jq '.'
```

### orders-example.sh

Create an order with details:

```bash
#!/bin/bash
API_BASE="http://localhost:3000/api"

echo "=== Order Creation Example ==="

# Create an order
echo -e "\n1. Creating an order..."
ORDER_RESPONSE=$(curl -s -X POST "${API_BASE}/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "branchId": 1,
    "orderDate": "2024-01-15T10:00:00Z",
    "name": "Monthly Office Supplies",
    "description": "Regular office supply order",
    "status": "pending"
  }')

echo "$ORDER_RESPONSE"
ORDER_ID=$(echo "$ORDER_RESPONSE" | jq -r '.orderId')
echo "Created order with ID: $ORDER_ID"

# Add order details
echo -e "\n2. Adding order details (line items)..."
curl -s -X POST "${API_BASE}/order-details" \
  -H "Content-Type: application/json" \
  -d "{
    \"orderId\": ${ORDER_ID},
    \"productId\": 1,
    \"quantity\": 5,
    \"unitPrice\": 129.99,
    \"notes\": \"Urgent - needed by end of week\"
  }" | jq '.'

curl -s -X POST "${API_BASE}/order-details" \
  -H "Content-Type: application/json" \
  -d "{
    \"orderId\": ${ORDER_ID},
    \"productId\": 2,
    \"quantity\": 10,
    \"unitPrice\": 49.99
  }" | jq '.'

# View the complete order
echo -e "\n3. Viewing the complete order..."
curl -s "${API_BASE}/orders/${ORDER_ID}" | jq '.'

echo -e "\nOrder created successfully!"
```

### error-handling-example.sh

Demonstrate error handling:

```bash
#!/bin/bash
API_BASE="http://localhost:3000/api"

echo "=== Error Handling Examples ==="

# 404 Not Found
echo -e "\n1. Testing 404 Not Found error..."
curl -s "${API_BASE}/suppliers/99999" | jq '.'

# 400 Validation Error (invalid foreign key)
echo -e "\n2. Testing validation error (invalid foreign key)..."
curl -s -X POST "${API_BASE}/branches" \
  -H "Content-Type: application/json" \
  -d '{
    "headquartersId": 99999,
    "name": "Invalid Branch"
  }' | jq '.'

# 409 Conflict (if unique constraints exist)
echo -e "\n3. Testing conflict error (duplicate)..."
# This depends on your schema having unique constraints

echo -e "\nError examples complete!"
```

## cURL Examples

### Basic Authentication Header

If authentication is added in the future:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:3000/api/suppliers
```

### Pretty Print JSON Response

Use `jq` for formatted output:

```bash
curl -s http://localhost:3000/api/suppliers | jq '.'
```

### Save Response to File

```bash
curl -s http://localhost:3000/api/suppliers > suppliers.json
```

### Include Response Headers

```bash
curl -i http://localhost:3000/api/suppliers
```

### Show HTTP Status Code

```bash
curl -s -w "\nStatus: %{http_code}\n" \
  http://localhost:3000/api/suppliers/1
```

## Postman Collection

You can import these endpoints into Postman using the OpenAPI specification:

1. Open Postman
2. Click "Import"
3. Select "Link"
4. Enter: `http://localhost:3000/api-docs.json`
5. All endpoints will be imported automatically

## HTTPie Examples

If you prefer HTTPie over curl:

```bash
# Install HTTPie
pip install httpie

# GET request
http GET http://localhost:3000/api/suppliers

# POST request
http POST http://localhost:3000/api/suppliers \
  name="New Supplier" \
  email="contact@supplier.com"

# PUT request
http PUT http://localhost:3000/api/suppliers/1 \
  phone="555-1234"

# DELETE request
http DELETE http://localhost:3000/api/suppliers/1
```

## JavaScript/Node.js Examples

### Using fetch (Node.js 18+)

```javascript
// Get all suppliers
const response = await fetch('http://localhost:3000/api/suppliers');
const suppliers = await response.json();
console.log(suppliers);

// Create a supplier
const createResponse = await fetch('http://localhost:3000/api/suppliers', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'New Supplier',
    email: 'contact@newsupplier.com'
  })
});
const newSupplier = await createResponse.json();
console.log('Created:', newSupplier);
```

### Using axios

```javascript
const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

// Get all suppliers
const suppliers = await axios.get(`${API_BASE}/suppliers`);
console.log(suppliers.data);

// Create a supplier
const newSupplier = await axios.post(`${API_BASE}/suppliers`, {
  name: 'New Supplier',
  email: 'contact@newsupplier.com'
});
console.log('Created:', newSupplier.data);

// Update a supplier
const updated = await axios.put(`${API_BASE}/suppliers/1`, {
  phone: '555-1234'
});
console.log('Updated:', updated.data);

// Delete a supplier
await axios.delete(`${API_BASE}/suppliers/1`);
console.log('Deleted');
```

## Python Examples

```python
import requests

API_BASE = 'http://localhost:3000/api'

# Get all suppliers
response = requests.get(f'{API_BASE}/suppliers')
suppliers = response.json()
print(suppliers)

# Create a supplier
new_supplier = {
    'name': 'New Supplier',
    'email': 'contact@newsupplier.com'
}
response = requests.post(f'{API_BASE}/suppliers', json=new_supplier)
print('Created:', response.json())

# Update a supplier
updates = {'phone': '555-1234'}
response = requests.put(f'{API_BASE}/suppliers/1', json=updates)
print('Updated:', response.json())

# Delete a supplier
response = requests.delete(f'{API_BASE}/suppliers/1')
print('Deleted, status:', response.status_code)
```

## Testing Tips

1. **Use environment variables** for the base URL:
   ```bash
   export API_BASE=http://localhost:3000/api
   curl "${API_BASE}/suppliers"
   ```

2. **Save common requests** as shell aliases:
   ```bash
   alias api-suppliers='curl -s http://localhost:3000/api/suppliers | jq'
   ```

3. **Use .http files** in VS Code with the REST Client extension

4. **Test error cases** to ensure error handling works correctly

## Additional Resources

- [Full API Documentation](../README.md)
- [Quick Reference Guide](../QUICK_REFERENCE.md)
- [Swagger UI](http://localhost:3000/api-docs) (when API is running)
