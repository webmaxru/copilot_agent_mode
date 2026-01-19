# Component Documentation

This guide documents the key components in the OctoCAT Supply frontend application.

## Table of Contents

- [Context Providers](#context-providers)
  - [AuthContext](#authcontext)
  - [ThemeContext](#themecontext)
- [Layout Components](#layout-components)
  - [Navigation](#navigation)
  - [Footer](#footer)
- [Page Components](#page-components)
  - [Welcome](#welcome)
  - [About](#about)
  - [Login](#login)
- [Entity Components](#entity-components)
  - [Products](#products)
  - [ProductForm](#productform)
- [Admin Components](#admin-components)
  - [AdminProducts](#adminproducts)

---

## Context Providers

### AuthContext

**Location:** `src/context/AuthContext.tsx`

**Purpose:** Manages authentication state and provides authentication methods across the application.

**Context Value:**

```typescript
interface AuthContextType {
  isLoggedIn: boolean;    // Whether user is authenticated
  isAdmin: boolean;       // Whether user has admin privileges
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}
```

**Usage:**

```typescript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { isLoggedIn, isAdmin, login, logout } = useAuth();
  
  if (!isLoggedIn) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      {isAdmin && <AdminPanel />}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

**Implementation Notes:**
- Currently uses mock authentication (client-side only)
- Admin access granted to `@github.com` email addresses
- State not persisted across page refreshes
- Should be wrapped at the app root level

**Provider Usage:**

```typescript
<AuthProvider>
  <App />
</AuthProvider>
```

---

### ThemeContext

**Location:** `src/context/ThemeContext.tsx`

**Purpose:** Manages dark/light theme preference with localStorage persistence.

**Context Value:**

```typescript
interface ThemeContextType {
  darkMode: boolean;      // Current theme mode (true = dark, false = light)
  toggleTheme: () => void; // Function to switch themes
}
```

**Usage:**

```typescript
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
  const { darkMode, toggleTheme } = useTheme();
  
  return (
    <div className={darkMode ? 'bg-dark text-light' : 'bg-white text-gray-800'}>
      <button onClick={toggleTheme}>
        {darkMode ? '☀️ Light' : '🌙 Dark'}
      </button>
    </div>
  );
}
```

**Features:**
- Persists preference in `localStorage` (key: `'theme'`)
- Adds `'dark'` or `'light'` class to `document.documentElement`
- Smooth transitions between themes (300ms)
- Initializes from localStorage on mount

**Provider Usage:**

```typescript
<ThemeProvider>
  <App />
</ThemeProvider>
```

---

## Layout Components

### Navigation

**Location:** `src/components/Navigation.tsx`

**Purpose:** Top navigation bar with branding, links, theme toggle, and auth controls.

**Props:** None (uses contexts)

**Features:**
- Responsive design (mobile hamburger menu)
- Theme toggle button
- Conditional rendering based on auth state
- Admin menu for authenticated admins
- Sticky positioning with backdrop blur

**Key Elements:**
- Logo and branding
- Main navigation links (Home, Products, About)
- Theme toggle
- Login/Logout button
- Admin dropdown (when authenticated as admin)

**Usage:**

```typescript
<Navigation />
```

**Responsive Behavior:**
- Desktop (≥768px): Full horizontal navigation
- Mobile (<768px): Hamburger menu (if implemented)

---

### Footer

**Location:** `src/components/Footer.tsx`

**Purpose:** Site-wide footer with links and copyright information.

**Props:** None (uses ThemeContext)

**Features:**
- Adapts to current theme
- Contains company information
- Social/contact links

**Usage:**

```typescript
<Footer />
```

---

## Page Components

### Welcome

**Location:** `src/components/Welcome.tsx`

**Purpose:** Landing page showcasing the application.

**Props:** None

**Features:**
- Hero section
- Feature highlights
- Call-to-action buttons
- Theme-aware styling

**Usage:**

```typescript
<Route path="/" element={<Welcome />} />
```

---

### About

**Location:** `src/components/About.tsx`

**Purpose:** About page with company/project information.

**Props:** None

**Features:**
- Company description
- Mission statement
- Team information (if applicable)
- Theme-aware styling

**Usage:**

```typescript
<Route path="/about" element={<About />} />
```

---

### Login

**Location:** `src/components/Login.tsx`

**Purpose:** User authentication page.

**Props:** None (uses AuthContext)

**Features:**
- Email and password inputs
- Form validation
- Calls `login()` from AuthContext
- Redirects after successful login

**State:**
- `email: string`
- `password: string`

**Form Handling:**

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  await login(email, password);
  // Handle redirect
};
```

**Usage:**

```typescript
<Route path="/login" element={<Login />} />
```

---

## Entity Components

### Products

**Location:** `src/components/entity/product/Products.tsx`

**Purpose:** Public product listing page with search and cart functionality.

**Props:** None (fetches data internally)

**Features:**
- Product grid with responsive layout
- Search/filter functionality
- Quantity selector for each product
- "Add to Cart" functionality (currently placeholder)
- Product detail modal
- Loading and error states
- Theme-aware styling

**State:**

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

const [quantities, setQuantities] = useState<Record<number, number>>({});
const [searchTerm, setSearchTerm] = useState('');
const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
const [showModal, setShowModal] = useState(false);
```

**Data Fetching:**

Uses React Query for data fetching:

```typescript
// React Query v3 syntax (current version in this project)
const { data: products, isLoading, error } = useQuery('products', fetchProducts);

// Note: For React Query v4+, use object syntax:
// const { data, isLoading, error } = useQuery({
//   queryKey: ['products'],
//   queryFn: fetchProducts
// });
```

**Key Functions:**

- `handleQuantityChange(productId, change)` - Adjust product quantity
- `handleAddToCart(productId)` - Add product to cart (placeholder)
- `handleProductClick(product)` - Open product detail modal

**Usage:**

```typescript
<Route path="/products" element={<Products />} />
```

**Responsive Grid:**
- 1 column on mobile (sm: <640px)
- 2 columns on tablet (sm: ≥640px)
- 3 columns on medium screens (md: ≥768px)
- 4 columns on large screens (lg: ≥1024px)

---

### ProductForm

**Location:** `src/components/entity/product/ProductForm.tsx`

**Purpose:** Modal form for creating/editing products.

**Props:**

```typescript
interface ProductFormProps {
  product?: Product;           // If provided, form is in edit mode
  suppliers: Supplier[];       // List of suppliers for dropdown
  onClose: () => void;         // Callback to close the form
  onSave: () => void;          // Callback after successful save
}
```

**Features:**
- Create or update product
- All product fields editable
- Supplier selection dropdown
- Discount percentage input
- Form validation
- Modal overlay
- Theme-aware styling

**Form Fields:**
- Name (text, required)
- Description (textarea, required)
- Price (number, required, min: 0, step: 0.01)
- SKU (text, required)
- Unit (text, required)
- Image Name (text, required)
- Supplier (select, required)
- Discount % (number, optional, 0-100)

**Form Submission:**

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (product) {
    // Update existing product
    await axios.put(`${api.baseURL}${api.endpoints.products}/${product.productId}`, formData);
  } else {
    // Create new product
    await axios.post(`${api.baseURL}${api.endpoints.products}`, formData);
  }
  onSave();
  onClose();
};
```

**Usage:**

```typescript
<ProductForm
  product={editingProduct}
  suppliers={suppliers}
  onClose={() => setShowForm(false)}
  onSave={fetchProducts}
/>
```

---

## Admin Components

### AdminProducts

**Location:** `src/components/admin/AdminProducts.tsx`

**Purpose:** Admin interface for managing products (CRUD operations).

**Props:** None (uses AuthContext, checks `isAdmin`)

**Features:**
- **Protected Route** - Redirects if not admin
- Product list in table format
- Sortable columns (name, supplier, price, SKU, unit)
- Create, update, delete operations
- Integrates ProductForm for creation/editing
- Fetches supplier details for display
- Theme-aware styling

**State:**

```typescript
const [products, setProducts] = useState<Product[]>([]);
const [suppliers, setSuppliers] = useState<Supplier[]>([]);
const [editingProduct, setEditingProduct] = useState<Product | undefined>();
const [showForm, setShowForm] = useState(false);
const [sortField, setSortField] = useState<SortField>('name');
const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
```

**Key Functions:**

- `fetchProducts()` - Retrieves all products with supplier details
- `fetchSuppliers()` - Retrieves all suppliers
- `handleSort(field)` - Toggles column sorting
- Delete handler - Inline with confirmation

**Sorting:**

Click column headers to sort:
- First click: ascending
- Second click: descending
- Visual indicator: `↑` (asc), `↓` (desc), `↕` (unsorted)

**Protection:**

```typescript
if (!isAdmin) {
  return <Navigate to="/" replace />;
}
```

**Usage:**

```typescript
<Route path="/admin/products" element={<AdminProducts />} />
```

**Table Columns:**
- Name (sortable)
- Supplier (sortable)
- Price (sortable)
- SKU (sortable)
- Unit (sortable)
- Discount (display only)
- Description (truncated)
- Actions (Edit/Delete buttons)

**CRUD Operations:**

**Create:**
```typescript
<button onClick={() => {
  setEditingProduct(undefined);
  setShowForm(true);
}}>
  Add New Product
</button>
```

**Update:**
```typescript
<button onClick={() => {
  setEditingProduct(product);
  setShowForm(true);
}}>
  Edit
</button>
```

**Delete:**
```typescript
<button onClick={async () => {
  if (window.confirm('Are you sure?')) {
    await axios.delete(`${api.baseURL}${api.endpoints.products}/${product.productId}`);
    await fetchProducts();
  }
}}>
  Delete
</button>
```

---

## Component Best Practices

### General Guidelines

1. **Use TypeScript Interfaces**: Define props and state types explicitly
2. **Theme Awareness**: Use `useTheme()` for consistent theming
3. **Accessibility**: Include ARIA labels where appropriate
4. **Responsive Design**: Use Tailwind's responsive classes
5. **Error Handling**: Display user-friendly error messages
6. **Loading States**: Show loading indicators during async operations

### Example Component Template

```typescript
import { useTheme } from '../context/ThemeContext';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export default function MyComponent({ title, onAction }: MyComponentProps) {
  const { darkMode } = useTheme();
  
  return (
    <div className={`p-4 ${darkMode ? 'bg-dark text-light' : 'bg-white text-gray-800'}`}>
      <h2 className="text-2xl font-bold">{title}</h2>
      <button 
        onClick={onAction}
        className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-accent"
      >
        Action
      </button>
    </div>
  );
}
```

### Common Patterns

**Loading State:**
```typescript
if (isLoading) {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}
```

**Error State:**
```typescript
if (error) {
  return (
    <div className="text-red-500 text-center">
      Failed to load data. Please try again.
    </div>
  );
}
```

**Empty State:**
```typescript
if (!data || data.length === 0) {
  return (
    <div className="text-center py-20">
      <p className="text-gray-500">No items found</p>
    </div>
  );
}
```

---

## Adding New Components

When creating a new component:

1. **Create the file** in the appropriate directory:
   - Layout components → `src/components/`
   - Entity components → `src/components/entity/[entity-name]/`
   - Admin components → `src/components/admin/`

2. **Define TypeScript interfaces** for props and local types

3. **Use hooks for state and context**:
   ```typescript
   const { darkMode } = useTheme();
   const [localState, setLocalState] = useState(initialValue);
   ```

4. **Follow naming conventions**:
   - Component file: `PascalCase.tsx`
   - Variables/functions: `camelCase`
   - Constants: `UPPER_SNAKE_CASE`

5. **Include accessibility attributes**:
   - `aria-label` for buttons/inputs without visible labels
   - `role` for semantic regions
   - Proper heading hierarchy

6. **Add to routing** (if it's a page component):
   ```typescript
   <Route path="/my-route" element={<MyComponent />} />
   ```

7. **Update documentation** - Add entry to this file!
