# API Integration

This guide covers how the frontend integrates with the backend REST API, including configuration, error handling, and authentication patterns.

## Table of Contents

- [API Configuration](#api-configuration)
- [Making API Requests](#making-api-requests)
- [React Query Integration](#react-query-integration)
- [Error Handling](#error-handling)
- [Authentication Flow](#authentication-flow)
- [API Endpoints](#api-endpoints)
- [Request/Response Patterns](#requestresponse-patterns)
- [Best Practices](#best-practices)

---

## API Configuration

### Configuration File

**Location:** `src/api/config.ts`

This file handles API base URL detection and provides centralized endpoint definitions.

### Base URL Detection Logic

The API URL is determined in the following order:

1. **Runtime Configuration** (highest priority)
   - Checks `window.RUNTIME_CONFIG.API_URL`
   - Useful for Docker/production deployments

2. **GitHub Codespaces Detection**
   - Auto-detects Codespace hostname patterns
   - Maps to port 3000 on the same codespace

3. **Local Development** (fallback)
   - Uses `http://localhost:3000`
   - Protocol matches frontend (http/https)

### Configuration Code

```typescript
const getBaseUrl = () => {
  // Check runtime configuration
  if (typeof window !== 'undefined' && window.RUNTIME_CONFIG?.API_URL) {
    return window.RUNTIME_CONFIG.API_URL;
  }

  // Detect protocol
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
  const protocolToUse = protocol.includes('https') ? 'https' : 'http';

  // Detect GitHub Codespaces
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const codespacesMatch =
      host.match(/^(.*)-(\d+)\.app\.github\.dev$/) ||
      host.match(/^(.*)-(\d+)\.githubpreview\.dev$/);
    if (codespacesMatch) {
      return `${protocolToUse}://${codespacesMatch[1]}-3000.app.github.dev`;
    }
  }

  // Default to localhost
  return `${protocolToUse}://localhost:3000`;
};

export const API_BASE_URL = getBaseUrl();
```

### Endpoint Definitions

```typescript
export const api = {
  baseURL: API_BASE_URL,
  endpoints: {
    products: '/api/products',
    suppliers: '/api/suppliers',
    orders: '/api/orders',
    branches: '/api/branches',
    headquarters: '/api/headquarters',
    deliveries: '/api/deliveries',
    orderDetails: '/api/order-details',
    orderDetailDeliveries: '/api/order-detail-deliveries',
  },
};
```

### Environment-Specific Configuration

**Production (Docker):**

Create `public/runtime-config.js`:

```javascript
window.RUNTIME_CONFIG = {
  API_URL: 'https://api.your-domain.com'
};
```

Include in `index.html`:

```html
<script src="/runtime-config.js"></script>
```

**Local Development:**

No configuration needed. Defaults to `http://localhost:3000`.

**Codespaces:**

Automatically detected and configured.

---

## Making API Requests

### Using Axios

The application uses Axios for HTTP requests.

**Installation:**
```bash
npm install axios
```

**Basic GET Request:**

```typescript
import axios from 'axios';
import { api } from '../api/config';

const fetchProducts = async () => {
  const response = await axios.get(`${api.baseURL}${api.endpoints.products}`);
  return response.data;
};
```

**GET Request with ID:**

```typescript
const fetchProduct = async (id: number) => {
  const response = await axios.get(`${api.baseURL}${api.endpoints.products}/${id}`);
  return response.data;
};
```

**POST Request:**

```typescript
const createProduct = async (productData: Partial<Product>) => {
  const response = await axios.post(
    `${api.baseURL}${api.endpoints.products}`,
    productData
  );
  return response.data;
};
```

**PUT Request:**

```typescript
const updateProduct = async (id: number, productData: Partial<Product>) => {
  const response = await axios.put(
    `${api.baseURL}${api.endpoints.products}/${id}`,
    productData
  );
  return response.data;
};
```

**DELETE Request:**

```typescript
const deleteProduct = async (id: number) => {
  await axios.delete(`${api.baseURL}${api.endpoints.products}/${id}`);
};
```

---

## React Query Integration

### Overview

React Query manages server state (fetching, caching, synchronization) with minimal boilerplate.

**Installation:**
```bash
npm install react-query
```

**Current Version:** This project uses React Query v3. For newer projects, consider React Query v4+ (renamed to @tanstack/react-query) which uses object-based API syntax.

### Setup

**No setup required** - React Query is used directly in components without a provider in the current implementation.

### Basic Query

```typescript
import { useQuery } from 'react-query';
import axios from 'axios';
import { api } from '../api/config';

function Products() {
  // React Query v3 syntax (current)
  const { data, isLoading, error } = useQuery('products', async () => {
    const response = await axios.get(`${api.baseURL}${api.endpoints.products}`);
    return response.data;
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading products</div>;

  return <div>{/* Render products */}</div>;
}
```

### Query with Parameters

```typescript
const fetchProduct = async (id: number) => {
  const { data } = await axios.get(`${api.baseURL}${api.endpoints.products}/${id}`);
  return data;
};

function ProductDetail({ productId }: { productId: number }) {
  const { data: product, isLoading } = useQuery(
    ['product', productId],  // Query key includes parameter
    () => fetchProduct(productId)
  );

  // Component logic
}
```

### Mutations

For create, update, delete operations:

```typescript
import { useMutation, useQueryClient } from 'react-query';

function ProductForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation(
    (newProduct: Product) => axios.post(`${api.baseURL}${api.endpoints.products}`, newProduct),
    {
      onSuccess: () => {
        // Invalidate and refetch products query
        queryClient.invalidateQueries('products');
      },
    }
  );

  const handleSubmit = (productData: Product) => {
    mutation.mutate(productData);
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
}
```

### React Query Benefits

- **Automatic Caching** - Avoids redundant network requests
- **Background Refetching** - Keeps data fresh
- **Loading & Error States** - Built-in state management
- **Request Deduplication** - Multiple components requesting same data = one request
- **Optimistic Updates** - Update UI before server response

---

## Error Handling

### Component-Level Error Handling

**Display Error State:**

```typescript
const { data, isLoading, error } = useQuery('products', fetchProducts);

if (error) {
  return (
    <div className="text-red-500 text-center">
      Failed to fetch products. Please try again later.
    </div>
  );
}
```

### Try-Catch Error Handling

For manual API calls (outside React Query):

```typescript
const handleDelete = async (productId: number) => {
  try {
    await axios.delete(`${api.baseURL}${api.endpoints.products}/${productId}`);
    alert('Product deleted successfully');
    fetchProducts(); // Refresh list
  } catch (error) {
    console.error('Error deleting product:', error);
    alert('Failed to delete product');
  }
};
```

### Axios Error Structure

```typescript
try {
  await axios.get('/api/endpoint');
} catch (error) {
  if (axios.isAxiosError(error)) {
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
}
```

### HTTP Status Code Handling

```typescript
try {
  await axios.get(`${api.baseURL}${api.endpoints.products}/${id}`);
} catch (error) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 404) {
      // Display user-friendly error in UI
      setErrorMessage('Product not found');
    } else if (error.response?.status === 500) {
      // Display user-friendly error in UI
      setErrorMessage('Server error. Please try again later.');
    } else {
      // Display generic error in UI
      setErrorMessage('An error occurred');
    }
    // Log error for debugging (in development only)
    if (import.meta.env.DEV) {
      console.error('API Error:', error);
    }
  }
}
```

### Global Error Handling (Future Enhancement)

Consider adding an Axios interceptor:

```typescript
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error handling logic
    if (error.response?.status === 401) {
      // Redirect to login
    }
    return Promise.reject(error);
  }
);
```

---

## Authentication Flow

### Current Implementation

The current authentication is **mock/client-side only** and suitable for demos.

**How It Works:**

1. User enters email and password
2. `AuthContext.login()` checks if email and password exist
3. Sets `isLoggedIn = true`
4. Sets `isAdmin = true` if email ends with `@github.com`
5. No server validation or session persistence

**Code:**

```typescript
// src/context/AuthContext.tsx

const login = async (email: string, password: string) => {
  if (email && password) {
    setIsLoggedIn(true);
    setIsAdmin(email.endsWith('@github.com'));
  }
};

const logout = () => {
  setIsLoggedIn(false);
  setIsAdmin(false);
};
```

### Real Authentication (Future Implementation)

For production, implement proper authentication:

**1. Login Endpoint:**

```typescript
const login = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${api.baseURL}/api/auth/login`, {
      email,
      password,
    });
    
    const { token, user } = response.data;
    
    // Store token in localStorage or httpOnly cookie
    localStorage.setItem('authToken', token);
    
    setIsLoggedIn(true);
    setIsAdmin(user.role === 'admin');
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};
```

**2. Axios Interceptor for Token:**

```typescript
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**3. Logout Endpoint:**

```typescript
const logout = async () => {
  try {
    await axios.post(`${api.baseURL}/api/auth/logout`);
  } finally {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    setIsAdmin(false);
  }
};
```

**4. Protected Route Check:**

```typescript
useEffect(() => {
  const token = localStorage.getItem('authToken');
  if (token) {
    // Validate token with API
    axios.get(`${api.baseURL}/api/auth/me`)
      .then(response => {
        setIsLoggedIn(true);
        setIsAdmin(response.data.role === 'admin');
      })
      .catch(() => {
        localStorage.removeItem('authToken');
      });
  }
}, []);
```

---

## API Endpoints

### Available Endpoints

All endpoints are prefixed with `/api/`:

| Entity | Endpoint | Methods |
|--------|----------|---------|
| Products | `/api/products` | GET, POST |
| Products (single) | `/api/products/:id` | GET, PUT, DELETE |
| Suppliers | `/api/suppliers` | GET, POST |
| Suppliers (single) | `/api/suppliers/:id` | GET, PUT, DELETE |
| Orders | `/api/orders` | GET, POST |
| Orders (single) | `/api/orders/:id` | GET, PUT, DELETE |
| Branches | `/api/branches` | GET, POST |
| Branches (single) | `/api/branches/:id` | GET, PUT, DELETE |
| Headquarters | `/api/headquarters` | GET, POST |
| Headquarters (single) | `/api/headquarters/:id` | GET, PUT, DELETE |
| Deliveries | `/api/deliveries` | GET, POST |
| Deliveries (single) | `/api/deliveries/:id` | GET, PUT, DELETE |
| Order Details | `/api/order-details` | GET, POST |
| Order Details (single) | `/api/order-details/:id` | GET, PUT, DELETE |
| Order Detail Deliveries | `/api/order-detail-deliveries` | GET, POST |
| Order Detail Deliveries (single) | `/api/order-detail-deliveries/:id` | GET, PUT, DELETE |

### Endpoint Usage Examples

**Fetch all products:**
```typescript
GET ${api.baseURL}/api/products
```

**Fetch single product:**
```typescript
GET ${api.baseURL}/api/products/123
```

**Create product:**
```typescript
POST ${api.baseURL}/api/products
Body: { name: "Product", price: 10.99, ... }
```

**Update product:**
```typescript
PUT ${api.baseURL}/api/products/123
Body: { name: "Updated Product", ... }
```

**Delete product:**
```typescript
DELETE ${api.baseURL}/api/products/123
```

---

## Request/Response Patterns

### TypeScript Interfaces

Define interfaces matching API responses:

```typescript
interface Product {
  productId: number;
  name: string;
  description: string;
  price: number;
  imgName: string;
  sku: string;
  unit: string;
  supplierId: number;
  discount?: number;
}

interface Supplier {
  supplierId: number;
  name: string;
  description: string;
  contactPerson: string;
  email: string;
  phone: string;
}
```

### Response Handling

**List Response:**

```typescript
const fetchProducts = async (): Promise<Product[]> => {
  const { data } = await axios.get(`${api.baseURL}${api.endpoints.products}`);
  return data; // Assumes API returns array directly
};
```

**Single Item Response:**

```typescript
const fetchProduct = async (id: number): Promise<Product> => {
  const { data } = await axios.get(`${api.baseURL}${api.endpoints.products}/${id}`);
  return data;
};
```

### Request Payload

**Create/Update:**

```typescript
const productData: Partial<Product> = {
  name: 'New Product',
  description: 'Description',
  price: 29.99,
  sku: 'SKU123',
  unit: 'unit',
  supplierId: 1,
  imgName: 'product.png',
};

await axios.post(`${api.baseURL}${api.endpoints.products}`, productData);
```

---

## Best Practices

### 1. Centralize API Calls

Create dedicated functions for API calls:

```typescript
// src/api/products.ts
export const productApi = {
  getAll: () => axios.get(`${api.baseURL}${api.endpoints.products}`),
  getById: (id: number) => axios.get(`${api.baseURL}${api.endpoints.products}/${id}`),
  create: (data: Partial<Product>) => axios.post(`${api.baseURL}${api.endpoints.products}`, data),
  update: (id: number, data: Partial<Product>) => axios.put(`${api.baseURL}${api.endpoints.products}/${id}`, data),
  delete: (id: number) => axios.delete(`${api.baseURL}${api.endpoints.products}/${id}`),
};
```

### 2. Use React Query for All Data Fetching

Prefer React Query over manual `useEffect` + `useState`:

❌ **Not Recommended:**
```typescript
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  setLoading(true);
  axios.get(url)
    .then(res => setProducts(res.data))
    .finally(() => setLoading(false));
}, []);
```

✅ **Recommended:**
```typescript
const { data: products, isLoading } = useQuery('products', fetchProducts);
```

### 3. Handle Loading and Error States

Always handle loading and error states:

```typescript
if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage />;
return <DataDisplay data={data} />;
```

### 4. Type Safety

Use TypeScript interfaces for all API data:

```typescript
const { data } = useQuery<Product[]>('products', fetchProducts);
```

### 5. Consistent Error Messages

Provide user-friendly error messages:

```typescript
if (error) {
  return <div>Unable to load products. Please try again later.</div>;
}
```

### 6. Optimistic Updates

For better UX, update UI before API confirmation:

```typescript
const mutation = useMutation(updateProduct, {
  onMutate: async (newProduct) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries('products');

    // Snapshot previous value
    const previousProducts = queryClient.getQueryData('products');

    // Optimistically update
    queryClient.setQueryData('products', (old: Product[]) => 
      old.map(p => p.id === newProduct.id ? newProduct : p)
    );

    // Return context with snapshot
    return { previousProducts };
  },
  onError: (err, newProduct, context) => {
    // Rollback on error
    queryClient.setQueryData('products', context.previousProducts);
  },
});
```

### 7. Request Deduplication

React Query automatically deduplicates requests, but for manual calls, track inflight requests:

```typescript
let inflightRequest: Promise<any> | null = null;

const fetchProducts = async () => {
  if (inflightRequest) return inflightRequest;
  
  inflightRequest = axios.get(url);
  const result = await inflightRequest;
  inflightRequest = null;
  
  return result;
};
```

### 8. API Call Logging (Development)

Log API calls during development:

```typescript
const fetchProducts = async () => {
  console.log('Fetching products from:', `${api.baseURL}${api.endpoints.products}`);
  const response = await axios.get(`${api.baseURL}${api.endpoints.products}`);
  console.log('Products received:', response.data);
  return response.data;
};
```

### 9. CORS Handling

If encountering CORS issues:
- Ensure backend has CORS enabled
- Check API URL is correct
- For development, proxy can be configured in `vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
});
```

### 10. Timeout Configuration

Set reasonable timeouts for API calls:

```typescript
axios.create({
  baseURL: api.baseURL,
  timeout: 10000, // 10 seconds
});
```

---

## Debugging Tips

### Check API URL

```typescript
console.log('API Base URL:', API_BASE_URL);
```

### Network Tab

- Open browser DevTools → Network tab
- Filter by "Fetch/XHR"
- Inspect request/response details

### React Query DevTools (Future Enhancement)

Install and use React Query DevTools:

```bash
npm install @tanstack/react-query-devtools
```

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

---

## Related Documentation

- [Setup Guide](./setup.md) - Environment configuration
- [Architecture](./architecture.md) - Overall system design
- [Backend API Documentation](../../api/api-swagger.json) - Full API specification
