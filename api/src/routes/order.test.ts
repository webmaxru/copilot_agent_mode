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

    // Seed required foreign keys
    const db = await getDatabase();
    await db.run('INSERT INTO headquarters (headquarters_id, name) VALUES (?, ?)', [1, 'HQ One']);
    await db.run(
      'INSERT INTO branches (branch_id, headquarters_id, name, description, address, contact_person, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [1, 1, 'Branch One', 'Test branch', '123 St', 'John Doe', 'john@test.com', '555-1234'],
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
      orderDate: '2024-01-01',
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
      orderDate: '2024-01-01',
      name: 'Test Order',
      description: 'Test order description',
      status: 'pending',
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
      orderDate: '2024-01-01',
      name: 'Original Order',
      description: 'Original description',
      status: 'pending',
    };
    const createResponse = await request(app).post('/orders').send(newOrder);
    const orderId = createResponse.body.orderId;

    const updatedOrder = {
      ...newOrder,
      status: 'completed',
    };
    const response = await request(app).put(`/orders/${orderId}`).send(updatedOrder);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('completed');
  });

  it('should delete an order by ID', async () => {
    // First create an order to test deleting it
    const newOrder = {
      branchId: 1,
      orderDate: '2024-01-01',
      name: 'Delete Me Order',
      description: 'This order will be deleted',
      status: 'pending',
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
