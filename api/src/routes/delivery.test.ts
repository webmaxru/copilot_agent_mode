import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import deliveryRouter from './delivery';
import { runMigrations } from '../db/migrate';
import { closeDatabase, getDatabase } from '../db/sqlite';
import { errorHandler } from '../utils/errors';

let app: express.Express;

describe('Delivery API', () => {
  beforeEach(async () => {
    // Ensure a fresh in-memory database for each test
    await closeDatabase();
    await getDatabase(true);
    await runMigrations(true);

    // Seed required foreign keys
    const db = await getDatabase();
    await db.run(
      'INSERT INTO suppliers (supplier_id, name, description, contact_person, email, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [1, 'Test Supplier', 'Test Description', 'John Doe', 'john@test.com', '555-1234'],
    );

    // Set up express app
    app = express();
    app.use(express.json());
    app.use('/deliveries', deliveryRouter);
    // Attach error handler to translate repo errors
    app.use(errorHandler);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  it('should create a new delivery', async () => {
    const newDelivery = {
      supplierId: 1,
      deliveryDate: '2024-01-20T09:00:00Z',
      name: 'Delivery #1',
      description: 'First test delivery',
      status: 'pending',
    };
    const response = await request(app).post('/deliveries').send(newDelivery);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(newDelivery);
    expect(response.body.deliveryId).toBeDefined();
  });

  it('should get all deliveries', async () => {
    const response = await request(app).get('/deliveries');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should get a delivery by ID', async () => {
    // First create a delivery to test getting it
    const newDelivery = {
      supplierId: 1,
      deliveryDate: '2024-01-21T10:00:00Z',
      name: 'Get Test Delivery',
      description: 'Test delivery for GET',
      status: 'pending',
    };
    const createResponse = await request(app).post('/deliveries').send(newDelivery);
    const deliveryId = createResponse.body.deliveryId;

    const response = await request(app).get(`/deliveries/${deliveryId}`);
    expect(response.status).toBe(200);
    expect(response.body.deliveryId).toBe(deliveryId);
    expect(response.body.name).toBe('Get Test Delivery');
  });

  it('should update a delivery by ID', async () => {
    // First create a delivery to test updating it
    const newDelivery = {
      supplierId: 1,
      deliveryDate: '2024-01-22T11:00:00Z',
      name: 'Original Delivery',
      description: 'Original description',
      status: 'pending',
    };
    const createResponse = await request(app).post('/deliveries').send(newDelivery);
    const deliveryId = createResponse.body.deliveryId;

    const updatedDelivery = {
      ...newDelivery,
      status: 'completed',
    };
    const response = await request(app).put(`/deliveries/${deliveryId}`).send(updatedDelivery);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('completed');
  });

  it('should update delivery status', async () => {
    // First create a delivery to test updating status
    const newDelivery = {
      supplierId: 1,
      deliveryDate: '2024-01-23T12:00:00Z',
      name: 'Status Test Delivery',
      description: 'Test delivery for status update',
      status: 'pending',
    };
    const createResponse = await request(app).post('/deliveries').send(newDelivery);
    const deliveryId = createResponse.body.deliveryId;

    const response = await request(app)
      .put(`/deliveries/${deliveryId}/status`)
      .send({ status: 'in_transit' });
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('in_transit');
  });

  it('should delete a delivery by ID', async () => {
    // First create a delivery to test deleting it
    const newDelivery = {
      supplierId: 1,
      deliveryDate: '2024-01-24T13:00:00Z',
      name: 'Delete Me Delivery',
      description: 'This delivery will be deleted',
      status: 'pending',
    };
    const createResponse = await request(app).post('/deliveries').send(newDelivery);
    const deliveryId = createResponse.body.deliveryId;

    const response = await request(app).delete(`/deliveries/${deliveryId}`);
    expect(response.status).toBe(204);
  });

  it('should return 404 for non-existing delivery', async () => {
    const response = await request(app).get('/deliveries/999');
    expect(response.status).toBe(404);
  });
});
