# Frontend Architecture

## Overview

The frontend is built as a modern React single-page application (SPA) using TypeScript, Vite, and Tailwind CSS. The architecture follows a component-based approach with centralized state management for cross-cutting concerns.

## Component Structure

### High-Level Organization

```
src/
├── components/         # Reusable UI components
│   ├── admin/         # Admin-specific components
│   ├── entity/        # Domain entity components
│   │   └── product/   # Product-related components
│   ├── About.tsx
│   ├── Footer.tsx
│   ├── Login.tsx
│   ├── Navigation.tsx
│   └── Welcome.tsx
├── context/           # React Context providers
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   ├── themeContextUtils.tsx
│   └── useTheme.tsx
├── api/              # API configuration
│   └── config.ts
├── assets/           # Static assets (images, etc.)
├── App.tsx           # Root application component
├── main.tsx          # Application entry point
└── index.css         # Global styles
```

### Component Patterns

#### Page Components
Top-level components that represent entire pages/routes:
- `Welcome.tsx` - Landing page
- `About.tsx` - About page
- `Login.tsx` - Login page
- `Products.tsx` - Product listing page
- `AdminProducts.tsx` - Admin product management

#### Layout Components
Structural components used across multiple pages:
- `Navigation.tsx` - Top navigation bar with theme toggle and auth controls
- `Footer.tsx` - Footer displayed on all pages

#### Entity Components
Domain-specific components organized by entity type:
- `entity/product/Products.tsx` - Product list view
- `entity/product/ProductForm.tsx` - Product creation/editing form

#### Admin Components
Protected components for administrative functions:
- `admin/AdminProducts.tsx` - Admin product management interface

## State Management

### Context API

The application uses React Context API for managing global application state. Two primary contexts are implemented:

#### 1. AuthContext

**Purpose:** Manages authentication state and user authorization.

**State:**
- `isLoggedIn: boolean` - Whether a user is authenticated
- `isAdmin: boolean` - Whether the logged-in user has admin privileges

**Methods:**
- `login(email: string, password: string): Promise<void>` - Authenticates user
- `logout(): void` - Clears authentication state

**Usage:**
```typescript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { isLoggedIn, isAdmin, login, logout } = useAuth();
  
  // Use authentication state and methods
}
```

**Implementation Notes:**
- Currently uses client-side mock authentication (checks email domain)
- Admin access granted to `@github.com` email addresses
- State is not persisted across page refreshes (no session storage/cookies)

#### 2. ThemeContext

**Purpose:** Manages dark/light theme preferences.

**State:**
- `darkMode: boolean` - Current theme mode

**Methods:**
- `toggleTheme(): void` - Switches between dark and light themes

**Usage:**
```typescript
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
  const { darkMode, toggleTheme } = useTheme();
  
  return (
    <div className={darkMode ? 'bg-dark' : 'bg-light'}>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

**Implementation Notes:**
- Theme preference persisted in `localStorage`
- Adds `dark` or `light` class to `document.documentElement` for Tailwind
- Theme changes trigger smooth CSS transitions (300ms)

### Local Component State

For component-specific state (form inputs, UI toggles, local data), standard React `useState` and `useEffect` hooks are used:

```typescript
const [adminMenuOpen, setAdminMenuOpen] = useState(false);
```

### Server State (React Query)

React Query is used for managing server state (data fetching, caching, synchronization):

```typescript
import { useQuery } from 'react-query';

const { data, isLoading, error } = useQuery('products', fetchProducts);
```

Benefits:
- Automatic caching and background refetching
- Built-in loading and error states
- Optimistic updates support
- Request deduplication

## Routing Structure

React Router v7 is used for client-side routing with the `BrowserRouter` strategy.

### Route Configuration

```typescript
<Router>
  <Routes>
    <Route path="/" element={<Welcome />} />
    <Route path="/about" element={<About />} />
    <Route path="/products" element={<Products />} />
    <Route path="/login" element={<Login />} />
    <Route path="/admin/products" element={<AdminProducts />} />
  </Routes>
</Router>
```

### Route Hierarchy

- `/` - Welcome/home page
- `/about` - About page
- `/products` - Public product listing
- `/login` - User login
- `/admin/products` - Admin product management (protected)

### Navigation

Navigation between routes uses the `Link` component:

```typescript
import { Link } from 'react-router-dom';

<Link to="/products">View Products</Link>
```

### Protected Routes

Admin routes check authentication state via `useAuth()`:

```typescript
const { isAdmin } = useAuth();

if (!isAdmin) {
  return <Navigate to="/login" />;
}
```

## API Integration Patterns

### API Configuration

The API client is configured in `src/api/config.ts` with intelligent URL detection:

1. **Runtime Configuration** - Checks `window.RUNTIME_CONFIG.API_URL`
2. **Codespace Detection** - Auto-detects GitHub Codespaces environment
3. **Fallback** - Uses `http://localhost:3000` for local development

### API Structure

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

### Making API Calls

Components use React Query with Axios for API calls:

```typescript
import axios from 'axios';
import { useQuery } from 'react-query';
import { api } from '../api/config';

const fetchProducts = async () => {
  const response = await axios.get(`${api.baseURL}${api.endpoints.products}`);
  return response.data;
};

function Products() {
  const { data, isLoading, error } = useQuery('products', fetchProducts);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading products</div>;
  
  return <ProductList products={data} />;
}
```

### Error Handling

API errors are handled at multiple levels:

1. **React Query Error State** - Captured in query result
2. **Component-Level** - Display user-friendly error messages
3. **Global Error Boundary** - Catch unhandled errors (future enhancement)

## Component Communication

### Parent-Child Communication

**Props Down:**
```typescript
<ProductCard 
  product={product}
  onEdit={handleEdit}
  darkMode={darkMode}
/>
```

**Events Up:**
```typescript
<button onClick={() => onEdit(product.id)}>Edit</button>
```

### Sibling Communication

For sibling components, lift state to common parent or use Context:

```typescript
function Parent() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  return (
    <>
      <ProductList onSelect={setSelectedProduct} />
      <ProductDetail product={selectedProduct} />
    </>
  );
}
```

### Cross-Component Communication

Use Context API for truly global state:
- Authentication status → AuthContext
- Theme preferences → ThemeContext

## Data Flow

```
User Interaction
      ↓
Component Event Handler
      ↓
State Update (useState/Context)
      ↓
Re-render with New State
      ↓
Optional: API Call via React Query
      ↓
Cache Update & Component Re-render
```

## Performance Considerations

### Code Splitting

Currently using single bundle. Future optimization: lazy load routes.

```typescript
// Future enhancement
const AdminProducts = lazy(() => import('./components/admin/AdminProducts'));
```

### Memoization

Use React.memo for expensive component renders:

```typescript
export default React.memo(ProductCard);
```

### React Query Caching

React Query automatically caches API responses:
- Reduces unnecessary network requests
- Provides instant data for repeated queries
- Background refetching keeps data fresh

## TypeScript Integration

### Type Safety

All components use TypeScript for type safety:

```typescript
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
}

interface ProductCardProps {
  product: Product;
  onEdit?: (id: number) => void;
}

function ProductCard({ product, onEdit }: ProductCardProps) {
  // Component implementation
}
```

### Context Types

Context providers have strongly typed values:

```typescript
interface AuthContextType {
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}
```

## Future Architecture Enhancements

Potential improvements for the architecture:

1. **Lazy Loading** - Code split routes for faster initial load
2. **Error Boundaries** - Global error handling for better UX
3. **Service Layer** - Abstract API calls into dedicated services
4. **Form Management** - Integrate React Hook Form or Formik
5. **State Management** - Consider Zustand or Redux for complex state
6. **Testing** - Add comprehensive component and integration tests
7. **Accessibility** - Enhanced ARIA support and keyboard navigation
8. **i18n** - Internationalization support for multiple languages
