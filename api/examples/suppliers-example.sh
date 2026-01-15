#!/bin/bash
# Supplier CRUD Operations Example
# Demonstrates Create, Read, Update, and Delete operations

set -e  # Exit on error

API_BASE="${API_BASE:-http://localhost:3000/api}"

echo "=========================================="
echo "  OctoCAT Supply API - Supplier Example"
echo "=========================================="
echo ""
echo "API Base: $API_BASE"
echo ""

# Check if API is running
if ! curl -s "${API_BASE}/suppliers" > /dev/null 2>&1; then
    echo "❌ Error: API is not running at ${API_BASE}"
    echo "   Please start the API with: npm run dev --workspace=api"
    exit 1
fi

echo "✓ API is running"
echo ""

# 1. Create a new supplier
echo "1️⃣  Creating a new supplier..."
RESPONSE=$(curl -s -X POST "${API_BASE}/suppliers" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "FutureTech Supplies",
    "description": "Next-generation technology supplier",
    "contactPerson": "Jane Smith",
    "email": "jane@futuretech.com",
    "phone": "555-9999"
  }')

if command -v jq &> /dev/null; then
    echo "$RESPONSE" | jq '.'
    SUPPLIER_ID=$(echo "$RESPONSE" | jq -r '.supplierId')
else
    echo "$RESPONSE"
    SUPPLIER_ID=$(echo "$RESPONSE" | grep -o '"supplierId":[0-9]*' | grep -o '[0-9]*')
fi

if [ -z "$SUPPLIER_ID" ] || [ "$SUPPLIER_ID" = "null" ]; then
    echo "❌ Failed to create supplier"
    exit 1
fi

echo "✓ Created supplier with ID: $SUPPLIER_ID"
echo ""

# 2. Read the supplier
echo "2️⃣  Reading supplier #${SUPPLIER_ID}..."
RESPONSE=$(curl -s "${API_BASE}/suppliers/${SUPPLIER_ID}")

if command -v jq &> /dev/null; then
    echo "$RESPONSE" | jq '.'
else
    echo "$RESPONSE"
fi

echo "✓ Retrieved supplier details"
echo ""

# 3. Update the supplier
echo "3️⃣  Updating supplier phone and description..."
RESPONSE=$(curl -s -X PUT "${API_BASE}/suppliers/${SUPPLIER_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "555-8888",
    "description": "Leading next-generation technology supplier with worldwide shipping"
  }')

if command -v jq &> /dev/null; then
    echo "$RESPONSE" | jq '.'
else
    echo "$RESPONSE"
fi

echo "✓ Updated supplier"
echo ""

# 4. List all suppliers
echo "4️⃣  Listing all suppliers..."
RESPONSE=$(curl -s "${API_BASE}/suppliers")

if command -v jq &> /dev/null; then
    COUNT=$(echo "$RESPONSE" | jq '. | length')
    echo "Total suppliers: $COUNT"
    echo ""
    echo "Supplier list:"
    echo "$RESPONSE" | jq '.[] | {id: .supplierId, name: .name, contact: .contactPerson}'
else
    echo "$RESPONSE"
fi

echo ""

# 5. Delete the supplier
echo "5️⃣  Deleting supplier #${SUPPLIER_ID}..."
HTTP_CODE=$(curl -s -w "%{http_code}" -o /dev/null -X DELETE "${API_BASE}/suppliers/${SUPPLIER_ID}")

if [ "$HTTP_CODE" = "204" ]; then
    echo "✓ Deleted supplier (HTTP $HTTP_CODE)"
else
    echo "❌ Failed to delete supplier (HTTP $HTTP_CODE)"
    exit 1
fi

echo ""

# 6. Verify deletion
echo "6️⃣  Verifying deletion..."
HTTP_CODE=$(curl -s -w "%{http_code}" -o /dev/null "${API_BASE}/suppliers/${SUPPLIER_ID}")

if [ "$HTTP_CODE" = "404" ]; then
    echo "✓ Supplier not found (correctly deleted)"
else
    echo "⚠️  Unexpected status: HTTP $HTTP_CODE"
fi

echo ""
echo "=========================================="
echo "  ✅ All operations completed successfully!"
echo "=========================================="
echo ""
echo "Tip: You can set a different API base with:"
echo "  export API_BASE=http://your-api-host:port/api"
echo "  ./suppliers-example.sh"
