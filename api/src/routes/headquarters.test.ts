import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import headquartersRouter from './headquarters';
import { runMigrations } from '../db/migrate';
import { closeDatabase, getDatabase } from '../db/sqlite';
import { errorHandler } from '../utils/errors';

let app: express.Express;

describe('Headquarters API', () => {
  beforeEach(async () => {
    // Ensure a fresh in-memory database for each test
    await closeDatabase();
    await getDatabase(true);
    await runMigrations(true);

    // Set up express app
    app = express();
    app.use(express.json());
    app.use('/headquarters', headquartersRouter);
    // Attach error handler to translate repo errors
    app.use(errorHandler);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  it('should create a new headquarters', async () => {
    const newHeadquarters = {
      name: 'Main HQ',
      description: 'Main headquarters',
      address: '123 Main St',
      contactPerson: 'John Doe',
      email: 'john@hq.com',
      phone: '555-1234',
    };
    const response = await request(app).post('/headquarters').send(newHeadquarters);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(newHeadquarters);
    expect(response.body.headquartersId).toBeDefined();
  });

  it('should get all headquarters', async () => {
    const response = await request(app).get('/headquarters');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should get a headquarters by ID', async () => {
    // First create a headquarters to test getting it
    const newHeadquarters = {
      name: 'Test HQ',
      description: 'Test headquarters',
      address: '456 Test Ave',
      contactPerson: 'Jane Smith',
      email: 'jane@testhq.com',
      phone: '555-5678',
    };
    const createResponse = await request(app).post('/headquarters').send(newHeadquarters);
    const headquartersId = createResponse.body.headquartersId;

    const response = await request(app).get(`/headquarters/${headquartersId}`);
    expect(response.status).toBe(200);
    expect(response.body.headquartersId).toBe(headquartersId);
    expect(response.body.name).toBe('Test HQ');
  });

  it('should update a headquarters by ID', async () => {
    // First create a headquarters to test updating it
    const newHeadquarters = {
      name: 'Original HQ',
      description: 'Original description',
      address: '789 Original Rd',
      contactPerson: 'Bob Brown',
      email: 'bob@original.com',
      phone: '555-1111',
    };
    const createResponse = await request(app).post('/headquarters').send(newHeadquarters);
    const headquartersId = createResponse.body.headquartersId;

    const updatedHeadquarters = {
      ...newHeadquarters,
      name: 'Updated HQ',
      phone: '555-2222',
    };
    const response = await request(app)
      .put(`/headquarters/${headquartersId}`)
      .send(updatedHeadquarters);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Updated HQ');
    expect(response.body.phone).toBe('555-2222');
  });

  it('should delete a headquarters by ID', async () => {
    // First create a headquarters to test deleting it
    const newHeadquarters = {
      name: 'Delete Me HQ',
      description: 'This headquarters will be deleted',
      address: '999 Delete St',
      contactPerson: 'Delete Person',
      email: 'delete@test.com',
      phone: '555-9999',
    };
    const createResponse = await request(app).post('/headquarters').send(newHeadquarters);
    const headquartersId = createResponse.body.headquartersId;

    const response = await request(app).delete(`/headquarters/${headquartersId}`);
    expect(response.status).toBe(204);
  });

  it('should return 404 for non-existing headquarters', async () => {
    const response = await request(app).get('/headquarters/999');
    expect(response.status).toBe(404);
  });

  it('should return 404 when updating non-existing headquarters', async () => {
    const updateData = {
      name: 'Updated',
      description: 'Test',
      address: 'Test St',
      contactPerson: 'Test',
      email: 'test@test.com',
      phone: '555-0000',
    };
    const response = await request(app).put('/headquarters/999').send(updateData);
    expect(response.status).toBe(404);
  });

  it('should return 404 when deleting non-existing headquarters', async () => {
    const response = await request(app).delete('/headquarters/999');
    expect(response.status).toBe(404);
  });
});
