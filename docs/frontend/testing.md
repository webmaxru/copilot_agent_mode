# Testing

This guide covers the testing strategy, tools, and patterns for the OctoCAT Supply frontend application.

## Table of Contents

- [Testing Stack](#testing-stack)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Unit Testing](#unit-testing)
- [Component Testing](#component-testing)
- [Integration Testing](#integration-testing)
- [Testing Best Practices](#testing-best-practices)
- [Common Testing Patterns](#common-testing-patterns)

---

## Testing Stack

### Tools and Libraries

The frontend uses the following testing tools:

- **Vitest** - Fast unit test runner (Vite-native, Jest-compatible API)
- **React Testing Library** - Component testing utilities
- **jsdom** - DOM implementation for Node.js environment
- **@testing-library/jest-dom** - Custom matchers for DOM assertions
- **@testing-library/user-event** - User interaction simulation

### Installation

Already included in `package.json`:

```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "jsdom": "^26.0.0",
    "vitest": "^3.1.1"
  }
}
```

### Configuration

**Vitest Configuration:**

Would typically be in `vite.config.ts` or `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

**Setup File (`src/test/setup.ts`):**

```typescript
import '@testing-library/jest-dom';
```

---

## Test Structure

### File Organization

Place test files next to the components they test:

```
src/
├── components/
│   ├── ProductCard.tsx
│   └── ProductCard.test.tsx
├── context/
│   ├── AuthContext.tsx
│   └── AuthContext.test.tsx
└── utils/
    ├── formatting.ts
    └── formatting.test.ts
```

**Alternative:** Use `__tests__` directory:

```
src/
├── components/
│   ├── ProductCard.tsx
│   └── __tests__/
│       └── ProductCard.test.tsx
```

### Test File Naming

- `ComponentName.test.tsx` - Component tests
- `ComponentName.spec.tsx` - Alternative (spec)
- `utils.test.ts` - Utility function tests

---

## Running Tests

### Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- ProductCard.test.tsx

# Run tests matching pattern
npm test -- --grep "ProductCard"
```

### Watch Mode

In watch mode, Vitest provides an interactive menu:

- Press `a` to run all tests
- Press `f` to run only failed tests
- Press `p` to filter by filename pattern
- Press `t` to filter by test name pattern
- Press `q` to quit

---

## Unit Testing

### Testing Utility Functions

**Example: Currency Formatting**

```typescript
// src/utils/formatting.ts
export const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

// src/utils/formatting.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency } from './formatting';

describe('formatCurrency', () => {
  it('formats whole numbers correctly', () => {
    expect(formatCurrency(10)).toBe('$10.00');
  });

  it('formats decimal numbers correctly', () => {
    expect(formatCurrency(10.5)).toBe('$10.50');
  });

  it('rounds to two decimal places', () => {
    expect(formatCurrency(10.999)).toBe('$11.00');
  });

  it('handles zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });
});
```

### Testing Context

**Example: AuthContext**

```typescript
// src/context/AuthContext.test.tsx
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { describe, it, expect } from 'vitest';

describe('AuthContext', () => {
  it('initial state is logged out', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.isAdmin).toBe(false);
  });

  it('logs in user with github.com email as admin', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.login('user@github.com', 'password');
    });

    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.isAdmin).toBe(true);
  });

  it('logs in non-github user as regular user', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.login('user@example.com', 'password');
    });

    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.isAdmin).toBe(false);
  });

  it('logs out user', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.login('user@github.com', 'password');
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.isAdmin).toBe(false);
  });
});
```

---

## Component Testing

### Basic Component Test

```typescript
// src/components/Welcome.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Welcome from './Welcome';

describe('Welcome', () => {
  it('renders welcome heading', () => {
    render(<Welcome />);
    expect(screen.getByRole('heading', { name: /welcome/i })).toBeInTheDocument();
  });

  it('displays call-to-action button', () => {
    render(<Welcome />);
    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
  });
});
```

### Testing with Context

```typescript
// src/components/Navigation.test.tsx
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import Navigation from './Navigation';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          {component}
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Navigation', () => {
  it('renders logo and brand name', () => {
    renderWithProviders(<Navigation />);
    expect(screen.getByAltText('Copilot icon')).toBeInTheDocument();
    expect(screen.getByText('OctoCAT Supply')).toBeInTheDocument();
  });

  it('shows login button when not authenticated', () => {
    renderWithProviders(<Navigation />);
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });
});
```

### Testing User Interactions

```typescript
// src/components/ProductCard.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ProductCard from './ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    productId: 1,
    name: 'Test Product',
    description: 'Test description',
    price: 29.99,
    imgName: 'test.png',
    sku: 'TEST-001',
    unit: 'unit',
    supplierId: 1,
  };

  it('renders product information', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });

  it('increments quantity when plus button clicked', async () => {
    const user = userEvent.setup();
    render(<ProductCard product={mockProduct} />);
    
    const plusButton = screen.getByLabelText(`Increase quantity of ${mockProduct.name}`);
    await user.click(plusButton);
    
    expect(screen.getByLabelText(`Quantity of ${mockProduct.name}`)).toHaveTextContent('1');
  });

  it('decrements quantity when minus button clicked', async () => {
    const user = userEvent.setup();
    render(<ProductCard product={mockProduct} />);
    
    // First increment to 1
    const plusButton = screen.getByLabelText(`Increase quantity of ${mockProduct.name}`);
    await user.click(plusButton);
    
    // Then decrement
    const minusButton = screen.getByLabelText(`Decrease quantity of ${mockProduct.name}`);
    await user.click(minusButton);
    
    expect(screen.getByLabelText(`Quantity of ${mockProduct.name}`)).toHaveTextContent('0');
  });

  it('calls onAddToCart when add to cart button clicked', async () => {
    const user = userEvent.setup();
    const onAddToCart = vi.fn();
    render(<ProductCard product={mockProduct} onAddToCart={onAddToCart} />);
    
    // Increment quantity
    const plusButton = screen.getByLabelText(`Increase quantity of ${mockProduct.name}`);
    await user.click(plusButton);
    
    // Click add to cart
    const addButton = screen.getByRole('button', { name: /add to cart/i });
    await user.click(addButton);
    
    expect(onAddToCart).toHaveBeenCalledWith(mockProduct.productId, 1);
  });
});
```

### Testing Forms

```typescript
// src/components/Login.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Login from './Login';

describe('Login', () => {
  it('submits form with email and password', async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn();
    render(<Login onLogin={onLogin} />);
    
    // Fill in form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    // Submit
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    expect(onLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('shows validation error for empty email', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });
});
```

---

## Integration Testing

### Testing with API Mocking

```typescript
// src/components/Products.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import Products from './Products';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Products', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  beforeEach(() => {
    queryClient.clear();
  });

  it('displays loading state initially', () => {
    mockedAxios.get.mockImplementation(() => new Promise(() => {}));
    render(<Products />, { wrapper });
    
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays products after loading', async () => {
    const mockProducts = [
      { productId: 1, name: 'Product 1', price: 10.99 },
      { productId: 2, name: 'Product 2', price: 20.99 },
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: mockProducts });

    render(<Products />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
    });
  });

  it('displays error message on fetch failure', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

    render(<Products />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch products/i)).toBeInTheDocument();
    });
  });
});
```

---

## Testing Best Practices

### 1. Test Behavior, Not Implementation

❌ **Bad:**
```typescript
it('updates state when button clicked', () => {
  // Testing internal state
  expect(component.state.count).toBe(1);
});
```

✅ **Good:**
```typescript
it('displays incremented count when button clicked', () => {
  // Testing visible output
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

### 2. Use Accessible Queries

Prefer queries in this order:
1. `getByRole` - Most accessible
2. `getByLabelText` - For form elements
3. `getByPlaceholderText` - For inputs
4. `getByText` - For content
5. `getByTestId` - Last resort

❌ **Avoid:**
```typescript
const button = container.querySelector('.submit-button');
```

✅ **Prefer:**
```typescript
const button = screen.getByRole('button', { name: /submit/i });
```

### 3. Don't Test External Libraries

Don't test that React Router or Axios work—they're already tested.

❌ **Bad:**
```typescript
it('React Router navigates correctly', () => {
  // Testing React Router, not your code
});
```

✅ **Good:**
```typescript
it('redirects to login when not authenticated', () => {
  // Testing your auth logic
});
```

### 4. Keep Tests Independent

Each test should be able to run in isolation.

✅ **Good:**
```typescript
describe('Counter', () => {
  beforeEach(() => {
    // Reset state before each test
  });

  it('test 1', () => { /* ... */ });
  it('test 2', () => { /* ... */ });
});
```

### 5. Mock External Dependencies

Mock API calls, timers, and external services:

```typescript
vi.mock('axios');
vi.mock('../api/config', () => ({
  api: { baseURL: 'http://test.com', endpoints: {} },
}));
```

### 6. Use Descriptive Test Names

✅ **Good:**
```typescript
it('displays error message when login fails', () => { });
it('enables submit button when form is valid', () => { });
```

❌ **Bad:**
```typescript
it('works', () => { });
it('test 1', () => { });
```

---

## Common Testing Patterns

### Testing Theme Context

```typescript
it('applies dark mode styles when dark mode enabled', () => {
  const { rerender } = render(
    <ThemeProvider>
      <MyComponent />
    </ThemeProvider>
  );
  
  // Component starts in light mode
  expect(screen.getByTestId('container')).toHaveClass('bg-white');
  
  // Enable dark mode
  act(() => {
    // trigger dark mode
  });
  
  expect(screen.getByTestId('container')).toHaveClass('bg-dark');
});
```

### Testing Loading States

```typescript
it('shows loading spinner while fetching', () => {
  mockedAxios.get.mockImplementation(() => new Promise(() => {})); // Never resolves
  
  render(<Products />);
  
  expect(screen.getByRole('status')).toBeInTheDocument();
  expect(screen.getByLabelText('loading')).toBeInTheDocument();
});
```

### Testing Error States

```typescript
it('displays error message when API call fails', async () => {
  mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
  
  render(<Products />);
  
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

### Testing Conditional Rendering

```typescript
it('shows admin menu only when user is admin', () => {
  const { rerender } = render(<Navigation />);
  
  // Not logged in
  expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
  
  // Log in as admin
  rerender(<Navigation isAdmin={true} />);
  expect(screen.getByText('Admin Panel')).toBeInTheDocument();
});
```

### Testing Async Operations

```typescript
it('updates product list after deletion', async () => {
  const user = userEvent.setup();
  mockedAxios.delete.mockResolvedValueOnce({});
  
  render(<AdminProducts />);
  
  const deleteButton = screen.getByRole('button', { name: /delete/i });
  await user.click(deleteButton);
  
  await waitFor(() => {
    expect(screen.queryByText('Product 1')).not.toBeInTheDocument();
  });
});
```

---

## Coverage Goals

### Target Coverage

- **Statements:** > 80%
- **Branches:** > 75%
- **Functions:** > 80%
- **Lines:** > 80%

### Check Coverage

```bash
npm run test:coverage
```

Generates report in `coverage/` directory.

### Focus Coverage On

1. **Critical paths:** Authentication, data submission
2. **Business logic:** Calculations, validations
3. **Error handling:** Error states, edge cases

### Don't Stress Coverage For

- UI-only components without logic
- Simple presentational components
- Third-party library wrappers

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## Next Steps

To implement testing in this project:

1. Add test setup file: `src/test/setup.ts`
2. Configure Vitest in `vite.config.ts`
3. Write tests for critical components (AuthContext, Products, Navigation)
4. Set up CI/CD to run tests on every PR
5. Add coverage thresholds to fail build if coverage drops
