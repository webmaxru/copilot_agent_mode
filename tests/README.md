# E2E Tests for OctoCAT Supply

This directory contains end-to-end tests for the OctoCAT Supply shopping cart functionality using Playwright.

## Setup

### Install Dependencies

First, install Playwright and its dependencies:

```bash
npm install -D @playwright/test
npx playwright install
```

### Install Browsers

Install the browsers needed for testing:

```bash
npx playwright install chromium firefox webkit
```

## Running Tests

### Run all tests

```bash
npx playwright test
```

### Run tests in headed mode (visible browser)

```bash
npx playwright test --headed
```

### Run tests in a specific browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run a specific test file

```bash
npx playwright test tests/e2e/cart.spec.ts
```

### Run tests in UI mode (interactive)

```bash
npx playwright test --ui
```

### Run tests in debug mode

```bash
npx playwright test --debug
```

## Test Structure

### Cart Tests (`e2e/cart.spec.ts`)

Comprehensive tests for the shopping cart feature based on `features/cart.feature`:

- **Cart Icon & Badge**: Visibility and count updates
- **Empty Cart State**: Display and navigation
- **Cart with Items**: Single and multiple items display
- **Discount Handling**: Price calculations with discounts
- **Quantity Management**: Increment, decrement, and manual input
- **Item Removal**: Single and batch removal
- **Order Summary**: Subtotal, shipping, and total calculations
- **Cart Persistence**: localStorage integration
- **Theme Support**: Dark and light mode
- **Navigation**: Cart icon and browse products
- **Mobile Responsiveness**: Adaptive layouts
- **Edge Cases**: Quantity consolidation, images, decimal precision

## Helper Functions

The `helpers.ts` file provides utility functions:

- `clearCart()`: Clear cart from localStorage
- `addItemToCart()`: Add item to cart
- `setCartItems()`: Set cart items directly
- `getCartBadgeCount()`: Get current badge count
- `enableDarkMode()` / `disableDarkMode()`: Toggle theme
- `calculateSubtotal()`, `calculateShipping()`, `calculateTotal()`: Price calculations

## Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

## Prerequisites

Before running tests, ensure:

1. The frontend development server is running on `http://localhost:5137`
2. The cart functionality is implemented in the frontend
3. localStorage is accessible for cart persistence

## Configuration

Test configuration is in `playwright.config.ts` at the root:

- **Base URL**: `http://localhost:5137`
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Retries**: 2 on CI, 0 locally
- **Screenshots**: On failure
- **Traces**: On first retry

## CI/CD Integration

The tests are configured to run in CI environments with:

- Parallel execution disabled on CI
- 2 retries for flaky tests
- HTML reporter for test results
- Trace collection for debugging failures

## Best Practices

1. **Keep tests independent**: Each test clears cart in `beforeEach`
2. **Use helper functions**: Reusable utilities in `helpers.ts`
3. **Wait for updates**: Use `waitForTimeout()` after cart actions
4. **Check visibility**: Verify elements are visible before interacting
5. **Use semantic selectors**: Prefer `getByRole`, `getByText` over CSS selectors

## Troubleshooting

### Tests failing with "Connection refused"

Ensure the frontend dev server is running:

```bash
npm run dev --workspace=frontend
```

### Tests timeout

Increase timeout in `playwright.config.ts`:

```typescript
use: {
  timeout: 30000, // 30 seconds
}
```

### Screenshots not appearing

Screenshots are only taken on failure. To take screenshots always:

```typescript
use: {
  screenshot: 'on',
}
```

## Future Enhancements

- [ ] Add visual regression tests
- [ ] Add API mocking for product data
- [ ] Add accessibility tests
- [ ] Add performance tests
- [ ] Add cross-browser compatibility tests
- [ ] Integrate with CI/CD pipeline
