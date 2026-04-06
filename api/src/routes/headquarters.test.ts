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
    await closeDatabase();
    await getDatabase(true);
    await runMigrations(true);

    app = express();
    app.use(express.json());
    app.use('/headquarters', headquartersRouter);
    app.use(errorHandler);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  it('should create a new headquarters', async () => {
    const newHQ = {
      name: 'Test HQ',
      description: 'A test headquarters',
      address: '100 Test Ave',
      contactPerson: 'Admin Person',
      email: 'admin@hq.com',
      phone: '555-1000',
    };
    const response = await request(app).post('/headquarters').send(newHQ);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(newHQ);
    expect(response.body.headquartersId).toBeDefined();
  });

  it('should get all headquarters', async () => {
    const response = await request(app).get('/headquarters');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should get a headquarters by ID', async () => {
    const newHQ = {
      name: 'Findable HQ',
      description: 'HQ to find',
      address: '200 Find St',
      contactPerson: 'Finder',
      email: 'find@hq.com',
      phone: '555-2000',
    };
    const createResponse = await request(app).post('/headquarters').send(newHQ);
    const hqId = createResponse.body.headquartersId;

    const response = await request(app).get(`/headquarters/${hqId}`);
    expect(response.status).toBe(200);
    expect(response.body.headquartersId).toBe(hqId);
    expect(response.body.name).toBe('Findable HQ');
  });

  it('should update a headquarters by ID', async () => {
    const newHQ = {
      name: 'Original HQ',
      description: 'Original',
      address: '300 Original Ave',
      contactPerson: 'Original Person',
      email: 'original@hq.com',
      phone: '555-3000',
    };
    const createResponse = await request(app).post('/headquarters').send(newHQ);
    const hqId = createResponse.body.headquartersId;

    const updatedHQ = { ...newHQ, name: 'Updated HQ Name' };
    const response = await request(app).put(`/headquarters/${hqId}`).send(updatedHQ);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Updated HQ Name');
  });

  it('should delete a headquarters by ID', async () => {
    const newHQ = {
      name: 'Delete Me HQ',
      description: 'Will be deleted',
      address: '999 Delete Rd',
      contactPerson: 'Deleter',
      email: 'delete@hq.com',
      phone: '555-9000',
    };
    const createResponse = await request(app).post('/headquarters').send(newHQ);
    const hqId = createResponse.body.headquartersId;

    const response = await request(app).delete(`/headquarters/${hqId}`);
    expect(response.status).toBe(204);

    // Verify deletion
    const getResponse = await request(app).get(`/headquarters/${hqId}`);
    expect(getResponse.status).toBe(404);
  });

  it('should return 404 for non-existing headquarters', async () => {
    const response = await request(app).get('/headquarters/999');
    expect(response.status).toBe(404);
  });

  it('should return 404 when updating non-existing headquarters', async () => {
    const response = await request(app)
      .put('/headquarters/999')
      .send({ name: 'Does not exist' });
    expect(response.status).toBe(404);
  });

  it('should return 404 when deleting non-existing headquarters', async () => {
    const response = await request(app).delete('/headquarters/999');
    expect(response.status).toBe(404);
  });
});
