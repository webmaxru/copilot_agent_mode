import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import orderRouter from './order';
import { runMigrations } from '../db/migrate';
import { closeDatabase, getDatabase } from '../db/sqlite';
import { errorHandler } from '../utils/errors';

let app: express.Express;

describe('Order API', () => {
  beforeEach(async () => {
    // Ensure a fresh in-memory database for each test
    await closeDatabase();
    await getDatabase(true);
    await runMigrations(true);

    // Seed required foreign keys: headquarters and branch
    const db = await getDatabase();
    await db.run(
      'INSERT INTO headquarters (headquarters_id, name, description, address, contact_person, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [1, 'Test HQ', 'Test HQ desc', '123 HQ St', 'HQ Contact', 'hq@test.com', '555-0000'],
    );
    await db.run(
      'INSERT INTO branches (branch_id, headquarters_id, name, description, address, contact_person, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [1, 1, 'Test Branch', 'Test branch desc', '456 Branch Ave', 'Branch Contact', 'branch@test.com', '555-0001'],
    );

    // Set up express app
    app = express();
    app.use(express.json());
    app.use('/orders', orderRouter);
    // Attach error handler to translate repo errors
    app.use(errorHandler);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  it('should create a new order', async () => {
    const newOrder = {
      branchId: 1,
      orderDate: '2024-01-15T10:00:00Z',
      name: 'Test Order',
      description: 'Test order description',
      status: 'pending',
    };
    const response = await request(app).post('/orders').send(newOrder);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(newOrder);
    expect(response.body.orderId).toBeDefined();
  });

  it('should get all orders', async () => {
    const response = await request(app).get('/orders');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should get an order by ID', async () => {
    // First create an order to test getting it
    const newOrder = {
      branchId: 1,
      orderDate: '2024-01-15T11:00:00Z',
      name: 'Order To Get',
      description: 'Test order',
      status: 'processing',
    };
    const createResponse = await request(app).post('/orders').send(newOrder);
    const orderId = createResponse.body.orderId;

    const response = await request(app).get(`/orders/${orderId}`);
    expect(response.status).toBe(200);
    expect(response.body.orderId).toBe(orderId);
  });

  it('should update an order by ID', async () => {
    // First create an order to test updating it
    const newOrder = {
      branchId: 1,
      orderDate: '2024-01-15T12:00:00Z',
      name: 'Original Order',
      description: 'Original description',
      status: 'pending',
    };
    const createResponse = await request(app).post('/orders').send(newOrder);
    const orderId = createResponse.body.orderId;

    const updatedOrder = {
      ...newOrder,
      status: 'shipped',
      description: 'Updated description',
    };
    const response = await request(app).put(`/orders/${orderId}`).send(updatedOrder);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('shipped');
    expect(response.body.description).toBe('Updated description');
  });

  it('should delete an order by ID', async () => {
    // First create an order to test deleting it
    const newOrder = {
      branchId: 1,
      orderDate: '2024-01-15T13:00:00Z',
      name: 'Order To Delete',
      description: 'This order will be deleted',
      status: 'cancelled',
    };
    const createResponse = await request(app).post('/orders').send(newOrder);
    const orderId = createResponse.body.orderId;

    const response = await request(app).delete(`/orders/${orderId}`);
    expect(response.status).toBe(204);
  });

  it('should return 404 for non-existing order', async () => {
    const response = await request(app).get('/orders/999');
    expect(response.status).toBe(404);
  });
});
