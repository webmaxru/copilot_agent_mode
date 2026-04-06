import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import productRouter from './product';
import { runMigrations } from '../db/migrate';
import { closeDatabase, getDatabase } from '../db/sqlite';
import { errorHandler } from '../utils/errors';

let app: express.Express;

describe('Product API', () => {
  beforeEach(async () => {
    await closeDatabase();
    await getDatabase(true);
    await runMigrations(true);

    // Seed required foreign key: supplier
    const db = await getDatabase();
    await db.run('INSERT INTO suppliers (supplier_id, name) VALUES (?, ?)', [1, 'Test Supplier']);

    app = express();
    app.use(express.json());
    app.use('/products', productRouter);
    app.use(errorHandler);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  it('should create a new product', async () => {
    const newProduct = {
      supplierId: 1,
      name: 'Smart Cat Feeder',
      description: 'AI-powered cat feeder',
      price: 49.99,
      sku: 'SCF-001',
      unit: 'piece',
      imgName: 'feeder.png',
    };
    const response = await request(app).post('/products').send(newProduct);
    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Smart Cat Feeder');
    expect(response.body.productId).toBeDefined();
    expect(response.body.price).toBe(49.99);
  });

  it('should get all products', async () => {
    const response = await request(app).get('/products');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should get a product by ID', async () => {
    const newProduct = {
      supplierId: 1,
      name: 'Findable Product',
      description: 'Product to find',
      price: 19.99,
      sku: 'FP-001',
      unit: 'piece',
      imgName: 'find.png',
    };
    const createResponse = await request(app).post('/products').send(newProduct);
    const productId = createResponse.body.productId;

    const response = await request(app).get(`/products/${productId}`);
    expect(response.status).toBe(200);
    expect(response.body.productId).toBe(productId);
    expect(response.body.name).toBe('Findable Product');
  });

  it('should update a product by ID', async () => {
    const newProduct = {
      supplierId: 1,
      name: 'Original Product',
      description: 'Original description',
      price: 29.99,
      sku: 'OP-001',
      unit: 'piece',
      imgName: 'orig.png',
    };
    const createResponse = await request(app).post('/products').send(newProduct);
    const productId = createResponse.body.productId;

    const updatedProduct = { ...newProduct, name: 'Updated Product', price: 39.99 };
    const response = await request(app).put(`/products/${productId}`).send(updatedProduct);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Updated Product');
    expect(response.body.price).toBe(39.99);
  });

  it('should delete a product by ID', async () => {
    const newProduct = {
      supplierId: 1,
      name: 'Delete Me Product',
      description: 'Will be deleted',
      price: 9.99,
      sku: 'DM-001',
      unit: 'piece',
      imgName: 'del.png',
    };
    const createResponse = await request(app).post('/products').send(newProduct);
    const productId = createResponse.body.productId;

    const response = await request(app).delete(`/products/${productId}`);
    expect(response.status).toBe(204);

    // Verify deletion
    const getResponse = await request(app).get(`/products/${productId}`);
    expect(getResponse.status).toBe(404);
  });

  it('should return 404 for non-existing product', async () => {
    const response = await request(app).get('/products/999');
    expect(response.status).toBe(404);
  });

  it('should return 404 when updating non-existing product', async () => {
    const response = await request(app)
      .put('/products/999')
      .send({ name: 'Does not exist' });
    expect(response.status).toBe(404);
  });

  it('should return 404 when deleting non-existing product', async () => {
    const response = await request(app).delete('/products/999');
    expect(response.status).toBe(404);
  });
});
