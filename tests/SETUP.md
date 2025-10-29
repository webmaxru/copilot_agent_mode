# Playwright E2E Test Setup Guide

This guide will help you set up and run the Playwright end-to-end tests for the OctoCAT Supply shopping cart.

## Quick Start

### 1. Install Playwright

From the root of the project:

```bash
npm install
```

This will install `@playwright/test` as defined in the root `package.json`.

### 2. Install Playwright Browsers

```bash
npx playwright install
```

Or install specific browsers:

```bash
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit
```

### 3. Start the Application

Before running tests, ensure the frontend is running:

```bash
# In one terminal
npm run dev:frontend
```

The app should be accessible at `http://localhost:5137`.

### 4. Run the Tests

```bash
# Run all tests
npm run test:e2e

# Run with UI (recommended for development)
npm run test:e2e:ui

# Run in headed mode (see the browser)
npm run test:e2e:headed

# Run in debug mode
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

## Test Coverage

The `tests/e2e/cart.spec.ts` file includes 22 test scenarios covering:

### ✅ Cart Icon & Badge (4 tests)
- Cart icon visibility
- Initial badge state
- Badge updates when items added
- Badge with multiple products

### ✅ Empty Cart State (1 test)
- Empty cart message and UI elements

### ✅ Cart with Items (2 tests)
- Single item display
- Multiple items display

### ✅ Discount Handling (1 test)
- Discounted price calculations
- Discount badge display

### ✅ Quantity Management (2 tests)
- Increment quantity
- Decrement quantity

### ✅ Remove Item (2 tests)
- Remove single item
- Remove last item (show empty cart)

### ✅ Order Summary (4 tests)
- Subtotal calculation
- Shipping cost (below threshold)
- Free shipping (above threshold)
- Free shipping message

### ✅ Cart Persistence (2 tests)
- Persist in localStorage
- Load from localStorage

### ✅ Theme Support (2 tests)
- Dark mode
- Light mode

### ✅ Navigation (2 tests)
- Navigate to cart
- Continue shopping

### ✅ Mobile Responsiveness (1 test)
- Adaptive layout

### ✅ Edge Cases (3 tests)
- Quantity consolidation
- Product images
- Decimal precision

## File Structure

```
tests/
├── .gitignore           # Ignore test artifacts
├── README.md            # General testing documentation
├── SETUP.md             # This file - setup instructions
└── e2e/
    ├── cart.spec.ts     # Main cart test suite
    └── helpers.ts       # Test helper functions
```

## Helper Functions Available

The `helpers.ts` file provides:

- `clearCart(page)` - Clear cart
- `addItemToCart(page, item, quantity)` - Add item
- `setCartItems(page, items)` - Set multiple items
- `getCartBadgeCount(page)` - Get badge count
- `enableDarkMode(page)` / `disableDarkMode(page)` - Toggle theme
- Price calculation utilities

## Configuration

Edit `playwright.config.ts` to customize:

- Base URL (currently `http://localhost:5137`)
- Browsers to test
- Timeouts and retries
- Screenshots and traces
- Reporter options

## Debugging Failed Tests

### View Screenshots

Failed tests automatically capture screenshots in:
```
test-results/
```

### View Traces

Traces are captured on first retry:
```bash
npx playwright show-trace test-results/.../trace.zip
```

### Run Single Test

```bash
npx playwright test tests/e2e/cart.spec.ts -g "should display cart icon"
```

### Use UI Mode

Best for debugging:
```bash
npm run test:e2e:ui
```

## CI/CD Integration

The tests are configured for CI with:

- `forbidOnly`: Prevents `test.only` in CI
- `retries`: 2 retries on CI
- `workers`: Sequential execution on CI
- HTML reporter for results

## Troubleshooting

### "Cannot find module '@playwright/test'"

Run:
```bash
npm install
```

### "browserType.launch: Executable doesn't exist"

Run:
```bash
npx playwright install
```

### Tests fail with connection errors

Ensure the frontend is running:
```bash
npm run dev:frontend
```

And accessible at `http://localhost:5137`

### Tests are flaky

Increase timeouts in `playwright.config.ts`:
```typescript
use: {
  timeout: 30000,
}
```

Or add waits in tests:
```typescript
await page.waitForTimeout(500);
```

## Next Steps

1. Run tests locally to verify setup
2. Review test results in UI mode
3. Add tests to CI/CD pipeline
4. Extend tests for other features
5. Add visual regression tests
6. Add accessibility tests

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [CI/CD Guide](https://playwright.dev/docs/ci)
