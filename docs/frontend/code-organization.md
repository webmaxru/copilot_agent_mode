# Code Organization

This guide explains the folder structure, naming conventions, and best practices for organizing code in the OctoCAT Supply frontend.

## Table of Contents

- [Directory Structure](#directory-structure)
- [File Naming Conventions](#file-naming-conventions)
- [Component Organization](#component-organization)
- [State Management](#state-management)
- [Utilities and Helpers](#utilities-and-helpers)
- [Assets Management](#assets-management)
- [Type Definitions](#type-definitions)
- [Best Practices for New Features](#best-practices-for-new-features)

---

## Directory Structure

### Overview

```
frontend/
├── public/              # Static assets served directly
│   ├── copilot.png      # Brand logos
│   ├── hero-cat.png     # Hero images
│   └── *.png            # Product images
├── src/                 # Source code
│   ├── api/             # API configuration
│   │   └── config.ts    # Base URL and endpoint definitions
│   ├── assets/          # Imported assets (images, fonts)
│   ├── components/      # React components
│   │   ├── admin/       # Admin-specific components
│   │   ├── entity/      # Domain entity components
│   │   │   └── product/ # Product-related components
│   │   ├── About.tsx
│   │   ├── Footer.tsx
│   │   ├── Login.tsx
│   │   ├── Navigation.tsx
│   │   └── Welcome.tsx
│   ├── context/         # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   ├── themeContextUtils.tsx
│   │   └── useTheme.tsx
│   ├── App.tsx          # Root component with routing
│   ├── main.tsx         # Application entry point
│   ├── index.css        # Global styles
│   └── vite-env.d.ts    # TypeScript type declarations
├── .gitignore
├── Dockerfile
├── eslint.config.js
├── index.html           # HTML entry point
├── package.json
├── postcss.config.js
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts       # Vite configuration
```

### Key Directories Explained

**`public/`**
- Static assets served at root URL
- Not processed by Vite
- Use for: logos, favicons, product images
- Access: `/filename.png` (no `/public` prefix)

**`src/`**
- All TypeScript/TSX source code
- Processed and bundled by Vite

**`src/api/`**
- API client configuration
- Endpoint definitions
- Base URL detection logic

**`src/assets/`**
- Assets imported in code (currently unused, but available)
- Use for: fonts, icons, images that need processing
- Access: `import logo from './assets/logo.svg'`

**`src/components/`**
- React components
- Organized by feature/entity
- Includes layout and page components

**`src/context/`**
- React Context providers
- Global state management
- Theme and authentication

---

## File Naming Conventions

### Components

**Format:** `PascalCase.tsx`

```
Welcome.tsx          ✅ Correct
Navigation.tsx       ✅ Correct
ProductCard.tsx      ✅ Correct
product-card.tsx     ❌ Incorrect
productCard.tsx      ❌ Incorrect
```

### Utilities and Helpers

**Format:** `camelCase.ts`

```
formatting.ts        ✅ Correct
apiHelpers.ts        ✅ Correct
dateUtils.ts         ✅ Correct
Formatting.ts        ❌ Incorrect (use PascalCase only for components)
```

### Types

**Format:** `PascalCase.ts` or `camelCase.types.ts`

```
types.ts             ✅ Correct (if exporting multiple types)
Product.ts           ✅ Correct (if single type/interface)
product.types.ts     ✅ Correct
```

### Tests

**Format:** `ComponentName.test.tsx` or `utilName.test.ts`

```
Welcome.test.tsx     ✅ Correct
formatting.test.ts   ✅ Correct
Welcome.spec.tsx     ✅ Alternative
```

### Configuration Files

**Format:** Lowercase with dots/dashes

```
vite.config.ts       ✅ Correct
tailwind.config.js   ✅ Correct
.eslintrc            ✅ Correct
```

---

## Component Organization

### Organizing by Feature/Entity

Group related components together:

```
components/
├── entity/
│   ├── product/
│   │   ├── Products.tsx         # List view
│   │   ├── ProductCard.tsx      # Individual card
│   │   ├── ProductForm.tsx      # Create/edit form
│   │   └── ProductDetail.tsx    # Detail view
│   ├── order/
│   │   ├── Orders.tsx
│   │   └── OrderForm.tsx
│   └── supplier/
│       ├── Suppliers.tsx
│       └── SupplierForm.tsx
├── admin/
│   ├── AdminProducts.tsx
│   ├── AdminOrders.tsx
│   └── AdminDashboard.tsx
├── About.tsx                     # Top-level pages
├── Welcome.tsx
└── Login.tsx
```

### Component Structure

**Basic Component Template:**

```typescript
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

// 1. Type definitions
interface MyComponentProps {
  title: string;
  onAction: () => void;
}

// 2. Component definition
export default function MyComponent({ title, onAction }: MyComponentProps) {
  // 3. Hooks (context, state, effects)
  const { darkMode } = useTheme();
  const [count, setCount] = useState(0);

  // 4. Event handlers
  const handleClick = () => {
    setCount(count + 1);
    onAction();
  };

  // 5. Render logic
  return (
    <div className={darkMode ? 'bg-dark' : 'bg-white'}>
      <h2>{title}</h2>
      <button onClick={handleClick}>Count: {count}</button>
    </div>
  );
}
```

### Component File Organization

**Order within file:**

1. Imports (React, third-party, local)
2. Type/Interface definitions
3. Constants
4. Component definition
5. Export default

**Example:**

```typescript
// 1. Imports
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useQuery } from 'react-query';
import { api } from '../../api/config';
import { useTheme } from '../../context/ThemeContext';

// 2. Types
interface Product {
  productId: number;
  name: string;
  price: number;
}

// 3. Constants
const DEFAULT_SORT = 'name';

// 4. Component
export default function Products() {
  // Component implementation
}
```

---

## State Management

### Local State

Use `useState` for component-specific state:

```typescript
const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useState({ name: '', email: '' });
```

**When to use:**
- UI state (modals, dropdowns, toggles)
- Form inputs
- Temporary data

### Context State

Use Context for state shared across multiple components:

```typescript
// AuthContext for authentication state
const { isLoggedIn, isAdmin } = useAuth();

// ThemeContext for theme preferences
const { darkMode, toggleTheme } = useTheme();
```

**When to use:**
- Authentication state
- Theme preferences
- User settings
- Language/locale

### Server State (React Query)

Use React Query for server data:

```typescript
const { data, isLoading, error } = useQuery('products', fetchProducts);
```

**When to use:**
- Fetching from API
- Cached server data
- Background synchronization

### Creating New Context

**Template:**

```typescript
// src/context/MyContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface MyContextType {
  value: string;
  updateValue: (newValue: string) => void;
}

const MyContext = createContext<MyContextType | null>(null);

export function MyProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState('');

  const updateValue = (newValue: string) => {
    setValue(newValue);
  };

  return (
    <MyContext.Provider value={{ value, updateValue }}>
      {children}
    </MyContext.Provider>
  );
}

export function useMyContext() {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error('useMyContext must be used within MyProvider');
  }
  return context;
}
```

---

## Utilities and Helpers

### Creating Utility Functions

Place in `src/utils/` (create directory if needed):

```
src/
└── utils/
    ├── formatting.ts       # Currency, date formatting
    ├── validation.ts       # Form validation
    ├── api.ts             # API helpers
    └── storage.ts         # localStorage helpers
```

**Example: Formatting Utilities**

```typescript
// src/utils/formatting.ts

export const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};
```

**Usage:**

```typescript
import { formatCurrency, formatDate } from '../utils/formatting';

<div>
  <p>{formatCurrency(product.price)}</p>
  <p>{formatDate(order.createdAt)}</p>
</div>
```

---

## Assets Management

### Public Assets

Place in `public/` directory:

```
public/
├── copilot.png          # Brand logo
├── hero-cat.png         # Hero image
├── product-1.png        # Product images
├── product-2.png
└── favicon.ico
```

**Access in code:**

```typescript
<img src="/copilot.png" alt="Logo" />
<img src={`/${product.imgName}`} alt={product.name} />
```

### Imported Assets

Place in `src/assets/` (if need processing):

```
src/
└── assets/
    ├── logo.svg
    └── icon-cart.svg
```

**Access in code:**

```typescript
import logo from './assets/logo.svg';

<img src={logo} alt="Logo" />
```

### When to Use Each

**Use `public/`:**
- Assets referenced by name in data (e.g., product images)
- Favicons, manifests
- Large images that don't need optimization

**Use `src/assets/`:**
- Icons imported in code
- Assets needing optimization
- SVGs used as React components

---

## Type Definitions

### Component Props

Define interfaces inline or in separate file:

```typescript
// Inline (for single component)
interface ProductCardProps {
  product: Product;
  onEdit?: (id: number) => void;
  darkMode: boolean;
}

export default function ProductCard({ product, onEdit, darkMode }: ProductCardProps) {
  // Component
}
```

### Shared Types

Create `src/types/` directory for shared types:

```typescript
// src/types/product.ts
export interface Product {
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

// src/types/supplier.ts
export interface Supplier {
  supplierId: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
}

// src/types/index.ts
export * from './product';
export * from './supplier';
```

**Usage:**

```typescript
import { Product, Supplier } from '../types';
```

### API Response Types

Match backend API responses:

```typescript
// src/types/api.ts
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

---

## Best Practices for New Features

### 1. Plan Component Structure

Before coding, plan:
- What components are needed?
- How will they be organized?
- What state is local vs. shared?

### 2. Start with Types

Define TypeScript interfaces first:

```typescript
// 1. Define data types
interface Order {
  orderId: number;
  branchId: number;
  orderDate: Date;
  totalAmount: number;
}

// 2. Define component props
interface OrderListProps {
  orders: Order[];
  onOrderClick: (id: number) => void;
}

// 3. Build component
export default function OrderList({ orders, onOrderClick }: OrderListProps) {
  // Component implementation
}
```

### 3. Create Reusable Components

Extract repeated UI into components:

```typescript
// Instead of repeating button styles:
<button className="px-4 py-2 bg-primary text-white rounded">Action</button>

// Create Button component:
<Button variant="primary">Action</Button>
```

### 4. Organize by Feature

Group related files:

```
components/
└── entity/
    └── order/
        ├── Orders.tsx          # List view
        ├── OrderCard.tsx       # Card component
        ├── OrderForm.tsx       # Create/edit form
        ├── OrderDetail.tsx     # Detail view
        └── orderHelpers.ts     # Order-specific utilities
```

### 5. Follow Existing Patterns

Study existing components for:
- How theme context is used
- How API calls are made
- How errors are handled
- How loading states are shown

### 6. Add Documentation

Document complex components:

```typescript
/**
 * ProductCard displays a product with image, details, and quantity selector.
 * 
 * @param product - Product data to display
 * @param onAddToCart - Callback when user adds to cart
 * @param darkMode - Whether dark mode is enabled
 * 
 * @example
 * <ProductCard
 *   product={product}
 *   onAddToCart={(id, qty) => console.log(id, qty)}
 *   darkMode={true}
 * />
 */
export default function ProductCard({ ... }: ProductCardProps) {
  // Component
}
```

### 7. Keep Components Small

**Guidelines:**
- Single responsibility
- < 200 lines of code (ideal: < 150)
- Extract large JSX blocks into sub-components
- Extract complex logic into hooks or utilities

### 8. Write Tests

Add tests alongside components:

```
components/
└── entity/
    └── order/
        ├── Orders.tsx
        ├── Orders.test.tsx      # Tests
        ├── OrderForm.tsx
        └── OrderForm.test.tsx
```

---

## Example: Adding a New Feature

### Scenario: Add Supplier Management

**1. Plan Structure:**

```
components/
└── entity/
    └── supplier/
        ├── Suppliers.tsx        # List page
        ├── SupplierCard.tsx     # Display card
        ├── SupplierForm.tsx     # Create/edit form
        └── SupplierDetail.tsx   # Detail view
```

**2. Define Types:**

```typescript
// src/types/supplier.ts
export interface Supplier {
  supplierId: number;
  name: string;
  description: string;
  contactPerson: string;
  email: string;
  phone: string;
}
```

**3. Create API Functions:**

```typescript
// src/api/suppliers.ts
import axios from 'axios';
import { api } from './config';
import { Supplier } from '../types';

export const supplierApi = {
  getAll: () => axios.get<Supplier[]>(`${api.baseURL}${api.endpoints.suppliers}`),
  getById: (id: number) => axios.get<Supplier>(`${api.baseURL}${api.endpoints.suppliers}/${id}`),
  create: (data: Omit<Supplier, 'supplierId'>) => 
    axios.post(`${api.baseURL}${api.endpoints.suppliers}`, data),
  update: (id: number, data: Partial<Supplier>) => 
    axios.put(`${api.baseURL}${api.endpoints.suppliers}/${id}`, data),
  delete: (id: number) => 
    axios.delete(`${api.baseURL}${api.endpoints.suppliers}/${id}`),
};
```

**4. Build Components:**

```typescript
// src/components/entity/supplier/Suppliers.tsx
import { useQuery } from 'react-query';
import { supplierApi } from '../../../api/suppliers';
import SupplierCard from './SupplierCard';

export default function Suppliers() {
  const { data: suppliers, isLoading, error } = useQuery(
    'suppliers',
    () => supplierApi.getAll().then(res => res.data)
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading suppliers</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {suppliers?.map(supplier => (
        <SupplierCard key={supplier.supplierId} supplier={supplier} />
      ))}
    </div>
  );
}
```

**5. Add Route:**

```typescript
// src/App.tsx
<Route path="/suppliers" element={<Suppliers />} />
```

**6. Add Navigation Link:**

```typescript
// src/components/Navigation.tsx
<Link to="/suppliers">Suppliers</Link>
```

**7. Write Tests:**

```typescript
// src/components/entity/supplier/Suppliers.test.tsx
import { render, screen } from '@testing-library/react';
import Suppliers from './Suppliers';

describe('Suppliers', () => {
  it('renders supplier list', async () => {
    render(<Suppliers />);
    // Test implementation
  });
});
```

---

## Code Quality Checklist

Before submitting code:

- [ ] TypeScript types defined
- [ ] Component follows naming conventions
- [ ] Theme context integrated (darkMode support)
- [ ] Responsive design implemented
- [ ] Error handling in place
- [ ] Loading states handled
- [ ] Accessibility attributes added
- [ ] No console errors or warnings
- [ ] Linter passes (`npm run lint`)
- [ ] Tests written and passing
- [ ] Documentation updated (if needed)

---

## Resources

- [React Best Practices](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Project README](../../README.md)
- [Architecture Documentation](./architecture.md)
