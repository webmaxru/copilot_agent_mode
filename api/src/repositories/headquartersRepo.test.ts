import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HeadquartersRepository } from '../repositories/headquartersRepo';
import { Headquarters } from '../models/headquarters';
import { NotFoundError } from '../utils/errors';

// Mock the getDatabase function first
vi.mock('../db/sqlite', () => ({
  getDatabase: vi.fn(),
}));

// Import the mocked module
import { getDatabase } from '../db/sqlite';

describe('HeadquartersRepository', () => {
  let repository: HeadquartersRepository;
  let mockDb: any;

  const mockHeadquarters: Headquarters = {
    headquartersId: 1,
    name: 'Main HQ',
    description: 'Test Description',
    address: '123 Main St',
    contactPerson: 'John Doe',
    email: 'john@test.com',
    phone: '555-1234',
  };

  beforeEach(() => {
    // Create mock database connection
    mockDb = {
      db: {} as any,
      run: vi.fn(),
      get: vi.fn(),
      all: vi.fn(),
      close: vi.fn(),
    };

    // Mock getDatabase to return our mock
    (getDatabase as any).mockResolvedValue(mockDb);

    repository = new HeadquartersRepository(mockDb);
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all headquarters', async () => {
      const mockResults = [
        {
          headquarters_id: 1,
          name: 'Main HQ',
          description: 'Test',
          address: '123 Main St',
          contact_person: 'John',
          email: 'john@test.com',
          phone: '555-1234',
        },
      ];
      mockDb.all.mockResolvedValue(mockResults);

      const result = await repository.findAll();

      expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM headquarters ORDER BY headquarters_id');
      expect(result).toHaveLength(1);
      expect(result[0].headquartersId).toBe(1);
      expect(result[0].name).toBe('Main HQ');
    });

    it('should return empty array when no headquarters exist', async () => {
      mockDb.all.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return headquarters when found', async () => {
      const mockResult = {
        headquarters_id: 1,
        name: 'Main HQ',
        description: 'Test',
        address: '123 Main St',
        contact_person: 'John',
        email: 'john@test.com',
        phone: '555-1234',
      };
      mockDb.get.mockResolvedValue(mockResult);

      const result = await repository.findById(1);

      expect(mockDb.get).toHaveBeenCalledWith(
        'SELECT * FROM headquarters WHERE headquarters_id = ?',
        [1],
      );
      expect(result?.headquartersId).toBe(1);
      expect(result?.name).toBe('Main HQ');
    });

    it('should return null when headquarters not found', async () => {
      mockDb.get.mockResolvedValue(undefined);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new headquarters and return it', async () => {
      const newHeadquarters = {
        name: 'New HQ',
        description: 'New Description',
        address: '456 New Ave',
        contactPerson: 'Jane Doe',
        email: 'jane@test.com',
        phone: '555-5678',
      };

      mockDb.run.mockResolvedValue({ lastID: 2, changes: 1 });
      mockDb.get.mockResolvedValue({
        headquarters_id: 2,
        name: 'New HQ',
        description: 'New Description',
        address: '456 New Ave',
        contact_person: 'Jane Doe',
        email: 'jane@test.com',
        phone: '555-5678',
      });

      const result = await repository.create(newHeadquarters);

      expect(mockDb.run).toHaveBeenCalled();
      expect(result.headquartersId).toBe(2);
      expect(result.name).toBe('New HQ');
    });
  });

  describe('update', () => {
    it('should update existing headquarters and return updated data', async () => {
      const updateData = { name: 'Updated HQ' };

      mockDb.run.mockResolvedValue({ changes: 1 });
      mockDb.get.mockResolvedValue({
        headquarters_id: 1,
        name: 'Updated HQ',
        description: 'Test',
        address: '123 Main St',
        contact_person: 'John',
        email: 'john@test.com',
        phone: '555-1234',
      });

      const result = await repository.update(1, updateData);

      expect(mockDb.run).toHaveBeenCalled();
      expect(result.name).toBe('Updated HQ');
    });

    it('should throw NotFoundError when headquarters does not exist', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });

      await expect(repository.update(999, { name: 'Updated' })).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should delete existing headquarters', async () => {
      mockDb.run.mockResolvedValue({ changes: 1 });

      await repository.delete(1);

      expect(mockDb.run).toHaveBeenCalledWith(
        'DELETE FROM headquarters WHERE headquarters_id = ?',
        [1],
      );
    });

    it('should throw NotFoundError when headquarters does not exist', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });

      await expect(repository.delete(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('exists', () => {
    it('should return true when headquarters exists', async () => {
      mockDb.get.mockResolvedValue({ count: 1 });

      const result = await repository.exists(1);

      expect(result).toBe(true);
      expect(mockDb.get).toHaveBeenCalledWith(
        'SELECT COUNT(*) as count FROM headquarters WHERE headquarters_id = ?',
        [1],
      );
    });

    it('should return false when headquarters does not exist', async () => {
      mockDb.get.mockResolvedValue({ count: 0 });

      const result = await repository.exists(999);

      expect(result).toBe(false);
    });
  });

  describe('findByName', () => {
    it('should return headquarters matching name pattern', async () => {
      const mockResults = [
        {
          headquarters_id: 1,
          name: 'Main HQ',
          description: 'Test',
          address: '123 Main St',
          contact_person: 'John',
          email: 'john@test.com',
          phone: '555-1234',
        },
      ];
      mockDb.all.mockResolvedValue(mockResults);

      const result = await repository.findByName('Main');

      expect(mockDb.all).toHaveBeenCalledWith(
        'SELECT * FROM headquarters WHERE name LIKE ? ORDER BY name',
        ['%Main%'],
      );
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Main HQ');
    });
  });
});
