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
    await closeDatabase();
    await getDatabase(true);
    await runMigrations(true);

    app = express();
    app.use(express.json());
    app.use('/suppliers', supplierRouter);
    app.use(errorHandler);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  it('should create a new supplier', async () => {
    const newSupplier = {
      name: 'Test Supplier',
      description: 'A test supplier',
      contactPerson: 'John Doe',
      email: 'john@test.com',
      phone: '555-0001',
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
    const newSupplier = {
      name: 'Findable Supplier',
      description: 'A supplier to find',
      contactPerson: 'Jane Doe',
      email: 'jane@test.com',
      phone: '555-0002',
    };
    const createResponse = await request(app).post('/suppliers').send(newSupplier);
    const supplierId = createResponse.body.supplierId;

    const response = await request(app).get(`/suppliers/${supplierId}`);
    expect(response.status).toBe(200);
    expect(response.body.supplierId).toBe(supplierId);
    expect(response.body.name).toBe('Findable Supplier');
  });

  it('should update a supplier by ID', async () => {
    const newSupplier = {
      name: 'Original Supplier',
      description: 'Original description',
      contactPerson: 'Original Person',
      email: 'original@test.com',
      phone: '555-0003',
    };
    const createResponse = await request(app).post('/suppliers').send(newSupplier);
    const supplierId = createResponse.body.supplierId;

    const updatedSupplier = { ...newSupplier, name: 'Updated Supplier Name' };
    const response = await request(app).put(`/suppliers/${supplierId}`).send(updatedSupplier);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Updated Supplier Name');
  });

  it('should delete a supplier by ID', async () => {
    const newSupplier = {
      name: 'Delete Me Supplier',
      description: 'Will be deleted',
      contactPerson: 'Delete Person',
      email: 'delete@test.com',
      phone: '555-9999',
    };
    const createResponse = await request(app).post('/suppliers').send(newSupplier);
    const supplierId = createResponse.body.supplierId;

    const response = await request(app).delete(`/suppliers/${supplierId}`);
    expect(response.status).toBe(204);

    // Verify deletion
    const getResponse = await request(app).get(`/suppliers/${supplierId}`);
    expect(getResponse.status).toBe(404);
  });

  it('should return 404 for non-existing supplier', async () => {
    const response = await request(app).get('/suppliers/999');
    expect(response.status).toBe(404);
  });

  it('should return 404 when updating non-existing supplier', async () => {
    const response = await request(app)
      .put('/suppliers/999')
      .send({ name: 'Does not exist' });
    expect(response.status).toBe(404);
  });

  it('should return 404 when deleting non-existing supplier', async () => {
    const response = await request(app).delete('/suppliers/999');
    expect(response.status).toBe(404);
  });
});
