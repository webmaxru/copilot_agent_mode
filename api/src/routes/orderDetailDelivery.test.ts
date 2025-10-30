import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import orderDetailDeliveryRouter from './orderDetailDelivery';
import { runMigrations } from '../db/migrate';
import { closeDatabase, getDatabase } from '../db/sqlite';
import { errorHandler } from '../utils/errors';

let app: express.Express;

describe('OrderDetailDelivery API', () => {
  beforeEach(async () => {
    // Ensure a fresh in-memory database for each test
    await closeDatabase();
    await getDatabase(true);
    await runMigrations(true);

    // Seed required foreign keys for the full hierarchy
    const db = await getDatabase();
    await db.run(
      'INSERT INTO headquarters (headquarters_id, name, description, address, contact_person, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [1, 'HQ One', 'Main HQ', '123 HQ St', 'HQ Manager', 'hq@test.com', '555-0000'],
    );
    await db.run(
      'INSERT INTO branches (branch_id, headquarters_id, name, description, address, contact_person, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [1, 1, 'Branch One', 'Main Branch', '456 Branch Ave', 'Branch Manager', 'branch@test.com', '555-0001'],
    );
    await db.run(
      'INSERT INTO orders (order_id, branch_id, order_date, name, description, status) VALUES (?, ?, ?, ?, ?, ?)',
      [1, 1, '2024-01-15T10:00:00Z', 'Order #1', 'Test order', 'pending'],
    );
    await db.run(
      'INSERT INTO suppliers (supplier_id, name, description, contact_person, email, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [1, 'Test Supplier', 'Test Description', 'John Doe', 'john@test.com', '555-1234'],
    );
    await db.run(
      'INSERT INTO products (product_id, supplier_id, name, description, price, sku, unit, img_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [1, 1, 'Test Product', 'Product Description', 29.99, 'TEST-001', 'piece', 'test.jpg'],
    );
    await db.run(
      'INSERT INTO order_details (order_detail_id, order_id, product_id, quantity, unit_price, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [1, 1, 1, 10, 29.99, 'Test order detail'],
    );
    await db.run(
      'INSERT INTO deliveries (delivery_id, supplier_id, delivery_date, name, description, status) VALUES (?, ?, ?, ?, ?, ?)',
      [1, 1, '2024-01-20T09:00:00Z', 'Delivery #1', 'Test delivery', 'pending'],
    );

    // Set up express app
    app = express();
    app.use(express.json());
    app.use('/order-detail-deliveries', orderDetailDeliveryRouter);
    // Attach error handler to translate repo errors
    app.use(errorHandler);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  it('should create a new order detail delivery', async () => {
    const newOrderDetailDelivery = {
      orderDetailId: 1,
      deliveryId: 1,
      quantity: 5,
      notes: 'Test order detail delivery',
    };
    const response = await request(app)
      .post('/order-detail-deliveries')
      .send(newOrderDetailDelivery);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(newOrderDetailDelivery);
    expect(response.body.orderDetailDeliveryId).toBeDefined();
  });

  it('should get all order detail deliveries', async () => {
    const response = await request(app).get('/order-detail-deliveries');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should get an order detail delivery by ID', async () => {
    // First create an order detail delivery to test getting it
    const newOrderDetailDelivery = {
      orderDetailId: 1,
      deliveryId: 1,
      quantity: 3,
      notes: 'Get test',
    };
    const createResponse = await request(app)
      .post('/order-detail-deliveries')
      .send(newOrderDetailDelivery);
    const orderDetailDeliveryId = createResponse.body.orderDetailDeliveryId;

    const response = await request(app).get(
      `/order-detail-deliveries/${orderDetailDeliveryId}`,
    );
    expect(response.status).toBe(200);
    expect(response.body.orderDetailDeliveryId).toBe(orderDetailDeliveryId);
    expect(response.body.quantity).toBe(3);
  });

  it('should update an order detail delivery by ID', async () => {
    // First create an order detail delivery to test updating it
    const newOrderDetailDelivery = {
      orderDetailId: 1,
      deliveryId: 1,
      quantity: 3,
      notes: 'Original notes',
    };
    const createResponse = await request(app)
      .post('/order-detail-deliveries')
      .send(newOrderDetailDelivery);
    const orderDetailDeliveryId = createResponse.body.orderDetailDeliveryId;

    const updatedOrderDetailDelivery = {
      ...newOrderDetailDelivery,
      quantity: 7,
    };
    const response = await request(app)
      .put(`/order-detail-deliveries/${orderDetailDeliveryId}`)
      .send(updatedOrderDetailDelivery);
    expect(response.status).toBe(200);
    expect(response.body.quantity).toBe(7);
  });

  it('should delete an order detail delivery by ID', async () => {
    // First create an order detail delivery to test deleting it
    const newOrderDetailDelivery = {
      orderDetailId: 1,
      deliveryId: 1,
      quantity: 2,
      notes: 'Delete me',
    };
    const createResponse = await request(app)
      .post('/order-detail-deliveries')
      .send(newOrderDetailDelivery);
    const orderDetailDeliveryId = createResponse.body.orderDetailDeliveryId;

    const response = await request(app).delete(
      `/order-detail-deliveries/${orderDetailDeliveryId}`,
    );
    expect(response.status).toBe(204);
  });

  it('should return 404 for non-existing order detail delivery', async () => {
    const response = await request(app).get('/order-detail-deliveries/999');
    expect(response.status).toBe(404);
  });
});
