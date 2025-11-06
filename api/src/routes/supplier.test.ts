import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import supplierRouter from './supplier';
import { runMigrations } from '../db/migrate';
import { closeDatabase, getDatabase } from '../db/sqlite';
import { errorHandler } from '../utils/errors';

let app: express.Express;

describe('Supplier API', () => {
  beforeEach(async () => {
    // Ensure a fresh in-memory database for each test
    await closeDatabase();
    await getDatabase(true);
    await runMigrations(true);

    // Set up express app
    app = express();
    app.use(express.json());
    app.use('/suppliers', supplierRouter);
    // Attach error handler to translate repo errors
    app.use(errorHandler);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  it('should create a new supplier', async () => {
    const newSupplier = {
      name: 'Test Supplier',
      description: 'Test supplier description',
      contactPerson: 'John Doe',
      email: 'john@supplier.com',
      phone: '555-1234',
    };
    const response = await request(app).post('/suppliers').send(newSupplier);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(newSupplier);
    expect(response.body.supplierId).toBeDefined();
  });

  it('should get all suppliers', async () => {
    const response = await request(app).get('/suppliers');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should get a supplier by ID', async () => {
    // First create a supplier to test getting it
    const newSupplier = {
      name: 'Test Supplier',
      description: 'Test supplier description',
      contactPerson: 'John Doe',
      email: 'john@supplier.com',
      phone: '555-1234',
    };
    const createResponse = await request(app).post('/suppliers').send(newSupplier);
    const supplierId = createResponse.body.supplierId;

    const response = await request(app).get(`/suppliers/${supplierId}`);
    expect(response.status).toBe(200);
    expect(response.body.supplierId).toBe(supplierId);
  });

  it('should update a supplier by ID', async () => {
    // First create a supplier to test updating it
    const newSupplier = {
      name: 'Original Supplier',
      description: 'Original description',
      contactPerson: 'Original Person',
      email: 'original@supplier.com',
      phone: '555-0001',
    };
    const createResponse = await request(app).post('/suppliers').send(newSupplier);
    const supplierId = createResponse.body.supplierId;

    const updatedSupplier = {
      ...newSupplier,
      name: 'Updated Supplier Name',
    };
    const response = await request(app).put(`/suppliers/${supplierId}`).send(updatedSupplier);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Updated Supplier Name');
  });

  it('should delete a supplier by ID', async () => {
    // First create a supplier to test deleting it
    const newSupplier = {
      name: 'Delete Me Supplier',
      description: 'This supplier will be deleted',
      contactPerson: 'Delete Person',
      email: 'delete@supplier.com',
      phone: '555-9999',
    };
    const createResponse = await request(app).post('/suppliers').send(newSupplier);
    const supplierId = createResponse.body.supplierId;

    const response = await request(app).delete(`/suppliers/${supplierId}`);
    expect(response.status).toBe(204);
  });

  it('should return 404 for non-existing supplier', async () => {
    const response = await request(app).get('/suppliers/999');
    expect(response.status).toBe(404);
  });

  it('should handle update errors for non-existing supplier', async () => {
    const updateData = {
      name: 'Non-existent Supplier',
      description: 'Test',
      contactPerson: 'Test',
      email: 'test@test.com',
      phone: '555-1234',
    };
    const response = await request(app).put('/suppliers/999').send(updateData);
    expect(response.status).toBe(404);
  });

  it('should handle delete errors for non-existing supplier', async () => {
    const response = await request(app).delete('/suppliers/999');
    expect(response.status).toBe(404);
  });
});
