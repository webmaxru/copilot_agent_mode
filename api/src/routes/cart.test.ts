import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cartRouter from './cart';
import { runMigrations } from '../db/migrate';
import { closeDatabase, getDatabase } from '../db/sqlite';
import { errorHandler } from '../utils/errors';

let app: express.Express;

describe('Cart API', () => {
  beforeEach(async () => {
    // Ensure a fresh in-memory database for each test
    await closeDatabase();
    await getDatabase(true);
    await runMigrations(true);

    // Seed required foreign keys
    const db = await getDatabase();
    await db.run('INSERT INTO headquarters (headquarters_id, name) VALUES (?, ?)', [1, 'HQ One']);
    await db.run(
      'INSERT INTO branches (branch_id, headquarters_id, name) VALUES (?, ?, ?)',
      [1, 1, 'Branch One'],
    );
    await db.run('INSERT INTO suppliers (supplier_id, name) VALUES (?, ?)', [1, 'Supplier One']);
    await db.run(
      'INSERT INTO products (product_id, supplier_id, name, price, sku, unit) VALUES (?, ?, ?, ?, ?, ?)',
      [1, 1, 'Test Product', 99.99, 'TEST-001', 'piece'],
    );

    // Set up express app
    app = express();
    app.use(express.json());
    app.use('/cart', cartRouter);
    // Attach error handler to translate repo errors
    app.use(errorHandler);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  it('should get or create active cart for a branch', async () => {
    const response = await request(app).get('/cart/1');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      branchId: 1,
      status: 'cart',
      name: 'Shopping Cart',
    });
    expect(response.body.orderId).toBeDefined();
  });

  it('should return existing cart if already created', async () => {
    // Create first cart
    const response1 = await request(app).get('/cart/1');
    const cartId1 = response1.body.orderId;

    // Get cart again - should return same cart
    const response2 = await request(app).get('/cart/1');
    const cartId2 = response2.body.orderId;

    expect(cartId1).toBe(cartId2);
  });

  it('should add item to cart', async () => {
    // Create cart
    const cartResponse = await request(app).get('/cart/1');
    const cartId = cartResponse.body.orderId;

    // Add item
    const itemData = {
      productId: 1,
      quantity: 2,
      unitPrice: 99.99,
    };
    const response = await request(app).post(`/cart/${cartId}/items`).send(itemData);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      orderId: cartId,
      productId: 1,
      quantity: 2,
      unitPrice: 99.99,
    });
  });

  it('should get cart items with product details', async () => {
    // Create cart and add item
    const cartResponse = await request(app).get('/cart/1');
    const cartId = cartResponse.body.orderId;

    await request(app).post(`/cart/${cartId}/items`).send({
      productId: 1,
      quantity: 2,
      unitPrice: 99.99,
    });

    // Get cart items
    const response = await request(app).get(`/cart/${cartId}/items`);
    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0]).toMatchObject({
      productId: 1,
      quantity: 2,
      unitPrice: 99.99,
    });
    expect(response.body.items[0].product).toBeDefined();
    expect(response.body.items[0].product.name).toBe('Test Product');
    expect(response.body.total).toBe(199.98);
  });

  it('should update cart item quantity', async () => {
    // Create cart and add item
    const cartResponse = await request(app).get('/cart/1');
    const cartId = cartResponse.body.orderId;

    const addResponse = await request(app).post(`/cart/${cartId}/items`).send({
      productId: 1,
      quantity: 2,
      unitPrice: 99.99,
    });
    const itemId = addResponse.body.orderDetailId;

    // Update quantity
    const response = await request(app).put(`/cart/${cartId}/items/${itemId}`).send({
      quantity: 5,
    });
    expect(response.status).toBe(200);
    expect(response.body.quantity).toBe(5);
  });

  it('should remove item from cart', async () => {
    // Create cart and add item
    const cartResponse = await request(app).get('/cart/1');
    const cartId = cartResponse.body.orderId;

    const addResponse = await request(app).post(`/cart/${cartId}/items`).send({
      productId: 1,
      quantity: 2,
      unitPrice: 99.99,
    });
    const itemId = addResponse.body.orderDetailId;

    // Remove item
    const response = await request(app).delete(`/cart/${cartId}/items/${itemId}`);
    expect(response.status).toBe(204);

    // Verify item was removed
    const itemsResponse = await request(app).get(`/cart/${cartId}/items`);
    expect(itemsResponse.body.items).toHaveLength(0);
    expect(itemsResponse.body.total).toBe(0);
  });

  it('should checkout cart (convert to order)', async () => {
    // Create cart and add item
    const cartResponse = await request(app).get('/cart/1');
    const cartId = cartResponse.body.orderId;

    await request(app).post(`/cart/${cartId}/items`).send({
      productId: 1,
      quantity: 2,
      unitPrice: 99.99,
    });

    // Checkout
    const response = await request(app).post(`/cart/${cartId}/checkout`);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('pending');
    expect(response.body.orderId).toBe(cartId);
  });

  it('should upsert cart items (add quantity if product already exists)', async () => {
    // Create cart
    const cartResponse = await request(app).get('/cart/1');
    const cartId = cartResponse.body.orderId;

    // Add item first time
    await request(app).post(`/cart/${cartId}/items`).send({
      productId: 1,
      quantity: 2,
      unitPrice: 99.99,
    });

    // Add same item again - should increase quantity
    await request(app).post(`/cart/${cartId}/items`).send({
      productId: 1,
      quantity: 3,
      unitPrice: 99.99,
    });

    // Verify total quantity is 5
    const itemsResponse = await request(app).get(`/cart/${cartId}/items`);
    expect(itemsResponse.status).toBe(200);
    expect(itemsResponse.body).toBeDefined();
    expect(itemsResponse.body.items).toBeDefined();
    expect(itemsResponse.body.items).toHaveLength(1);
    expect(itemsResponse.body.items[0].quantity).toBe(5);
  });
});
