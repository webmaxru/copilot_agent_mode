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
    // Ensure a fresh in-memory database for each test
    await closeDatabase();
    await getDatabase(true);
    await runMigrations(true);

    // Seed required foreign key: supplier id 1
    const db = await getDatabase();
    await db.run('INSERT INTO suppliers (supplier_id, name) VALUES (?, ?)', [1, 'Supplier One']);

    // Set up express app
    app = express();
    app.use(express.json());
    app.use('/products', productRouter);
    // Attach error handler to translate repo errors
    app.use(errorHandler);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  it('should create a new product', async () => {
    const newProduct = {
      supplierId: 1,
      name: 'Test Product',
      description: 'A test product',
      price: 99.99,
      sku: 'TEST-001',
      unit: 'pcs',
      imgName: 'test.jpg',
    };
    const response = await request(app).post('/products').send(newProduct);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(newProduct);
    expect(response.body.productId).toBeDefined();
  });

  it('should get all products', async () => {
    const response = await request(app).get('/products');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should get a product by ID', async () => {
    // First create a product to test getting it
    const newProduct = {
      supplierId: 1,
      name: 'Widget',
      description: 'A useful widget',
      price: 29.99,
      sku: 'WID-001',
      unit: 'pcs',
      imgName: 'widget.jpg',
    };
    const createResponse = await request(app).post('/products').send(newProduct);
    const productId = createResponse.body.productId;

    const response = await request(app).get(`/products/${productId}`);
    expect(response.status).toBe(200);
    expect(response.body.productId).toBe(productId);
    expect(response.body.name).toBe('Widget');
  });

  it('should update a product by ID', async () => {
    // First create a product to test updating it
    const newProduct = {
      supplierId: 1,
      name: 'Original Product',
      description: 'Original description',
      price: 49.99,
      sku: 'ORG-001',
      unit: 'pcs',
      imgName: 'original.jpg',
    };
    const createResponse = await request(app).post('/products').send(newProduct);
    const productId = createResponse.body.productId;

    const updatedProduct = {
      ...newProduct,
      name: 'Updated Product',
      price: 59.99,
    };
    const response = await request(app).put(`/products/${productId}`).send(updatedProduct);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Updated Product');
    expect(response.body.price).toBe(59.99);
  });

  it('should delete a product by ID', async () => {
    // First create a product to test deleting it
    const newProduct = {
      supplierId: 1,
      name: 'Delete Me Product',
      description: 'This product will be deleted',
      price: 19.99,
      sku: 'DEL-001',
      unit: 'pcs',
      imgName: 'delete.jpg',
    };
    const createResponse = await request(app).post('/products').send(newProduct);
    const productId = createResponse.body.productId;

    const response = await request(app).delete(`/products/${productId}`);
    expect(response.status).toBe(204);
  });

  it('should return 404 for non-existing product', async () => {
    const response = await request(app).get('/products/999');
    expect(response.status).toBe(404);
  });

  it('should return 404 when updating non-existing product', async () => {
    const updateData = {
      supplierId: 1,
      name: 'Updated',
      description: 'Test',
      price: 99.99,
      sku: 'UPD-999',
      unit: 'pcs',
      imgName: 'update.jpg',
    };
    const response = await request(app).put('/products/999').send(updateData);
    expect(response.status).toBe(404);
  });

  it('should return 404 when deleting non-existing product', async () => {
    const response = await request(app).delete('/products/999');
    expect(response.status).toBe(404);
  });
});
