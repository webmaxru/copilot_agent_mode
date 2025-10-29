import type { Page } from '@playwright/test';

/**
 * Test helper functions for cart e2e tests
 */

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  imgName: string;
  quantity: number;
  discount?: number;
}

/**
 * Clear all items from the cart
 */
export async function clearCart(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.removeItem('octocat_cart');
  });
}

/**
 * Add an item to the cart via localStorage
 */
export async function addItemToCart(
  page: Page,
  item: Omit<CartItem, 'quantity'>,
  quantity: number
): Promise<void> {
  await page.evaluate(
    ({ item, quantity }) => {
      const cart = JSON.parse(localStorage.getItem('octocat_cart') || '[]');
      const existingItem = cart.find((i: any) => i.productId === item.productId);

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

/**
 * Set cart items directly in localStorage
 */
export async function setCartItems(page: Page, items: CartItem[]): Promise<void> {
  await page.evaluate((items) => {
    localStorage.setItem('octocat_cart', JSON.stringify(items));
  }, items);
  await page.reload();
}

/**
 * Get the current cart badge count
 */
export async function getCartBadgeCount(page: Page): Promise<string | null> {
  const badge = page.locator('a[href="/cart"] ~ div, a[href="/cart"] span').first();
  const isVisible = await badge.isVisible().catch(() => false);
  return isVisible ? await badge.textContent() : null;
}

/**
 * Enable dark mode
 */
export async function enableDarkMode(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.setItem('darkMode', 'true');
  });
  await page.reload();
}

/**
 * Disable dark mode (enable light mode)
 */
export async function disableDarkMode(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.setItem('darkMode', 'false');
  });
  await page.reload();
}

/**
 * Get cart items from localStorage
 */
export async function getCartItems(page: Page): Promise<CartItem[]> {
  return await page.evaluate(() => {
    const cart = localStorage.getItem('octocat_cart');
    return cart ? JSON.parse(cart) : [];
  });
}

/**
 * Wait for cart to update after an action
 */
export async function waitForCartUpdate(page: Page, timeout = 500): Promise<void> {
  await page.waitForTimeout(timeout);
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

/**
 * Calculate discounted price
 */
export function calculateDiscountedPrice(price: number, discount: number): number {
  return price * (1 - discount);
}

/**
 * Calculate item total
 */
export function calculateItemTotal(price: number, quantity: number, discount?: number): number {
  const unitPrice = discount ? calculateDiscountedPrice(price, discount) : price;
  return unitPrice * quantity;
}

/**
 * Calculate cart subtotal
 */
export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    return total + calculateItemTotal(item.price, item.quantity, item.discount);
  }, 0);
}

/**
 * Calculate shipping cost
 */
export function calculateShipping(subtotal: number, freeShippingThreshold = 100): number {
  return subtotal >= freeShippingThreshold ? 0 : 25;
}

/**
 * Calculate grand total
 */
export function calculateTotal(items: CartItem[]): number {
  const subtotal = calculateSubtotal(items);
  const shipping = calculateShipping(subtotal);
  return subtotal + shipping;
}
