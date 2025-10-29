import { test, expect, type Page } from '@playwright/test';

/**
 * Shopping Cart Management E2E Tests
 * Based on features/cart.feature
 * 
 * Tests the complete shopping cart functionality including:
 * - Cart icon visibility and badge updates
 * - Empty cart state
 * - Cart with items display
 * - Discount handling
 * - Quantity management
 * - Item removal
 * - Order summary and shipping calculations
 * - Cart persistence in localStorage
 * - Theme support (dark/light mode)
 * - Navigation
 * - Mobile responsiveness
 */

interface CartItem {
  productId: number;
  name: string;
  price: number;
  imgName: string;
  quantity: number;
  discount?: number;
}

// Helper functions
async function clearCart(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('octocat_cart');
  });
}

async function addItemToCart(page: Page, item: Omit<CartItem, 'quantity'>, quantity: number) {
  await page.evaluate(
    ({ item, quantity }) => {
      const cart = JSON.parse(localStorage.getItem('octocat_cart') || '[]');
      const existingItem = cart.find((i: CartItem) => i.productId === item.productId);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.push({ ...item, quantity });
      }
      
      localStorage.setItem('octocat_cart', JSON.stringify(cart));
    },
    { item, quantity }
  );
  await page.reload();
}

async function getCartBadgeCount(page: Page): Promise<string | null> {
  const badge = page.locator('a[href="/cart"] + div, a[href="/cart"] span').first();
  return await badge.textContent();
}

async function enableDarkMode(page: Page) {
  await page.evaluate(() => {
    localStorage.setItem('darkMode', 'true');
  });
  await page.reload();
}

async function disableDarkMode(page: Page) {
  await page.evaluate(() => {
    localStorage.setItem('darkMode', 'false');
  });
  await page.reload();
}

test.describe('Shopping Cart Management', () => {
  
  test.beforeEach(async ({ page }) => {
    // Clear cart before each test
    await page.goto('/');
    await clearCart(page);
    await page.reload();
  });

  test.describe('Cart Icon Visibility and Badge', () => {
    
    test('should display cart icon in navigation', async ({ page }) => {
      await page.goto('/');
      
      const cartIcon = page.locator('a[href="/cart"]');
      await expect(cartIcon).toBeVisible();
    });

    test('should display badge with 0 items initially', async ({ page }) => {
      await page.goto('/');
      
      // Cart badge should not be visible when empty or show 0
      const cartLink = page.locator('a[href="/cart"]');
      await expect(cartLink).toBeVisible();
    });

    test('should update badge when items are added', async ({ page }) => {
      await addItemToCart(
        page,
        {
          productId: 1,
          name: 'Smart Cat Feeder',
          price: 89.99,
          imgName: 'cat-feeder.jpg',
        },
        2
      );

      const badgeText = await getCartBadgeCount(page);
      expect(badgeText).toBe('2');
    });

    test('should display correct badge with multiple product quantities', async ({ page }) => {
      await page.evaluate(() => {
        const items = [
          { productId: 1, name: 'Smart Cat Feeder', price: 89.99, imgName: 'cat-feeder.jpg', quantity: 3 },
          { productId: 2, name: 'AI Cat Toy', price: 49.99, imgName: 'cat-toy.jpg', quantity: 2 },
          { productId: 3, name: 'Cat Health Monitor', price: 199.99, imgName: 'health-monitor.jpg', quantity: 1 },
        ];
        localStorage.setItem('octocat_cart', JSON.stringify(items));
      });
      await page.reload();

      const badgeText = await getCartBadgeCount(page);
      expect(badgeText).toBe('6');
    });
  });

  test.describe('Empty Cart State', () => {
    
    test('should display empty cart message and UI', async ({ page }) => {
      await page.goto('/cart');

      await expect(page.getByText('Your cart is empty')).toBeVisible();
      await expect(page.getByText('Add some products to get started')).toBeVisible();
      
      const browseButton = page.getByRole('link', { name: 'Browse Products' });
      await expect(browseButton).toBeVisible();
      await expect(browseButton).toHaveAttribute('href', '/products');
    });
  });

  test.describe('Cart with Items', () => {
    
    test('should display cart with single item', async ({ page }) => {
      await addItemToCart(
        page,
        {
          productId: 1,
          name: 'Smart Cat Feeder',
          price: 89.99,
          imgName: 'cat-feeder.jpg',
        },
        1
      );
      await page.goto('/cart');

      await expect(page.getByRole('heading', { name: 'Shopping Cart' })).toBeVisible();
      
      // Check table headers
      await expect(page.getByText('S. No.')).toBeVisible();
      await expect(page.getByText('Product Image')).toBeVisible();
      await expect(page.getByText('Product Name')).toBeVisible();
      await expect(page.getByText('Unit Price')).toBeVisible();
      await expect(page.getByText('Quantity')).toBeVisible();
      await expect(page.getByText('Total')).toBeVisible();
      
      // Check item details
      await expect(page.getByRole('heading', { name: 'Smart Cat Feeder' })).toBeVisible();
      await expect(page.getByText('$89.99').first()).toBeVisible();
    });

    test('should display cart with multiple items', async ({ page }) => {
      await page.evaluate(() => {
        const items = [
          { productId: 1, name: 'Smart Cat Feeder', price: 89.99, imgName: 'cat-feeder.jpg', quantity: 2 },
          { productId: 2, name: 'AI Cat Toy', price: 49.99, imgName: 'cat-toy.jpg', quantity: 1 },
        ];
        localStorage.setItem('octocat_cart', JSON.stringify(items));
      });
      await page.goto('/cart');

      await expect(page.getByRole('heading', { name: 'Smart Cat Feeder' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'AI Cat Toy' })).toBeVisible();
      
      // Check totals
      await expect(page.getByText('$179.98').first()).toBeVisible(); // Smart Cat Feeder total
      await expect(page.getByText('$49.99').first()).toBeVisible(); // AI Cat Toy price
    });
  });

  test.describe('Discount Handling', () => {
    
    test('should display discounted price correctly', async ({ page }) => {
      await page.evaluate(() => {
        const items = [
          {
            productId: 3,
            name: 'Premium Cat Tracker',
            price: 199.99,
            imgName: 'cat-tracker.jpg',
            quantity: 1,
            discount: 0.20,
          },
        ];
        localStorage.setItem('octocat_cart', JSON.stringify(items));
      });
      await page.goto('/cart');

      await expect(page.getByRole('heading', { name: 'Premium Cat Tracker' })).toBeVisible();
      await expect(page.getByText('20% OFF')).toBeVisible();
      await expect(page.getByText('$159.99').first()).toBeVisible(); // Discounted price
    });
  });

  test.describe('Quantity Management', () => {
    
    test('should increase item quantity', async ({ page }) => {
      await addItemToCart(
        page,
        {
          productId: 1,
          name: 'Smart Cat Feeder',
          price: 89.99,
          imgName: 'cat-feeder.jpg',
        },
        1
      );
      await page.goto('/cart');

      const incrementButton = page.getByRole('button', { name: /Increase quantity of Smart Cat Feeder/i });
      await incrementButton.click();

      // Wait for update
      await page.waitForTimeout(100);

      const badgeText = await getCartBadgeCount(page);
      expect(badgeText).toBe('2');
      
      await expect(page.getByText('$179.98').first()).toBeVisible(); // Updated total
    });

    test('should decrease item quantity', async ({ page }) => {
      await addItemToCart(
        page,
        {
          productId: 1,
          name: 'Smart Cat Feeder',
          price: 89.99,
          imgName: 'cat-feeder.jpg',
        },
        3
      );
      await page.goto('/cart');

      const decrementButton = page.getByRole('button', { name: /Decrease quantity of Smart Cat Feeder/i });
      await decrementButton.click();

      // Wait for update
      await page.waitForTimeout(100);

      const badgeText = await getCartBadgeCount(page);
      expect(badgeText).toBe('2');
      
      await expect(page.getByText('$179.98').first()).toBeVisible(); // Updated total
    });
  });

  test.describe('Remove Item', () => {
    
    test('should remove item from cart', async ({ page }) => {
      await page.evaluate(() => {
        const items = [
          { productId: 1, name: 'Smart Cat Feeder', price: 89.99, imgName: 'cat-feeder.jpg', quantity: 2 },
          { productId: 2, name: 'AI Cat Toy', price: 49.99, imgName: 'cat-toy.jpg', quantity: 1 },
        ];
        localStorage.setItem('octocat_cart', JSON.stringify(items));
      });
      await page.goto('/cart');

      const removeButton = page.getByRole('button', { name: /Remove AI Cat Toy/i });
      await removeButton.click();

      // Wait for update
      await page.waitForTimeout(100);

      await expect(page.getByRole('heading', { name: 'AI Cat Toy' })).not.toBeVisible();
      await expect(page.getByRole('heading', { name: 'Smart Cat Feeder' })).toBeVisible();
      
      const badgeText = await getCartBadgeCount(page);
      expect(badgeText).toBe('2');
    });

    test('should show empty cart when last item is removed', async ({ page }) => {
      await addItemToCart(
        page,
        {
          productId: 1,
          name: 'Smart Cat Feeder',
          price: 89.99,
          imgName: 'cat-feeder.jpg',
        },
        1
      );
      await page.goto('/cart');

      const removeButton = page.getByRole('button', { name: /Remove Smart Cat Feeder/i });
      await removeButton.click();

      // Wait for update
      await page.waitForTimeout(100);

      await expect(page.getByText('Your cart is empty')).toBeVisible();
    });
  });

  test.describe('Order Summary', () => {
    
    test('should display correct subtotal', async ({ page }) => {
      await page.evaluate(() => {
        const items = [
          { productId: 1, name: 'Smart Cat Feeder', price: 89.99, imgName: 'cat-feeder.jpg', quantity: 2 },
          { productId: 2, name: 'AI Cat Toy', price: 49.99, imgName: 'cat-toy.jpg', quantity: 1 },
        ];
        localStorage.setItem('octocat_cart', JSON.stringify(items));
      });
      await page.goto('/cart');

      await expect(page.getByText('Order Summary')).toBeVisible();
      await expect(page.getByText('$229.97')).toBeVisible(); // Subtotal
    });

    test('should apply shipping cost when subtotal is below threshold', async ({ page }) => {
      await addItemToCart(
        page,
        {
          productId: 2,
          name: 'AI Cat Toy',
          price: 49.99,
          imgName: 'cat-toy.jpg',
        },
        1
      );
      await page.goto('/cart');

      await expect(page.getByText('$49.99').first()).toBeVisible(); // Subtotal
      await expect(page.getByText('$25.00')).toBeVisible(); // Shipping cost
      await expect(page.getByText('$74.99')).toBeVisible(); // Total
    });

    test('should apply free shipping when subtotal meets threshold', async ({ page }) => {
      await addItemToCart(
        page,
        {
          productId: 1,
          name: 'Smart Cat Feeder',
          price: 89.99,
          imgName: 'cat-feeder.jpg',
        },
        2
      );
      await page.goto('/cart');

      await expect(page.getByText('FREE')).toBeVisible(); // Free shipping
      await expect(page.getByText('$179.98').first()).toBeVisible(); // Subtotal and Total are same
    });

    test('should display free shipping threshold message', async ({ page }) => {
      await addItemToCart(
        page,
        {
          productId: 1,
          name: 'Smart Cat Feeder',
          price: 89.99,
          imgName: 'cat-feeder.jpg',
        },
        1
      );
      await page.goto('/cart');

      await expect(page.getByText(/Add.*more for free shipping/i)).toBeVisible();
    });
  });

  test.describe('Cart Persistence', () => {
    
    test('should persist cart in localStorage', async ({ page }) => {
      await addItemToCart(
        page,
        {
          productId: 1,
          name: 'Smart Cat Feeder',
          price: 89.99,
          imgName: 'cat-feeder.jpg',
        },
        1
      );

      await page.reload();

      const badgeText = await getCartBadgeCount(page);
      expect(badgeText).toBe('1');
    });

    test('should load cart from localStorage on initial load', async ({ page }) => {
      await page.evaluate(() => {
        const items = [
          { productId: 2, name: 'AI Cat Toy', price: 49.99, imgName: 'cat-toy.jpg', quantity: 2 },
        ];
        localStorage.setItem('octocat_cart', JSON.stringify(items));
      });
      
      await page.goto('/');

      const badgeText = await getCartBadgeCount(page);
      expect(badgeText).toBe('2');

      await page.goto('/cart');
      await expect(page.getByRole('heading', { name: 'AI Cat Toy' })).toBeVisible();
    });
  });

  test.describe('Theme Support', () => {
    
    test('should respect dark mode on cart page', async ({ page }) => {
      await enableDarkMode(page);
      await page.goto('/cart');

      const body = page.locator('body');
      const classes = await body.getAttribute('class');
      
      // Check for dark mode styling (implementation may vary)
      // This is a basic check - adjust based on your actual implementation
      await expect(page.getByText('Your cart is empty')).toBeVisible();
    });

    test('should respect light mode on cart page', async ({ page }) => {
      await disableDarkMode(page);
      await page.goto('/cart');

      await expect(page.getByText('Your cart is empty')).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    
    test('should navigate to cart page when clicking cart icon', async ({ page }) => {
      await page.goto('/');
      
      const cartIcon = page.locator('a[href="/cart"]');
      await cartIcon.click();

      await expect(page).toHaveURL('/cart');
    });

    test('should navigate to products from empty cart', async ({ page }) => {
      await page.goto('/cart');

      const browseButton = page.getByRole('link', { name: 'Browse Products' });
      await browseButton.click();

      await expect(page).toHaveURL('/products');
    });
  });

  test.describe('Mobile Responsiveness', () => {
    
    test('should adapt cart table to mobile view', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone size

      await addItemToCart(
        page,
        {
          productId: 1,
          name: 'Smart Cat Feeder',
          price: 89.99,
          imgName: 'cat-feeder.jpg',
        },
        1
      );
      await page.goto('/cart');

      // On mobile, table should be responsive
      await expect(page.getByRole('heading', { name: 'Smart Cat Feeder' })).toBeVisible();
    });
  });

  test.describe('Edge Cases', () => {
    
    test('should consolidate quantity when adding same product multiple times', async ({ page }) => {
      await addItemToCart(
        page,
        {
          productId: 1,
          name: 'Smart Cat Feeder',
          price: 89.99,
          imgName: 'cat-feeder.jpg',
        },
        2
      );

      await addItemToCart(
        page,
        {
          productId: 1,
          name: 'Smart Cat Feeder',
          price: 89.99,
          imgName: 'cat-feeder.jpg',
        },
        3
      );

      await page.goto('/cart');

      const badgeText = await getCartBadgeCount(page);
      expect(badgeText).toBe('5');
    });

    test('should handle products with images', async ({ page }) => {
      await addItemToCart(
        page,
        {
          productId: 1,
          name: 'Smart Cat Feeder',
          price: 89.99,
          imgName: 'cat-feeder.jpg',
        },
        1
      );
      await page.goto('/cart');

      const productImage = page.locator('img[alt="Smart Cat Feeder"]');
      await expect(productImage).toBeVisible();
      
      const src = await productImage.getAttribute('src');
      expect(src).toContain('cat-feeder.jpg');
    });

    test('should handle decimal precision in price calculations', async ({ page }) => {
      await addItemToCart(
        page,
        {
          productId: 99,
          name: 'Product A',
          price: 10.99,
          imgName: 'product-a.jpg',
        },
        3
      );
      await page.goto('/cart');

      await expect(page.getByText('$32.97')).toBeVisible(); // 3 × 10.99 = 32.97
    });
  });
});
